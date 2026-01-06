import User from "../models/user.model.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import logger from "../config/logger.js";
import { AUTH_MESSAGES } from "../utils/constants.js"
import { logWithMeta } from "../utils/logger.js";

const {
    REQUIRED_FIELDS,
    INVALID_CREDENTIALS,
    LOGIN_SUCCESS } = AUTH_MESSAGES;

const generateAccessToken = (userId, email, role) => {
    return jwt.sign(
        {
            id: userId,
            email,
            role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
    );
};

const generateTokens = async (user) => {
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const formatUserResponse = (user) => {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const setCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    };

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, cookieOptions);
};

const register = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        password,
        role = 'CUSTOMER'
    } = req.body;

    logger.info('Registration attempt started', { email, role });
    logger.authLogger.info('User registration attempt', { email, timestamp: new Date().toISOString() });

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
        logger.warn('Registration failed - Email already exists', { email: normalizedEmail });
        logger.authLogger.warn('Registration failed - Duplicate email', {
            email: normalizedEmail,
            timestamp: new Date().toISOString()
        });
        throw new ApiError(409, 'Email already registered');
    }

    logger.debug('Creating user in database', { email: normalizedEmail, role });
    const user = await User.create({
        fullName: {
            firstName: fullName.firstName.trim(),
            lastName: fullName.lastName.trim()
        },
        email: normalizedEmail,
        password,
        role,
    });

    logger.info('User created successfully', {
        userId: user._id,
        email: normalizedEmail,
        role: user.role
    });

    logger.debug('Generating tokens for user', { userId: user._id });
    const { accessToken, refreshToken } = await generateTokens(user);

    const userResponse = formatUserResponse(user);

    setCookies(res, accessToken, refreshToken);

    logger.info('User registered and tokens generated', {
        userId: user._id,
        email: normalizedEmail
    });
    logger.authLogger.info('User registration successful', {
        userId: user._id,
        email: normalizedEmail,
        role: user.role,
        timestamp: new Date().toISOString()
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: {
                        accessToken: process.env.ACCESS_TOKEN_EXPIRY || '1h',
                        refreshToken: process.env.REFRESH_TOKEN_EXPIRY || '30d'
                    }
                }
            },
            'User registered successfully'
        )
    );
});

const login = asyncHandler(async (req, res) => {
    const { email, password, role = 'CUSTOMER' } = req.body;

    logWithMeta("This is working", { password, role })

    if (!email || !password || !role) {
        throw new ApiError(400, REQUIRED_FIELDS);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // First check if user exists at all
    const userExists = await User.findOne({ email: normalizedEmail });
    console.log('User exists:', !!userExists); // Debug log
    if (userExists) {
        console.log('User role in DB:', userExists.role); // Debug log
    }

    const user = await User.findOne({
        email: normalizedEmail,
        role: { $regex: new RegExp(`^${role}$`, "i") }
    }).select("+password");

    if (!user) {
        logger.warn('Auth failed: User not found or role mismatch', { email: normalizedEmail, role });
        throw new ApiError(401, INVALID_CREDENTIALS);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log('Password valid:', isPasswordValid); // Debug log

    if (!isPasswordValid) {
        throw new ApiError(401, INVALID_CREDENTIALS);
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    const loggedInUser = user.toObject();
    delete loggedInUser.password;

    setCookies(res, accessToken, refreshToken);

    return res.status(200).json(
        new ApiResponse(200, { user: loggedInUser, tokens: { accessToken, refreshToken } }, LOGIN_SUCCESS)
    );
});

const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    logger.info('Logout request received', { userId: req.user._id });
    logger.authLogger.info('User logout attempt', {
        userId: req.user._id,
        email: req.user.email,
        timestamp: new Date().toISOString()
    });

    if (refreshToken) {
        logger.debug('Clearing refresh token from database', { userId: req.user._id });
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
    }

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    logger.info('User logged out successfully', {
        userId: req.user._id,
        email: req.user.email
    });
    logger.authLogger.info('User logout successful', {
        userId: req.user._id,
        email: req.user.email,
        timestamp: new Date().toISOString()
    });

    return res.status(200).json(
        new ApiResponse(200, null, 'Logout successful')
    );
});

export {
    register,
    login,
    logout
}
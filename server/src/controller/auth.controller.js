import User from "../models/user.model.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import logger from "../config/logger.js";

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
        isActive: user.isActive,
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

    logger.debug('Hashing password for user', { email: normalizedEmail });
    const hashedPassword = await bcrypt.hash(password, 12);

    logger.debug('Creating user in database', { email: normalizedEmail, role });
    const user = await User.create({
        fullName: {
            firstName: fullName.firstName.trim(),
            lastName: fullName.lastName.trim()
        },
        email: normalizedEmail,
        password: hashedPassword,
        role,
        isActive: true
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
    const { email, password } = req.body;

    logger.info('Login attempt started', { email });
    logger.authLogger.info('User login attempt', { email, timestamp: new Date().toISOString() });

    if (!email || !password) {
        logger.warn('Login failed - Missing credentials');
        throw new ApiError(400, 'Email and password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    logger.debug('Fetching user from database', { email: normalizedEmail });
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
        logger.warn('Login failed - User not found', { email: normalizedEmail });
        logger.authLogger.warn('Login failed - Invalid credentials', {
            email: normalizedEmail,
            timestamp: new Date().toISOString()
        });
        throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
        logger.warn('Login failed - Account deactivated', {
            userId: user._id,
            email: normalizedEmail
        });
        logger.authLogger.warn('Login failed - Account deactivated', {
            userId: user._id,
            email: normalizedEmail,
            timestamp: new Date().toISOString()
        });
        throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    logger.debug('Verifying password', { userId: user._id });
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        logger.warn('Login failed - Invalid password', {
            userId: user._id,
            email: normalizedEmail
        });
        logger.authLogger.warn('Login failed - Wrong password', {
            userId: user._id,
            email: normalizedEmail,
            timestamp: new Date().toISOString()
        });
        throw new ApiError(401, 'Invalid email or password');
    }

    logger.debug('Generating tokens for user', { userId: user._id });
    const { accessToken, refreshToken } = await generateTokens(user);

    const userResponse = formatUserResponse(user);

    setCookies(res, accessToken, refreshToken);

    logger.info('User logged in successfully', {
        userId: user._id,
        email: normalizedEmail,
        role: user.role
    });
    logger.authLogger.info('User login successful', {
        userId: user._id,
        email: normalizedEmail,
        role: user.role,
        timestamp: new Date().toISOString()
    });

    return res.status(200).json(
        new ApiResponse(
            200,
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
            'Login successful'
        )
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
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import User from "../../models/user.model.js";
import { logWithMeta } from "../../utils/logger.js";

const TOKEN_CONFIG = {
    access: {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiry: process.env.ACCESS_TOKEN_EXPIRY || '1h',
        expiryMs: 60 * 60 * 1000
    },
    refresh: {
        secret: process.env.REFRESH_TOKEN_SECRET
    }
};

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
};

const isAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, TOKEN_CONFIG.access.secret);
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                throw new ApiError(401, "Session expired, please login again");
            }

            try {
                const decodedRefresh = jwt.verify(refreshToken, TOKEN_CONFIG.refresh.secret);
                const user = await User.findById(decodedRefresh?.id).select("+refreshToken");

                if (!user || user.refreshToken !== refreshToken) {
                    throw new ApiError(401, "Invalid refresh token");
                }

                const newAccessToken = jwt.sign(
                    { id: user._id, email: user.email, role: user.role },
                    TOKEN_CONFIG.access.secret,
                    { expiresIn: TOKEN_CONFIG.access.expiry }
                );

                res.cookie('accessToken', newAccessToken, {
                    ...COOKIE_OPTIONS,
                    maxAge: TOKEN_CONFIG.access.expiryMs
                });

                const userObj = user.toObject();
                delete userObj.password;
                delete userObj.refreshToken;
                req.user = userObj;

                return next();

            } catch (refreshError) {
                throw new ApiError(401, "Session expired, please login again");
            }
        }

        throw error instanceof ApiError
            ? error
            : new ApiError(401, error?.message || "Invalid access token");
    }
});


const isAdmin = asyncHandler(async (req, res, next) => {
    const accessToken =
        req.cookies?.accessToken;
    logWithMeta("Recived ✅", accessToken)
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.id)
            .select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        if (user.role !== "ADMIN") {
            throw new ApiError(403, "Access denied. Admin privileges required");
        }

        req.user = user;
        return next();

    } catch (error) {
        if (error.name !== "TokenExpiredError") {
            throw error instanceof ApiError
                ? error
                : new ApiError(401, "Invalid access token");
        }


        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new ApiError(401, "Session expired, please login again");
        }

        let decodedRefresh;
        try {
            decodedRefresh = jwt.verify(
                refreshToken,
                TOKEN_CONFIG.refresh.secret
            );
        } catch {
            throw new ApiError(401, "Session expired, please login again");
        }

        const user = await User.findById(decodedRefresh.id)
            .select("+refreshToken -password");

        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (user.role !== "ADMIN") {
            throw new ApiError(403, "Access denied. Admin privileges required");
        }

        const newAccessToken = jwt.sign(
            { id: user._id, role: user.role },
            TOKEN_CONFIG.access.secret,
            { expiresIn: TOKEN_CONFIG.access.expiry }
        );

        res.cookie("accessToken", newAccessToken, {
            ...COOKIE_OPTIONS,
            maxAge: TOKEN_CONFIG.access.expiryMs
        });

        const userObj = user.toObject();
        delete userObj.refreshToken;

        req.user = userObj;
        return next();
    }
});



export { isAdmin, isAuth }
import { ACCESS_TOKEN_SECRETE, REFRESH_TOKEN_SECRETE } from "../config/server-config.js";
import { CLIENT_ERROR, SERVER_ERROR } from "../constant.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";


export const verifyAccessToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(CLIENT_ERROR.UNAUTHORIZED, "User unauthorized!");
        }

        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRETE);

        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");        
        if (!user) {
            throw new ApiError(CLIENT_ERROR.UNAUTHORIZED, "User unauthorized!");
        }
    
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.UNAUTHORIZED,
            error?.message || "Invalid Access Token"
        );
    }
});

export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
    try {
        const incomingToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");        
        if (!incomingToken) {
            throw new ApiError(CLIENT_ERROR.UNAUTHORIZED, "User unauthorized!");
        }

        const decodedToken = jwt.verify(incomingToken, REFRESH_TOKEN_SECRETE);
        const user = await User.findById(decodedToken?.id).select("-password"); 
        
        if (!user) {
            throw new ApiError(CLIENT_ERROR.UNAUTHORIZED, "Refresh token invalid or expired");
        }

        req.token = incomingToken;
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.UNAUTHORIZED,
            error?.message || "Invalid Refresh Token"
        );
    }
})
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { CLIENT_ERROR, SERVER_ERROR } from "../constant.js";
import { generateAccessAndRefreshToken } from "../utils/helper-methods.js";
import { changePassword } from "../controllers/user.controller.js";
import mongoose from "mongoose";

const registerUserService = async (data, files) => {
    try {
        const { username, password, fullName, email } = data;

        if ([username, password, fullName, email].some(field => !field?.trim())) {
            throw new ApiError(400, "Required fields missing");
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existedUser) {
            throw new ApiError(409, "User already registered!");
        }

        const avatarLocalPath = files?.avatar?.[0]?.path;
        const coverImageLocalPath = files?.coverImage?.[0]?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }

        const avatarUrl = await uploadCloudinary(avatarLocalPath);
        const coverImageUrl = coverImageLocalPath
            ? await uploadCloudinary(coverImageLocalPath)
            : "";

        const user = await User.create({
            username: username.toLowerCase(),
            avatar: avatarUrl,
            coverImage: coverImageUrl,
            email,
            password,
            fullName
        });

        const createdUser = await User.findById(user._id)
            .select("-password -refreshToken");

        return createdUser;

    } catch (error) {

        // Optional: log error (production)
        console.error("Register Service Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Something went wrong while registering user"
        );
    }
};

const loginUserService = async (data) => {
    try {
        const { username, email, password } = data;

        if ((!username && !email) || !password) {
            throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "Missing Required Fields: [username/email, password]");
        }

        const user = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (!user) {
            throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "User does not exist with this username or email.");
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(CLIENT_ERROR.UNAUTHORIZED, "Incorrect Password!");
        }

        const tokens = generateAccessAndRefreshToken(user);
        console.log("user------------", user);

        return tokens;

    } catch (error) {
        console.error("Login Service Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Invallid Credentials!"
        );
    }
}

const logoutUserService = async (user) => {
    try {
        await User.findByIdAndUpdate(
            user._id,
            {
                $set: { refreshToken: null }
            },
            { new: true }
        );
    } catch (error) {
        throw new ApiError(SERVER_ERROR.INTERNAL_SERVER_ERROR, "Something went wrong!");
    }
}

const refreshAccessTokenService = (incomingToken, user) => {
    try {
        if (incomingToken !== user.refreshToken) {
            throw new ApiError(CLIENT_ERROR.UNAUTHORIZED, "Refresh token does not match or used already");
        }

        const refreshedTokens = generateAccessAndRefreshToken(user);
        return refreshedTokens;
    } catch (error) {
        console.error("Refresh Service Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Invallid Credentials!"
        );
    }
}

const changePasswordService = async (oldPassword, newPassword, userId) => {
    try {
        const user = await User.findById(userId);
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(CLIENT_ERROR.UNAUTHORIZED, "Incorrect Old Password!");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSaving: false });
    } catch (error) {
        console.error("Change Password Service Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Something went wrong while updating password."
        );
    }
}

const updateAccountDetailsService = async (data, userId) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    fullName: data?.fullName,
                    email: data?.email
                }
            },
            { new: true }
        ).select("-password");

        return user;
    } catch (error) {
        console.error("Update User Service Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Something went wrong while updating account details."
        );
    }
}

const updateImageService = async (localFilePath, userId) => {
    try {
        const imageUrl = await uploadCloudinary(localFilePath);
        if (!imageUrl) {
            throw new ApiError(SERVER_ERROR.INTERNAL_SERVER_ERROR, "Error while uploading the image");
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: { avatar: imageUrl }
            },
            { new: true }
        ).select("-password");

        return user;
    } catch (error) {
        console.error("Update User Service Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Something went wrong while the image."
        );
    }
}

const getUserChannelProfileService = async (username, userId) => {
    try {
        const channel = await User.aggregate([
            {
                $match: { username }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    subscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [userId, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1
                }
            }
        ]);
        console.log("channel----------", channel);

        if (!channel?.length) {
            throw new ApiError(CLIENT_ERROR.NOT_FOUND, "Channel not found!")
        }

        return channel;

    } catch (error) {
        console.error("Get User Profile Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Unable to fetch user profile!"
        );
    }
}

const getWatchHistoryService = async (userId) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    },
                                    {
                                        $addFields: {
                                            owner: {
                                                $first: "$owner"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]);

        if (!user) {
            throw new ApiError(CLIENT_ERROR.NOT_FOUND, "User not found!");
        }

        return user.watchHistory;

    } catch (error) {
        console.error("Get Watch History Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Unable to fetch watch history!"
        );
    }
}

export {
    registerUserService,
    loginUserService,
    logoutUserService,
    refreshAccessTokenService,
    changePasswordService,
    updateAccountDetailsService,
    updateImageService,
    getUserChannelProfileService,
    getWatchHistoryService
}
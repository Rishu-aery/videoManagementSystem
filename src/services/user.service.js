// import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/api-response.js";

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

        // If it's already an ApiError, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }

        // Otherwise throw generic error
        throw new ApiError(
            500,
            "Something went wrong while registering user"
        );
    }
};

export {
    registerUserService
}
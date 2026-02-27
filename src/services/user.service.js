import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { CLIENT_ERROR, SERVER_ERROR } from "../constant.js";
import { generateAccessAndRefreshToken } from "../utils/helper-methods.js";

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

const loginUser = async (data) => {
    try {
        const [username, email, password] = data;

        if ((!username && !email) || !password) {
            throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "Missing Required Fields: [username/email, password]");
        }

        const user = await User.findOne({
            $or: {username, email}
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
        console.error("Login Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Invallid Credentials!"
        );
    }
}

const logoutUser = async (user) => {
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

export {
    registerUserService,
    loginUser,
    logoutUser
}
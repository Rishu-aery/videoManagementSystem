import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { registerUserService,
    loginUserService,
    logoutUserService,
    refreshAccessTokenService,
    changePasswordService,
    updateAccountDetailsService,
    updateImageService,
    getUserChannelProfileService,
    getWatchHistoryService
} from "../services/user.service.js";
import { CLIENT_ERROR, SUCCESS } from "../constant.js";
import { ApiError } from "../utils/api-error.js";

const cookieOptions = {
    httpOnly: true,
    secure: true
};


const registerUser = asyncHandler(async (req, res) => {
    // get user detail from body
    // add validation in data
    // check user if already exists: username or email
    // parse the files and upload to cloudinary: avatar & cover image
    // encrypt the password
    // save the user details in mongoDB
    // return the response
    const user = await registerUserService(req.body, req.files);

    res.status(201).json(
        new ApiResponse(201, user, "User Registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // fetch data from body -- username/email, password
    // add validation for data
    // check if username or email is registered or not
    // if registered check if password is valid or not
    // if passwword correct generate the access and refresh token
    // send cookies in the response
    const {accessToken, refreshToken} = await loginUserService(req.body);

    res.status(SUCCESS.OK)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            SUCCESS.OK,
            {
                accessToken,
                refreshToken
            },
            "User loggedIn successfully."
        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    await logoutUserService(req.user);

    res.status(SUCCESS.OK)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(
        SUCCESS.OK,
        {},
        "User logged out."
    ))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // fetch refresh token from cookies or header
    // check token is available in request
    // verify refrest token using jwt
    // if token is valid find user with that token in db
    // check if user exist
    // if yes match the req token with saved token
    // if matched generate the new access token and refresh token
    // returnthe token in response
    const { accessToken, refreshToken } = refreshAccessTokenService(req.token, req.user);

    res.status(SUCCESS.OK)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            SUCCESS.OK,
            {
                accessToken,
                refreshToken
            },
            "Token refreshed Successfully"
        )
    );
});

const changePassword = asyncHandler(async (req, res) => {
    // check if user is authorized or not using auth middleware
    // fetch old and new password from request
    // validate new and old password should not be same and required
    // check if the old password is correct.
    // if correct, update the old password with new password
    // return the success response

    const {oldPassword, newPassword} = req.body;

    if ((!oldPassword || !newPassword) || (oldPassword === newPassword)) {
        throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "oldPassword and newPassword is required and should not be same");
    }

    await changePasswordService(oldPassword, newPassword, req.user?._id);

    res.status(SUCCESS.OK).json(new ApiResponse(SUCCESS.OK, {}, "Password Updated Successfully."));
});

const getCurrentUser = asyncHandler(async (req,res) => {
    res.status(SUCCESS.OK).json(new ApiResponse(SUCCESS.OK, req.user, "Fetched current user info."));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;
    if (!fullName && !email) {
        throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "Atleast One of the field is required [fullName, email].");
    }

    const user = await updateAccountDetailsService(req.body, req?.user?._id);

    res.status(SUCCESS.CREATED).json(new ApiResponse(
        SUCCESS.CREATED,
        user,
        "User updated successfully"
    ));
});

const updateAvatarImage = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file.path;
    console.log("avatarLocalPath------", avatarLocalPath);
    if (!avatarLocalPath) {
        throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "Avatar image is required.");
    }

    const user = await updateImageService(avatarLocalPath, req.user?._id);

    res.status(SUCCESS.CREATED).json(new ApiResponse(
        SUCCESS.CREATED,
        user,
        "Avatar image updated successfully."
    ));
    
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file.path;
    console.log("coverImageLocalPath------", coverImageLocalPath);
    if (!coverImageLocalPath) {
        throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "Cover image is required.");
    }

    const user = await updateImageService(coverImageLocalPath, req.user?._id);

    res.status(SUCCESS.CREATED).json(new ApiResponse(
        SUCCESS.CREATED,
        user,
        "Cover image updated successfully."
    ));
    
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;

    if (!username) {
        throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "username is required!");
    }

    const channel = await getUserChannelProfileService(username, req.user._id);

    res.status(SUCCESS.OK).json(new ApiResponse(
        SUCCESS,
        channel,
        "channel details fetched successfully."
    ))
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const history = await getWatchHistoryService(req.user._id);
    res.status(SUCCESS.OK).json(new ApiResponse(
        SUCCESS.OK,
        history,
        "Watch history fetched successfully!."
    ))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatarImage,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { registerUserService,
    loginUserService,
    logoutUserService,
    refreshAccessTokenService
} from "../services/user.service.js";
import { SUCCESS } from "../constant.js";

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

const refreshAccessToken = asyncHandler((req, res) => {
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
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
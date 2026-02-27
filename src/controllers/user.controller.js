import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { registerUserService, loginUser, logoutUser} from "../services/user.service.js";
import { SUCCESS } from "../constant.js";


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
    const [accessToken, refreshToken] = await loginUser(req.body);

    const options = {
        httpOnly: true,
        secure: true
    };

    res.status(SUCCESS.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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
    await logoutUser(req.user);

    const options = {
        httpOnly: true,
        secure: true
    };

    res.status(SUCCESS.OK)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(
        SUCCESS.OK,
        {},
        "User logged out."
    ))
})

export {
    registerUser,
    loginUser,
    logoutUser
}
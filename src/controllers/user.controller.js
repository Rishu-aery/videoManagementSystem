import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { registerUserService } from "../services/user.service.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user detail from body
    // add validation in data
    // check user if already exists: username or email
    // parse the files and upload to cloudinary: avatar & cover image
    // encrypt the password
    // save the user details in mongoDB
    // generate access token
    const user = await registerUserService(req.body, req.files);

    res.status(201).json(
        new ApiResponse(201, user, "User Registered Successfully")
    );
});

export {
    registerUser
}
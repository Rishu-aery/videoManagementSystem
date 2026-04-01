import { CLIENT_ERROR, SUCCESS } from "../constant.js";
import { publishVideoService } from "../services/video.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js"

const publishVideo = asyncHandler(async (req, res) => {
    // fetch video details from body: title, desc
    // fetch files from the req.files
    // validate the body data
    // upload video and thumbnail to cloudinary
    // get the video metadata
    // return the data in response
    const {title, description} = req.body;

    if (!title) {
        throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "title is required");
    }
    const response = await publishVideoService({title, description}, req.files);

    res.status(SUCCESS.CREATED).json(new ApiResponse(
        SUCCESS.CREATED,
        response,
        "Video"
    ));
    
});

export {
    publishVideo
}
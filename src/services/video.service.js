import { ApiError } from "../utils/api-error.js";
import { CLIENT_ERROR, SERVER_ERROR } from "../constant.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

const publishVideoService = async (data, files) => {
    try {
        console.log("files-------------", files);
        const videoLocalPath = files?.videoFile?.[0]?.path;
        const thumbnailLocalPath = files?.thumbnail?.[0]?.path;
        if (!videoLocalPath || !thumbnailLocalPath) {
            throw new ApiError(CLIENT_ERROR.BAD_REQUEST_ERROR, "videoFile or thumbnail is missing!");
        }
        console.log("videopath-----------", videoLocalPath);
        
        const videoUrl = await uploadCloudinary(videoLocalPath);
        const thumbnailUrl = await uploadCloudinary(thumbnailLocalPath);

        const response = {
            videoUrl,
            thumbnailUrl
        };
        return response;

    } catch (error) {
        console.error("Publish video Error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            SERVER_ERROR.INTERNAL_SERVER_ERROR,
            "Something went wrong while uploading the video"
        );
    }
}

export {
    publishVideoService
}
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs";

cloudinary.config({ 
  cloud_name: 'my_cloud_name', 
  api_key: 'my_key', 
  api_secret: 'my_secret'
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw "could not find the local path!"
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("File successfully uploaded to url: ", response.url);
        return response.url;

    } catch (error) {
        fs.unlink(localFilePath);
        throw error;
    }
}
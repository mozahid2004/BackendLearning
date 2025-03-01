import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs"

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    //upload the file on cloudinary
    cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    console.log("File is uploadod on cloudinary successfully", response.url);
  } catch (error) {
    fs.unlinkSync(localFilePath) //remove the loccaly save temporaryly file

    return null
  }
}


export { uploadOnCloudinary }
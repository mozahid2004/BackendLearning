import { v2 as cloudinary } from "cloudinary";
// import { response } from "express";
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
    const imageUploaded = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    console.log("File is uploadod on cloudinary successfully", imageUploaded.url);
    fs.unlinkSync(localFilePath) //this line is removing imgage from folder aftr uploading to the dataBase
    return imageUploaded
  } catch (error) {
    await fs.unlinkSync(localFilePath) //remove the loccaly save temporaryly file

    return null
  }
}

export { uploadOnCloudinary }
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Mozahid izhar"
  })

  // get user details from frontend
  // validation - not empty
  // check if user already exist : username , email
  // check for images, check for avatar
  // upload them to cloudnary
  // craete user object - create entry in DB 
  // remove password and refressh token field from response
  // check for user Creation
  // return response

  const { fullName, email, username, password } = req.body

  console.log(email, fullName);

  /* if (fullName === "") {
    throw new ApiError(400, "fullname is required")
  } */

  // Advance method to check condotion
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }]
  })
  console.log(existedUser);
  if (existedUser) {
    throw new ApiError(409, "User with eamil pr useranme Already exits")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalpath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar filed is Required")
  }


  // upload on cloudnary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Avatar filed is Required")
  }


  const user = await User.create({
    fullName,
    avatar : avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })


  const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went while user registration")
  }

  return res.status((201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  ))

})

export { registerUser }
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";




const generateAccessTokenAndRefreshTokens = async (userId) => {
  // console.log(userId);
  try {
    const user = await User.findById(userId)
    // console.log(user);
    const accessToken = user.generateAccessToken()
    console.log(accessToken);
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Somthing went wrong while generating refresh and access token")
  }
}





const registerUser = asyncHandler(async (req, res) => {
  // Extract user details from the request body
  const { fullName, email, username, password } = req.body;

  // Validate required fields
  if ([fullName, email, username, password].some(field => field === "")) {
    throw new ApiError(400, "All fields are required");
  }


  // Check if a user already exists with the given email or username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Handle file uploads
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar field is required");
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.secure_url) {
    throw new ApiError(500, "Failed to upload avatar on Cloudinary");
  }
  console.log("Avatar uploaded successfully:", avatar.secure_url);

  // Upload cover image if provided
  // Upload cover image if provided
  const coverImage = coverImageLocalpath ? await uploadOnCloudinary(coverImageLocalpath) : "";

  console.log("Cover Image uploaded:", coverImage?.secure_url || "No cover image provided");

  // Create user entry in the database
  const user = await User.create({
    fullName,
    avatar: avatar.secure_url,
    coverImage: coverImage.secure_url || "",
    email,
    password,
    username: username.toLowerCase()
  });


  console.log(user);

  // Fetch created user without sensitive fields
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong during user registration");
  }

  // Send success response
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body se data lena h
  // Username or email
  // find user
  // password check
  // access and refresh token generate 
  // cookies send karna h
  // response for successfully logined

  const { email, username, password } = req.body

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not exsited")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user Password")
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser, accessToken,
          refreshToken
        },
        "User Loggedin SuccessFully"
      )
    )
})


const logoutUser = asyncHandler(async (req, res) => {
  // User.findById why we cant use this method here
  await User.findByIdAndUpdate(
    req.user._id,// we can access this from middlewere
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }

  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (res, req) => {

  const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }
  try {

    const decodedToken = Jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token")
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newrefreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "AccessToken Refreshed successfully"
        )
      )
  } catch (error) {
      throw new ApiError(401, error?.message)
  }

})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
};
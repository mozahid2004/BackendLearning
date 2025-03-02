import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
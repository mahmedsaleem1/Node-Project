import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)

        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()

        user.refreshToken = RefreshToken
        await user.save({ validateBeforeSave: false })

        return {AccessToken, RefreshToken}

    } catch (error) {
        throw new ApiError(500, "Tokens Cannot be Provided :(")
    }
}

const registerUser = asyncHandler( async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const {fullname, email, username, password } = req.body

  if (
      [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({username})

  if (existedUser) {
      throw new ApiError(409, "User with username already exists")
  } 

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
  }
  
  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email, 
      password,
      username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
  )

} )

const loginUser = asyncHandler( async (req, res) => {
    const {username, password} = req.body // (email)

    if (!username) { // (!email || !username)
        throw new ApiError(400, "Username is Required")
    }

    const user = await User.findOne({username})

    // User.findOne({
    //     $or : [{email}, username]
    // })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const PassCheck = await user.isPasswordCorrect(password)

    if (!PassCheck) {
        throw new ApiError(404, "Password is Incorrect")
    }

    const {AccessToken, RefreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefrshToken", RefreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser,
                AccessToken,
                RefreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set : {
                refreshToken : undefined
            } 
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("AccessToken", options) // may be type in A and R
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})

export { registerUser,
         loginUser, 
         logoutUser }
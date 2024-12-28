import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../Utils/ApiResponse.js"


const registerUser = asyncHandler( async (req, res) => {
    const {username, email, password, fullname} = req.body
    
    if (
      [username, email, password, fullname].some((field) => field?.trim() === "") 
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existUser = User.findOne({ username })

    if (existUser) {
        throw new ApiError(401, "Username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
      throw new ApiError(400, "Avatar is required");
    }

    const userM = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username : username.toLowerCase(),
    })

    const createdUser = await User.findById(User._id).select(
      "-password -refreshToken" // what not to have?
    )

    if (!createdUser) {
      throw new ApiError(500, "User is not created please try again")
    }

    return res.status(201).json(
      new ApiResponse(200, createdUser, "User Registered Successfully")
    )
  })

export {registerUser}
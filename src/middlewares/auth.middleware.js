import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

export const verifyJWT = asyncHandler( async(req, _, next) => { // _ because res was not used 
    try {

    const Token = req.cookies?.AccessToken || 
    req.header("Authorization")?.replace("Bearer ", "")

    if (!Token) {
        throw new ApiError(401, "UnAuthorized Request")
    }

    const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)

    const user = User.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(401, "Invalid Access Token")
    }

    req.user = user

    next()

    } catch (error) {
        throw new ApiError(500, error?.message || "Something Went Wrong")
    }
})

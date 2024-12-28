import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import  bcrypt from "bcrypt"

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type: String,
        required: true,
        lowercase : true,
        trim : true,
    },
    fullname : {
        type: String,
        required: true,
        unique : false,
        trim : true,
    },
    avatar : {
        type : String, //cloudinary url
        required : true,
    },
    coverImage : {
        type : String, //cloudinary url
        required : false,
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password : {
        type : String,
        required : [true, "Password is Required"],
    },
    refreshToken : {
        type : String,
    }
}, {timestamps : true})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    } 
    return
}) 

userSchema.methods.isPasswordCorrect = async function (passoword) {
    return await bcrypt.compare(passoword, this.passoword)
}

userSchema.methods.generateAccessToken = function() {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function() {
    jwt.sign({
        _id: this._id
    },
    process.env.REFERSH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFERSH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User", userSchema) 
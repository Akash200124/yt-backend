import mongoose, { Schema } from "mongoose";

import jwt from "jsonwebtoken";
import bcrtpt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // or optimize search and filter 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: string, // cloudinary like aws 
        required: true,
    },
    coverImage: {
        type: string, // cloudinary like aws
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: string,
        required: [true, 'Passwors is required']
    },
    refreshToken: {
        type: string
    }

}, {
    timestamps: true
});

userSchema.pre("save", async function(next) {
    if(!this.ismodified('password')) return next();
    this.password = await awaitbcrtpt.hash(this.password,10)
    next()
})

userSchema.methods.ispasswordCorrect = async function name(password) {
    return  await bcrtpt.compare(password, this.password)
}

userSchema.methods.generateAccessToken =  function() {
    return   jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username: this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    
    )
}
userSchema.methods.generateRefreshToken = async function() {
    return   jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    
    ) 
}

export const User = mongoose.model("User", userSchema);
import asynHandler from "../utils/asynHandler.js"
import { apiError } from "../utils/apiError.js"
import { User  } from "../models/user.modal.js"
import { uploadOnCloudinary } from "../utils/cloudNary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken";
import fs from 'fs'

const generateAccessAndRefressTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const acessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        

        await user.save({ validateBeforeSave: false });
        return { acessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating refress ans access token")
    }
}

const registerUser = asynHandler( async (req, res) => {

    //get user details from frontend 
    // valition of data 
    // check if user is already exists username : and email: 
    // check for images and check for avtar 
    // upload them to cloudnary check avatar 
    // create user object - create entry in db 
    // remove password and refreshtoken from field 
    // check for user creation 
    // return response 

    //1 
    const { fullname, email, usrname, password } = req.body
    console.log("body:", req.body);
    // console.log("files:", req.files);

    if ([fullname, email, usrname, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required")
    }

    // check user exits in the db or not 
    const existingUser = await User.findOne({
        $or: [{ email: email }, { username: usrname }]
    })

    

    if (existingUser) {
        fs.unlinkSync(req.files?.avatar[0]?.path);
        fs.unlinkSync(req.files?.coverImage[0]?.path);
        throw new apiError(400, "User already exists with email or username")
        
    }

    // check for images and check for avtar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required")
    }

    // upload on cloudnary 
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    const uploadedcoverImage = await uploadOnCloudinary(coverImageLocalPath);


    console.log("uploadedAvatar", uploadedAvatar);

    if (!uploadedAvatar || !uploadedcoverImage) {
        throw new apiError(400, "Image upload failed")
    }

    // add in database 
    const user = await User.create({
        fullname,
        email,
        username: usrname.toLowerCase(),
        password,
        avatar: uploadedAvatar.url,
        coverImage: uploadedcoverImage?.url || ""
    })

    // now check user is created or not 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
        // write what you want to remove from the response
    )
    //
    if (!createdUser) {
        throw new apiError(400, "User creation failed")
    }

    // return response  
    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User created successfully",
        )
    )

})

const loginUser = asynHandler(async (req, res) => {
    // req =>  take username /email address and password 
    // find user 
    // check req have email or password  
    // access and refresh token, send in secure cookies 
    // if user is alredy login then show user alredy login 
    // if login with other user then login other and login this user

    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new apiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new apiError(404, "User does not exist")
    }

    // check password 
    const isPasswordValid = await user.ispasswordCorrect(password);

    if (!isPasswordValid) {
        
        throw new apiError(401, "Invalid user creadentials")
    }

    const { acessToken, refreshToken } = await generateAccessAndRefressTokens(user._id);

    //    console.log("refreshToken : ", refreshToken);

    //    db call for user  
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshtoken")

    // cookies 
    const options = {
        httpOnly: true,
        secure: true
    }

    //  console.log("refreshToken",refreshToken);

    return res.status(200)
        .cookie("accessToken", acessToken, options)
        .cookie("refreshToken", refreshToken, options)

        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, acessToken, refreshToken
                },
                "User logged in successfully"
            )
        )

})

const logoutUser = asynHandler(async (req, res) => {
    await User.findByIdAndUpdate(

        req.user._id,
        {
            $unset: {
                refreshToken: 1
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

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        )


})

const refreshAccessToken = asynHandler(async (req, res) => {

    // console.log("incomingRefreshToken",incomingRefreshToken);


    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request");
    }
    try {
        const descodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        console.log("descodedToken", descodedToken._id);
        // check user 
        const user = await User.findById(descodedToken?._id);

        if (!user) {
            throw new apiError(401, "Invalid refresh token ");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expried or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { acessToken, refreshTokennew } = await generateAccessAndRefressTokens(user._id);

        return res.status(200)
            .cookie("accessToken", acessToken, options)
            .cookie("refreshToken", refreshTokennew, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        acessToken, refreshToken: refreshTokennew
                    },
                    "Access token refressed "
                )
            )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token ")
    }

})

const changeCurrentPassword = asynHandler(async (req, res) => {

    // console.log("req.user:",req.user, "req.body:", req.body)
    const { currentPassword, newPassword } = req.body;
    

    // db call 
    const user = await User.findById(req.user?.id); // this user is form middleware 

    console.log("user:",user)

    const isPasswordCorrect = await user.ispasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old password")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully"
            )
        )
})

const getCurrentUser = asynHandler(async (req, res) => {

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: req.user
                },
                "User fetched successfully"
            )
        )

})

const updateAccountDetails = asynHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new apiError(400, "Please provide fullname and email");
    }

    let user ;
  try {
       user = await User.findByIdAndUpdate(req.user?._id,
          {
              $set: {
                  fullname: fullname,
                  email: email.toLowerCase()
              }
          },
          {
              new: true
          }
      ).select("-password")
   

  } catch (error) {
    throw new apiError(409, "User alredy exist with this email", error);
  }

  return res.status(200)
  .json(
      new ApiResponse(
          200,
          user,
          "User Account details updated successfully"
      )
  )
 
})

const updateUserAvatar = asynHandler(async (req, res) => {

    const avatarLocalpath = req.file?.path;

    if (!avatarLocalpath) {
        throw new apiError(400, "Please provide avatar");
    }
    const avatarUrl = await uploadOnCloudinary(avatarLocalpath);

    if (!avatarUrl.url) {
        throw new apiError(500, "Something went wrong while uploading avatar");
    }

    console.log("avatarUrl:", avatarUrl.url)

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatarUrl.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    console.log("user:", user);
    return res.status(200)
        .json (new ApiResponse(
            200,
            user,
            "User avatar updated successfully"
        ))
})

const updateUserConverImage = asynHandler(async (req, res) => {
    const coverLocalpath = req.file?.path;

    if (!coverLocalpath) {
        throw new apiError(400, "Please provide coverImage");
    }
    const coverImage = await uploadOnCloudinary(coverLocalpath);

    if (!coverImage.url) {
        throw new apiError(500, "Something went wrong while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
        .json ( new ApiResponse(
            200,
            user,
            "User cover image updated successfully"
        ))
})

const getUserChannelProfile = asynHandler( async (req, res) => {
    const { username } = req.params;

    console.log("username:", username)

    if (!username?.trim()) {
        throw new apiError(400, "Please provide username");
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase() // finding user in the db 
            }

        },
        {
            $lookup: {             // join two collections 
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"

            }
        },
        {
            $lookup: {             // join two collections 
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTO"

            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribesToCount: {
                    $size: "$subscribedTO"
                },
                isSubcribed: {
                    $cond: {
                        if: {  $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                        
                    }
                }

            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribesToCount: 1,
                isSubcribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }])

    console.log("channel :", channel);

    if (!channel?.length) {
        throw new apiError(404, "channel does not exists")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "user channel fetched successfully"
            )
        )
})

const getWatchHistory = asynHandler(async (req, res) => {


    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchhistory",
                // nested query 
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "watch history fetched successfully"
            )
        )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserConverImage,
    getUserChannelProfile,
    getWatchHistory
} 
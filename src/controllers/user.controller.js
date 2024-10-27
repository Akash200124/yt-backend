import asynHandler from "../utils/asynHandler.js"
import {apiError} from "../utils/apiError.js"
import { User } from "../models/user.modal.js"
import {uploadOnCloudinary} from "../utils/cloudNary.js"
import {ApiResponse} from "../utils/apiResponse.js"

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
   const  {fullname, email,usrname, password} =  req.body
    console.log("body:", req.body);
    console.log("files:", req.files);

   if([fullname, email, usrname, password].some((field)=> field?.trim() === "")){
       throw new apiError(400, "All fields are required")
   }

   // check user exits in the db or not 
   const existingUser = await User.findOne({
    $or:[{email},{usrname }]
   })

   if(existingUser){    
    throw new apiError(400, "User already exists with email or username")
   }

   // check for images and check for avtar
   const avatarLocalPath =   req.files?.avatar[0]?.path ;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
       throw new apiError(400, "Avatar is required")
   }

   // upload on cloudnary 
   const uploadedAvatar =   await uploadOnCloudinary(avatarLocalPath);
   const uploadedcoverImage =  await uploadOnCloudinary(coverImageLocalPath);


   console.log("uploadedAvatar",uploadedAvatar);
   if(!uploadedAvatar || !uploadedcoverImage){
       throw new apiError(400, "Image upload failed")
   }  

   // add in database 
  const user = await  User.create({
       fullname,
       email,
       username :usrname.toLowerCase(),
       password,
       avatar: uploadedAvatar.url,
       coverImage: uploadedcoverImage?.url || ""
   })

   // now check user is created or not 
 const createdUser =    await User.findById(user._id).select(
    "-password -refreshtoken"
    // write what you want to remove from the response
 )
//
 if(!createdUser){
    throw new apiError(400, "User creation failed")
 }

// return response  
return res.status(201).json(
    new ApiResponse(
        200,
        createdUser ,
        "User created successfully",
    )
)

})

export  { 
    registerUser,
} 
import {apiError}  from "../utils/apiError.js"
import asynHandler from "../utils/asynHandler.js"
import jwt from "jsonwebtoken";
import {User} from "../models/user.modal.js"

export const verifyJwt = asynHandler( async (req, res, next) => {
    
  try {
    const token =   req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
 
    if(!token){
     throw new apiError(401, "Unauthorized request")
    }
 
    const descodedToken  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) ;
 
     const  user =   User.findById(descodedToken?._id).select("-password -refreshToken");
 
     // Discuss about the frontend 
     if(!user){
       throw apiError(401, "Unauthorized access token ")
     }
 
     req.user = user;
     next();

  } catch (error) {
      throw apiError(401, error?.message || "Unauthorized access token ")
  }
})
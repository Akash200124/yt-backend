import { apiError } from "../utils/apiError.js"
import asynHandler from "../utils/asynHandler.js"
import jwt from "jsonwebtoken";
import { User } from "../models/user.modal.js"

export const verifyJwt = asynHandler(async (req, res, next) => {

  try {

    // console.log("req.cookies : ", req.cookies?.accessToken)
    // console.log("req : ", req)
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // console.log("token : ", token)

    if (!token) {
      throw new apiError(401, "Unauthorized request")
    }


    // console.log(`secret : ${process.env.ACCESS_TOKEN_SECRET}`)

    const descodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log("decoded token : ", descodedToken)

    const user = await User.findById(descodedToken?._id).select("-password -refreshToken");

    // console.log("user : ", user)

    // Discuss about the frontend 
    if (!user) {
      throw new apiError(401, "Unauthorized access token ")
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("error : ", error)
    throw new apiError(401, error?.message || "Unauthorized access token ")
  }
})
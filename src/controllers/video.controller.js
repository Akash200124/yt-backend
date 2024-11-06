import asynHandler from "../utils/asynHandler.js"
import {ApiResponse } from "../utils/apiResponse.js"


const uploadVideo = asynHandler(async (req, res, next) => {

    const user = req.user;
    res.status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "video uploaded successfully"
        )
    );


})


export {
    uploadVideo
}
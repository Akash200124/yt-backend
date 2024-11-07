import asynHandler from "../utils/asynHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import { Video } from "../models/video.modal.js"
import { uploadOnCloudinary } from "../utils/cloudNary.js"


// 1. get all video 
// 2. publish a video 
//  3. get video by id 
// 4. update a video 
// 5. delete a video 
// 6. toogle publish video 


const publishAVideo = asynHandler(async (req, res) => {

    const { description, title } = req.body;

    // check for thumnail and video file 
    const thumnailLocalPath = req.files?.thumnail[0]?.path;
    const videoLocalPath = req.files?.videoFile[0]?.path;

    if (!thumnailLocalPath) {
        throw new apiError(400, "thumnail image is required")
    }
    if (!videoLocalPath) {
        throw new apiError(400, "video file is required")
    }

    // upload on cloudnary 
    const uploadedThumnail = await uploadOnCloudinary(thumnailLocalPath);
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);

    if (!uploadedThumnail || !uploadedVideo) {
        throw new apiError(500, "something went wrong while uploading ")
    }

    // insert data in database

    const video = await Video.create({
        videoFile: uploadedVideo?.url,
        thumnail: uploadedThumnail?.url,
        title,
        description,
        duration: uploadedVideo?.duration,
        owner: req.user._id
    }
    )

    // check video is created in db or not 
    const createdVideo = await Video.findById(video._id);

    if (!createdVideo) {
        throw new apiError(400, "something went wrong while creating video")
    }

    // send response
    res.status(201).json(

        new ApiResponse(
            200,
            createdVideo,
            "video and thumnail uploaded successfully"
        )

    )
})


export {
    publishAVideo
}
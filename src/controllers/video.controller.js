import asynHandler from "../utils/asynHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import { Video } from "../models/video.modal.js"
import { uploadOnCloudinary } from "../utils/cloudNary.js"
import fs from 'fs';


// 1. get all video 
// 2. publish a video 
//  3. get video by id 
// 4. update a video 
// 5. delete a video 
// 6. toogle publish video 


const publishAVideo = asynHandler(async (req, res) => {

    const { description, title } = req.body;

    if(!description || !title){
        throw new apiError(400, "description and title is required")
    }
    if(req.files?.thumnail == undefined || req.files?.videoFile ==undefined) {
        throw new apiError(400, "video and thumnail is required")
    }
     

    // console.log("thumnail : ", req.files?.thumnail);
    // console.log("video :", req.files?.videoFile);

    // check for thumnail and video file 
    const thumnailLocalPath = req.files?.thumnail[0]?.path;
    const videoLocalPath = req.files?.videoFile[0]?.path;

    const existingVideo = await Video.findOne({title});

    if(existingVideo){
        fs.unlinkSync(thumnailLocalPath) ;
        fs.unlinkSync(videoLocalPath) ;
        throw new apiError(400, "video with same title already exist")
        
    }

    if (!thumnailLocalPath) {
        throw new apiError(400, "thumnail image is required")
    }
    if (!videoLocalPath) {
        throw new apiError(400, "video file is required")
    }

    // upload on cloudnary 
    const uploadedThumnail = await uploadOnCloudinary(thumnailLocalPath);
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);

    // console.log("uploaded thrumnail : ", uploadedThumnail);
    // console.log("uploaded video : ", uploadedVideo);

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

const getVideoByID = asynHandler(async (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        throw new apiError(400, "video id is required")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(400, "something went wrong in video fetching");
    }

    res.status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "video get successfully"
            )
        )

})

const getAllVideos = asynHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the starting point for fetching data
    const offset = (page - 1) * limit;

    const allVideos = await Video.find()
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 });


    const totalCount = await Video.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);


    if (!allVideos) {
        throw new apiError(400, "Something went wrong finding data ")
    }

    res.status(200)
        .json(
            {
                statusCode: 200,
                data: allVideos,
                message: "videos find successfully",
                pagination: {
                    currentPage: page,
                    totalPages,
                    limit,
                    totalCount,
                }
            }
        )
})

const updateVideo = asynHandler(async (req, res) => {

    const thumbnailpath = req.file?.path;
    const { _id, title, description } = req.body;

    if (!_id) {
        throw new apiError(400, "video id is required")
    }

    const loginUser = req.user._id;

    //db call
    const { owner } = await Video.findById(_id);

    // console.log("owner : ", owner, "loginUser : ", loginUser);

    if(owner.toString() !== loginUser.toString()) {
        throw new apiError(401, "Unauthorized request")
    }

    const newThumnail = await uploadOnCloudinary(thumbnailpath);

    //db call
    const video = await Video.findByIdAndUpdate(_id,
        {
            $set: {
                thumnail: newThumnail.url,
                title: title,
                description: description,
            }
        },
        {
            new: true
        }
    )

    res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video updated successfully"
        )
    )

})

const deleteVideo = asynHandler(async(req,res) =>{

    const {videoId} = req.body;

    if(!videoId) {
        throw new apiError(400, "video id is required");
    }

    const oldvideo = await Video.findById(videoId);

    if(oldvideo == null) {
        throw new apiError(400, "something went wrong while deleting video");
    }

    if(oldvideo.owner.toString() !== req.user._id.toString()) {
        throw new apiError(401, "Unauthorized request")
    }
    
    const video = await Video.findByIdAndDelete(videoId);

    if(!video){
        throw new apiError(400, "something went wrong while deleting video");
    }

    res.status(200)
    .json( 
        new ApiResponse(
            200,
            "video deleted successfully"
        )
    )
})

const unPublishVideo = asynHandler(async (req, res) => {

    const { videoId  } = req.body;

    if (!videoId) { 
        throw new apiError(400, "video id is required")
    }

    const { owner, isPublished } = await Video.findById(videoId);

    if(owner.toString() !== req.user._id.toString()) {
        throw new apiError(401, "Unauthorized request")
    }

    const video  = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                isPublished : !isPublished
            }
        },
        {
            new:true
        }
    )

    res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video toggled successfully"
        )
    )
})


export {
    publishAVideo,
    getVideoByID,
    getAllVideos,
    updateVideo,
    deleteVideo,
    unPublishVideo
}
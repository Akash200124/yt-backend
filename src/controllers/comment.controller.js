import asynHandler from "../utils/asynHandler.js"
import { Video } from "../models/video.modal.js"
import { apiError } from "../utils/apiError.js"
import { Comment } from "../models/comment.modal.js"
import { ApiResponse } from "../utils/apiResponse.js"
//1. get video comments 
// 2. add comment 
// 3. update comment 
// 4. delete comment 

const addComments = asynHandler(async (req, res) => {

    const { videoId, content } = req.body;

    if (!videoId || !content) {
        throw new apiError(400, "video id and content is required")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(400, "video not found")
    }

    const comment = await Comment.create({
        video: videoId,
        content: content,
        owner: req.user._id
    });

    res.status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "comment added successfully"
            )
        )

}
)

const updateComment = asynHandler(async (req, res) => {

    const { _id, content } = req.body;

    if (!_id || !content) {
        throw new apiError(400, "comment id and content is required")
    }
    
    const comment = await Comment.findById(_id);

    if (!comment) {
        throw new apiError(400, "comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()) {
        throw new apiError(401, "Unauthorized request")
    }

    const newcomment = await Comment.findByIdAndUpdate(_id,
        {
            content
        },
        {
            new: true
        }
    )

    res.status(200)
     .json(
        new ApiResponse(
            200,
            newcomment,
            "comment updated successfully"
        )
     )
})

const deleteComment = asynHandler(async (req, res) => {

    // console.log("req.body : ", req.body);
    const { _id } = req.body; 

    if (!_id) {
        throw new apiError(400, "comment id is required")
    }

    const comment = await Comment.findById(_id);

    if (!comment) {
        throw new apiError(400, "comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()) {
        throw new apiError(401, "Unauthorized request")
    }

    const newcomment = await Comment.findByIdAndDelete(_id);

    res.status(200)
     .json(
        new ApiResponse(
         200,
         "comment deleted successfully"
        )
     )

})

const getAllVideoComments = asynHandler(async (req, res) => {

    const { videoId } = req.query;

    if (!videoId) {
        throw new apiError(400, "video id is required") 
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the starting point for fetching data
    const offset = (page - 1) * limit;

    const comments = await Comment.find({video : videoId})
        .skip(offset)
        .limit(limit)
        .sort({createdAt: -1});

    const totalCount = await Comment.countDocuments({video : videoId});
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200)
     .json(

        {
            status: 200,
            data: comments,
            message: "comments fetched successfully",
            pagination: {
                currentPage: page,
                totalPages,
                limit,
                totalCount,
            }
        }
        
     )
})

export { addComments,
         updateComment,
         deleteComment,
         getAllVideoComments
 }
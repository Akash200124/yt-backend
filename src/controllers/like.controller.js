import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Like } from "../models/like.modal.js";
import { Video } from "../models/video.modal.js";
import { Tweet } from "../models/tweet.modal.js";
import { Comment } from "../models/comment.modal.js";


// 1. toogle comment like 
// 2. toogle tweet like  
// 3. toogle video like 
// 4. get liked videos

const likeVideo = asynHandler(async (req, res) => {

    const { videoId } = req.body;

    if (!videoId) {
        throw new apiError(400, "video id is required")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(400, "video not found")
    }

    const like = await Like.findOne({ video: videoId, likedBy: req.user._id });

    if (like) {
        await Like.findByIdAndDelete(like._id);
    } else {
        await Like.create({ 
            video: videoId,
            likedBy: req.user._id
        })
    }

    res.status(200)
    .json(
        new ApiResponse(
            200,
            "video liked successfully"
        )
    )
})

const likeComment = asynHandler(async (req, res) => {

    const { commentId } = req.body;

    if (!commentId) {
        throw new apiError(400, "comment id is required")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(400, "comment not found")
    }

    const like = await Like.findOne({ comment: commentId, likedBy: req.user._id });

    if (like) {
        await Like.findByIdAndDelete(like._id);
    } else {
        await Like.create({ 
            comment: commentId,
            likedBy: req.user._id
        })
    }

    res.status(200)
    .json(
        new ApiResponse(
            200,
            "comment liked successfully"
        )
    )
   
})

const likeTweet = asynHandler(async (req, res) => {

    const { tweetId } = req.body;

    if (!tweetId) {
        throw new apiError(400, "tweet id is required")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new apiError(400, "tweet not found")
    }   

    const like = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });

    if (like) {
        await Like.findByIdAndDelete(like._id);
    } else {
        await Like.create({ 
            tweet: tweetId,
            likedBy: req.user._id
        })
    }

    res.status(200)
    .json(
        new ApiResponse(
            200,
            "tweet liked successfully"
        )
    )
   
})

const getUserLikedVideos = asynHandler(async (req, res) => {

    // Calculate the starting point for fetching data
    // const skip = (page - 1) * limit;

    const videos = await Like.aggregatePaginate(await Like.aggregate(
        [
            {
                $match: {
                    likedBy: req.user._id
                }
            },
            {
                $lookup: {
                    from: "Videos",
                    localField: "_id",
                    foreignField: "_id",
                    as: "video"
                }
            }
        ]
    ),
    options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
    }
)

console.log(videos);

})
export {
    likeVideo,
    likeComment,
    likeTweet,
    getUserLikedVideos
}

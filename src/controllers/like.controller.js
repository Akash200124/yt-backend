import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Like } from "../models/like.modal.js";
import { Video } from "../models/video.modal.js";
import { Tweet } from "../models/tweet.modal.js";
import { Comment } from "../models/comment.modal.js";
import asynHandler from "../utils/asynHandler.js";
import mongoose from "mongoose";


// 1. toogle comment like 
// 2. toogle tweet like  
// 3. toogle video like 
// 4. get liked videos

const likeVideo = asynHandler(async (req, res) => {

    const { videoId } = req.body;
    const userId = req.user._id;

    if (!videoId) {
        throw new apiError(400, "video id is required")
    }

    // const video = await Video.findById(videoId);

    // if (!video) {
    //     throw new apiError(400, "video not found")
    // }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "video not found")
    }

    try {
        // Check if a Like document exists for the user
        let like = await Like.findOne({ likedBy: userId });

        if (like) {
            // Check if the videoId is already liked
            if (!like.video.includes(videoId)) {
                like.video.push(videoId); // Add video ID to the video array
                await like.save(); // Save changes to the document
                return res.status(200).json(
                    new ApiResponse(
                        200,
                        "Video liked successfully"
                    )
                );
            } else {
                return res.status(400).json(
                    new ApiResponse(
                        400,
                        "Video already liked"
                    ));
            }
        } else {
            // Create a new Like document if one doesn't exist for this user
            like = new Like({
                likedBy: userId,
                video: [videoId]
            });
            await like.save();

            res.status(201)
                .json(
                    new ApiResponse(
                        201,
                        "Video liked successfully"
                    )
                )
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to like video", error });
    }



})

const unlikeVideo = asynHandler(async (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        throw new apiError(400, "video id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "video not found")
    }

    const like = await Like.findOne({ likedBy: req.user._id });

    if (like) {

        if (like.video.includes(videoId)) {

            const index = like.video.indexOf(videoId);
            like.video.splice(index, 1);
            await like.save();

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Video unliked successfully"
                )
            )
        } else {
            res.status(400).json(
                new ApiResponse(
                    400,
                    "Video not liked"
                )
            )
        }
    } else {
        res.status(400).json(
            new ApiResponse(
                400,
                "Video not liked yet by user"
            )
        )
    }


})

const getAllLikedVideo = asynHandler(async (req, res) => {

    const userId = req.user._id;

    //find user in like 
    // get all video id 
    // from video modal get videos and send thm in response 

    const videoIds = await Like.aggregate([
        {
            $match: {
                likedBy: userId // Filter by user ID
            }
        },
        {
            $project: {
                video: 1 // Only project the "video" field
            }
        },
        {
            $unwind: "$video" // Unwind to get each video ID as a separate document entry
        },
        {
            $group: {
                _id: null, // Group all video IDs together
                allVideoIds: { $addToSet: "$video" } // Collect all unique video IDs
            }
        }
    ]);

    // If no video IDs are found, send an empty array
    const result = videoIds.length > 0 ? videoIds[0].allVideoIds : [];

    const data = await Promise.all(
        result.map(async (videoId) => {
            const video = await Video.findById(videoId);
            return video || null; // Ensure each call returns either a video or null
        })
    );

    // Filter out any null values (in case some video IDs didn't match a document)
    const result1 = data.filter((video) => video !== null);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                result1,
                "ALl Video liked by user find successfully"
            )
        )

})

const likeComment = asynHandler(async (req, res) => {

    const { commentId } = req.body;
    const userId = req.user._id;

    if (!commentId) {
        throw new apiError(400, "comment id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "comment not found")
    }

    try {
    let like = await Like.findOne({ likedBy: userId });

    if (like) {
        // Check if the videoId is already liked
        if (!like.comment.includes(commentId)) {
            like.comment.push(commentId); // Add video ID to the video array
            await like.save(); // Save changes to the document
            return res.status(200).json(
                new ApiResponse(
                    200,
                    "comment liked successfully"
                )
            );
        } else {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    "comment already liked"
                ));
        }
    } else {
        // Create a new Like document if one doesn't exist for this user
        like = new Like({
            likedBy: userId,
            comment: [commentId]
        });
        await like.save();

        res.status(201)
            .json(
                new ApiResponse(
                    201,
                    "comment liked successfully"
                )
            )
    }
} catch (error) {
    res.status(500).json({ message: "Failed to like comment", error });
}
})

const likeTweet = asynHandler(async (req, res) => {

    const { tweetId } = req.body;
    const userId = req.user._id;

    if (!tweetId) {
        throw new apiError(400, "Tweet id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(400, "Tweet not found")
    }

    try {
    let like = await Like.findOne({ likedBy: userId });

    if (like) {
        // Check if the videoId is already liked
        if (!like.tweet.includes(tweetId)) {
            like.tweet.push(tweetId); // Add video ID to the video array
            await like.save(); // Save changes to the document
            return res.status(200).json(
                new ApiResponse(
                    200,
                    "Tweet liked successfully"
                )
            );
        } else {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    "Tweet already liked"
                ));
        }
    } else {
        // Create a new Like document if one doesn't exist for this user
        like = new Like({
            likedBy: userId,
            tweet: [tweetId]
        });
        await like.save();

        res.status(201)
            .json(
                new ApiResponse(
                    201,
                    "Tweet liked successfully"
                )
            )
    }
} catch (error) {
    res.status(500).json({ message: "Failed to like Tweet", error });
}
})

const unlikeComment = asynHandler(async (req, res) => {
    const { commentId } = req.body;

    if (!commentId) {
        throw new apiError(400, "Comment id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "comment not found")
    }

    const like = await Like.findOne({ likedBy: req.user._id });

    if (like) {

        if (like.comment.includes(commentId)) {

            const index = like.comment.indexOf(commentId);
            like.comment.splice(index, 1);
            await like.save();

            res.status(200).json(
                new ApiResponse(
                    200,
                    "comment unliked successfully"
                )
            )
        } else {
            res.status(400).json(
                new ApiResponse(
                    400,
                    "comment not unliked"
                )
            )
        }
    } else {
        res.status(400).json(
            new ApiResponse(
                400,
                "comment not liked yet by user"
            )
        )
    }


})

const unlikeTweet = asynHandler(async (req, res) => {
    const { tweetId } = req.body;

    if (!tweetId) {
        throw new apiError(400, "Comment id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(400, "Tweet not found")
    }

    const like = await Like.findOne({ likedBy: req.user._id });

    if (like) {

        if (like.tweet.includes(tweetId)) {

            const index = like.tweet.indexOf(tweetId);
            like.tweet.splice(index, 1);
            await like.save();

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Tweet unliked successfully"
                )
            )
        } else {
            res.status(400).json(
                new ApiResponse(
                    400,
                    "Tweet not unliked"
                )
            )
        }
    } else {
        res.status(400).json(
            new ApiResponse(
                400,
                "Tweet not liked yet by user"
            )
        )
    }


})



export {
    likeVideo,
    unlikeVideo,
    getAllLikedVideo,
    likeComment,
    unlikeComment,
    likeTweet,
    unlikeTweet
    
}

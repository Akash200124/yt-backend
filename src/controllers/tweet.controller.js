import asynHandler from "../utils/asynHandler.js";
import {apiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {Tweet} from "../models/tweet.modal.js";
import mongoose from "mongoose";


// create tweet 
// get all user tweets
// update tweet 
//  delete tweet

const createTweet = asynHandler(async (req, res) => {

    const { content } = req.body;

    if (!content) {
        throw new apiError(400, "content is required")
    }

    const createdTweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    if (createdTweet) {
        res.status(200)
            .json(
                new ApiResponse(
                    200,
                    createdTweet,
                    "tweet created successfully",
                )
            )
    }



})

const updateTweet = asynHandler(async (req, res) => {

    const {tweetId,content} = req.body;

    if(!tweetId || !content){
        throw new apiError (400,"content and Tweet id is required")
    }

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new apiError(400,"tweet does not exists")
    }
  
    const dbowner = await Tweet.findById(tweetId);

    if(!dbowner){
        throw new apiError(400,"tweet does not exists")
    }
    
    if(dbowner.owner.toString() !== req.user._id.toString()){
        throw new apiError(401,"unauthorized acess")
    }

    const newtweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            content
        },{
            new : true
        }

    )

    res.status(200)
        .json(
            new ApiResponse(
                200,
                newtweet,
                "Tweet updated successfully"
            )
        )

})

const deletTweet = asynHandler (async (req,res) =>{

    const {tweetId} = req.body;

    if(!tweetId) {
       throw new apiError(400,"Tweet id is required");
    }

    const dbtweet = await Tweet.findById(tweetId);

    if(!dbtweet){
        throw new apiError(400,"tweet does not exists")
    }

    if(dbtweet.owner.toString() !== req.user._id.toString()){
        throw new apiError(400,"unauthorized access")
    }

    const tweet =  await Tweet.findByIdAndDelete(tweetId);

    res.status(200)
      .json(
        new ApiResponse(
            200,
            "Tweet deleted successfully"
        )
      )
})

const getAllUserTweet = asynHandler(async (req,res) =>{

    const userid = req.user._id ;
    const allTweets =  await Tweet.find({owner:userid})

    res.status(200)
     .json(
        new ApiResponse(
            200,
            allTweets,
            "all user written tweets find successfully"
        )
     )
})


export {
    createTweet,
    updateTweet,
    deletTweet,
    getAllUserTweet
}
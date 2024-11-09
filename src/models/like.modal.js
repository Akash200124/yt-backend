import mongoose from "mongoose";


const likeSchema = new mongoose.Schema({

    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",

    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",

    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",

    }

}, { timestamps: true })

likeSchema.plugin(mongooseAggregatePaginate)


export const Like = mongoose.model("Like", likeSchema); 
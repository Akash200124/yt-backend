import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content : {
            type: String,
            required: true,
        },
        video:{
            type : Schema.types.ObjectId,
            ref : "Video",
            required : true
        },
        Owner:{
            type : Schema.types.ObjectId,
            ref : "User",
            required : true
        },
        
    }, { timestamps: true }
)

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("comment", commentSchema);
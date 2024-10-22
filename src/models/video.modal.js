import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({

    videoFile:{
        type: String, // cloudinary like aws
        required: [true,'video is required'] 
    },
    thumnail:{
        type: String, // cloudinary like aws
        required: [true,'video is required'] 
    },
    title:{
        type: String, 
        required: [true,'video is required'] 
    },
    description:{
        type: String, 
        required: [true,'video is required'] 
    },
    duration :{
        type: Number,
        required : true 
    },
    views : {
        type : Number,
        default : 0 
    },
    isPublished :{
        type : Boolean , 
        default : true
    },
    owner : {
        type: Schema.types.ObjectId,
        ref: 'User',
    }



},{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video',videoSchema)
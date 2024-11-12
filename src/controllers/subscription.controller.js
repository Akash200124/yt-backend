import { ApiResponse } from "../utils/apiResponse";
import { apiError } from "../utils/apiError";
import { Subscription } from "../models/subscription.model";


const subscribeChannel = async (req, res) => {
    const {  Channel } = req.body;
    if (!Channel) {
        throw new apiError(400, "Channel is required")
    }

    const dbsub = await Subscription.findOne({ Channel: Channel, subscriber: req.user._id });
    if (dbsub) {
        throw new apiError(400, "Already subscribed to this channel")
    }

    const newsub = await Subscription.create({
        subscriber: req.user._id,
        Channel
    })

    res.status(200)
     .json(
         new ApiResponse(
             200,
             "subscribed successfully"
         )
     )
}

const unsubscribeChannel = async (req, res) => {
    const {  Channel } = req.body;

    if (!Channel) {
        throw new apiError(400, "Channel is required")
    }        

    const dbsub = await Subscription.findOne({ Channel: Channel, subscriber: req.user._id });
    if (!dbsub) {
        throw new apiError(400, "Not subscribed to this channel")
    }

    const newsub = await Subscription.findByIdAndDelete(dbsub._id);

    res.status(200)
    .json(
        new ApiResponse(
            200,
            "unsubscribed successfully"
        )
    )
}
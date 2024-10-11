import mongoose, { isValidObjectId, Mongoose } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    });

    if (existingSubscription) {
        await Subscription.deleteOne({ _id: existingSubscription._id });
        return res.status(200).json(new ApiResponse(200, existingSubscription, "Unsubscribed from the channel successfully"))
    }
    else {
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })

        return res.status(201).json(new ApiResponse(201, newSubscription, "Subscribed to the channel successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $project: {
                'subscriberDetails._id': 1,
                'subscriberDetails.username': 1,
                'subscriberDetails.email': 1
            }
        },
        {
            $group: {
                _id: null, // We don't care about grouping by a specific field
                subscriberDetails: { $push: { $arrayElemAt: ['$subscriberDetails', 0] } } // Collect subscriberDetails into an array
            }
        },
        {
            $project: {
                _id: 0, // Exclude the grouping _id
                subscriberDetails: 1 // Include the subscriberDetails array
            }
        }

    ])

    if (!subscribers || subscribers.length === 0)
        throw new ApiError(404, "No subscribers found for this channel");

    return res.status(200).json(new ApiResponse(200, subscribers, "Fetched all subscribers details"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    console.log(subscriberId);

    const channelList = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $project: {
                _id:0,
                'channelDetails._id': 1,
                'channelDetails.username': 1,
                'channelDetails.fullName': 1,

            }
        }
    ])

    if (!channelList || channelList.length === 0)
        throw new ApiError(404, "No channels found for this subscriber");

    return res.status(200).json(new ApiResponse(200, channelList, "Fetched All channel details"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const UserTweets = await Tweet.find({ owner: userId });

    if (!UserTweets)
        throw new ApiError(404, "Not found any tweets");

    return res.status(200).json(new ApiResponse(200, UserTweets, "Tweets Fetched Successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {

    const { content } = req.body;
    const { tweetId } = req.params;

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    );

    if (!updatedTweet)
        throw new ApiError(404, "Tweet not found");

    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet Updated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    
    const { tweetId } = req.params;

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if(!deletedTweet)
        throw new ApiError(404, "Tweet not found");

    return res.status(200).json(new ApiResponse(200, "Tweet Deleted Successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

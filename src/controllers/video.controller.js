import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skipVideos = (pageNumber - 1) * limitNumber;

    // build aggregation pipeline
    let pipeline = [];

    // match stage for search query and userId
    let matchStage = {};

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    if (userId) {
        matchStage.userId = userId;
    }

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // Sort stage
    const sortDirection = sortType === 'desc' ? -1 : 1;
    pipeline.push({
        $sort: { [sortBy]: sortDirection }
    });

    // Pagination stage (skip and limit)
    pipeline.push({ $skip: skipVideos });
    pipeline.push({ $limit: limitNumber });

    try {
        const videos = await Video.aggregate(pipeline);
        return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message)
    }

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    // TODO: get video, upload to cloudinary, create video

    if ([title, description, duration].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video File Or Thumbnail is required!!");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    console.log("cluodinary ", videoFile);
    console.log("cluodinary ", thumbnail);

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user._id
    })

    if (!video) {
        throw new ApiError(500, "Something went wrong while uploading video");
    }

    return res.status(201).json(
        new ApiResponse(201, video, "Video uploaded Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

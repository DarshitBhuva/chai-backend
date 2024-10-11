import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, playlist, "New Playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const playlist = await Playlist.find({ owner: userId });

    if (!playlist || playlist.length === 0)
        throw new ApiError(404, "User does not have any playlists")

    return res.status(200).json(new ApiResponse(200, playlist, "All available playlist fetched"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Requested playlist is not found");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Requested playlist is not found");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull : {videos : new mongoose.Types.ObjectId(videoId)}
        },
        {new : true}
    );

    if(!playlist)
    {
        throw new ApiError(404, "Playlist is not found");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist)
        throw new ApiError(404, "Playlist not found");

    return res.status(200).json(new ApiResponse(200, deletedPlaylist, "Playlist deleted Successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Playlist } from "../models/playlist.modal.js";
import { Video } from "../models/video.modal.js";
import mongoose from "mongoose";
import asynHandler from "../utils/asynHandler.js";


// 1. create a playlist  1
// 2. get user playlist 1
// 3. get playlist by id 1
// 4. add video to playlist 1
// 5. remove video from playlist
// 6. delete playlist 1
// 7. updae playlist 1


const createPlayList = asynHandler(async (req, res) => {

    const { name, description } = req.body;

    if (!name || !description) {
        throw new apiError(400, "name and description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    if (!playlist) {
        throw new apiError(400, "something went wrong while creating playlist")
    }

    res.status(201)
        .json(
            new ApiResponse(
                201,
                playlist,
                "playlist created successfully"
            )
        )
})

const getPlayListById = asynHandler(async (req, res) => {

    const { playListId } = req.body;

    if (!playListId) {
        throw new apiError(400, "PlayList Id is required")
    }

    if (!mongoose.isValidObjectId(playListId)) {
        throw new apiError(400, "Invalid PlayList Id ")
    }

    const playlist = await Playlist.findById(playListId);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playList find successfully "

            )
        )
})

const getUserPlayLists = asynHandler(async (req, res) => {

    const userid = req.user._id;

    const playlist = await Playlist.find({ owner: userid });

    if (!playlist) {
        new apiError(400, "playlist not found")
    }

    res.status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist find successfully"
            )
        )
})

const deletePlayList = asynHandler(async (req, res) => {

    const { playListId } = req.body;

    if (!playListId) {
        throw new apiError(400, "playlist id is required")
    }

    if (!mongoose.isValidObjectId(playListId)) {
        throw new apiError(400, "invalid playlist id")
    }

    const dbPlayList = await Playlist.findById(playListId);

    if (dbPlayList.owner.toString() !== req.user._id.toString()) {
        throw new apiError(401, "Unauthorized request")
    }

    const playlist = await Playlist.findByIdAndDelete(playListId);

    if (!playlist) {
        throw new apiError(400, "something went wrong while deleting playlist")
    }

    res.status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist deleted successfully"
            )
        )

})

const updatePlayList = asynHandler(async (req, res) => {

    const { name, description, playlistId } = req.body;


    if (!playlistId) {
        new apiError(400, "playList id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        new apiError(400, "Invalid PlayList id")
    }

    const dbPlayList = await Playlist.findById(playlistId);

    if (dbPlayList.owner.toString() !== req.user._id) {
        new apiError(401, "unauthorized request")
    }

    const playList = await Playlist.findByIdAndUpdate(playlistId,
        {
            name,
            description
        },
        {
            new: true
        }
    )

    res.status(200)
        .json(
            new ApiResponse(
                200,
                playList,
                "PlayList udpated successfully"
            )
        )


})

const addVideoInPlayList = asynHandler(async (req, res) => {

    const { videos, playListId } = req.body;

    if (!playListId || !Array.isArray(videos) || videos.length === 0) {
        throw new apiError(400, "Playlist ID and a non-empty videos array are required");
    }

    if (!mongoose.isValidObjectId(playListId)) {
        new apiError(400, "Invalid playlist Id")
    }

    const dbPlayList = await Playlist.find({ owner: req.user._id })

    if (dbPlayList.owner.toString() !== req.user._id.toString()) {
        new apiError(401, "Unauthoried request ")
    }

    const videosinPlayList = await Promise.all(
        videos.map(async (video) => {
            const dbvideo = await Video.findById(video);

            if (!dbvideo) {
                throw new apiError(400, "Invalid video Id");
            }

            await Playlist.findByIdAndUpdate(
                playListId,
                { $push: { videos: video } },
                { new: true }
            );
        })
    );

    res.status(200)
        .json(
            new ApiResponse(
                200,
                videosinPlayList,
                "videos added in playlist successfully"
            )
        )
})

const removeVideosFromPlaylist = asynHandler(async (req, res) => {

    const { videos, playListId } = req.body;

    if (!playListId || !Array.isArray(videos) || videos.length === 0) {
        throw new apiError(400, "Playlist ID and a non-empty videos array are required");
    }

    if (!mongoose.isValidObjectId(playListId)) {
        new apiError(400, "Invalid playlist Id")
    }

    const dbPlayList = await Playlist.find({ owner: req.user._id })

    if (dbPlayList.owner.toString() !== req.user._id.toString()) {
        new apiError(401, "Unauthoried request ")
    }

    const updatePlayList = Promise.all(

        videos.map( async (video) =>{
            const dbvideo = await Video.findById(video);

            if (!dbvideo) {
                throw new apiError(400, "Invalid video Id");
            }
            
            await Playlist.findByIdAndUpdate(
                playListId,
                {
                    $pull: {
                        videos :video
                    }
            
                },
                {
                    new : true
                }
                
            );

        })
    
    )

    req.status(200)
        .json(
            new ApiResponse (
                200,
                updatePlayList,
                "videos removed from playlist successfully"
            )
        )
})




export {
    createPlayList,
    getPlayListById,
    getUserPlayLists,
    deletePlayList,
    updatePlayList,
    addVideoInPlayList,
    removeVideosFromPlaylist
}
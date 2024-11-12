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

    const playlistname = await Playlist.find({ name });

    if (playlistname.length > 0) {
        throw new apiError(400, "Playlist name already exists");
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

    if (!mongoose.Types.ObjectId.isValid(playListId)) {
        throw new apiError(400, "Invalid playlist ID")
    }


    const playlist1 = await Playlist.findById(playListId)

    if (!playlist1) {
        throw new apiError(404, "Playlist not found");
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

    if (!mongoose.Types.ObjectId.isValid(playListId)) {
        throw new apiError(400, "Invalid playlist ID")
    }


    const dbPlayList = await Playlist.findById(playListId);

    if (dbPlayList) {
        if (dbPlayList.owner.toString() !== req.user._id.toString()) {
            throw new apiError(401, "Unauthorized request")
        }
    } else {
        throw new apiError(400, "Playlist not found")
    }

    const playlist = await Playlist.findByIdAndDelete(playListId);

    if (!playlist) {
        throw new apiError(400, "something went wrong while deleting playlist")
    }

    res.status(200)
        .json(
            new ApiResponse(
                200,
                "playlist deleted successfully"
            )
        )

})

const updatePlayList = asynHandler(async (req, res) => {

    const { name, description, playListId } = req.body;


    if (!playListId) {
        new apiError(400, "playList id is required")
    }

    if (!mongoose.isValidObjectId(playListId)) {
        new apiError(400, "Invalid PlayList id")
    }

    const dbPlayList = await Playlist.findById(playListId);

    if (dbPlayList) {
        if (dbPlayList.owner.toString() !== req.user._id.toString()) {
            throw new apiError(401, "Unauthorized request")
        }
    } else {
        throw new apiError(400, "PlayList not found")
    }


    const playList = await Playlist.findByIdAndUpdate(playListId,
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
    console.log("videos : ", req.body.videos)

    if (!mongoose.Types.ObjectId.isValid(playListId)) {
        throw new apiError(400, "Invalid playlist Id")
    }
    videos.forEach((video) => {
        if (!mongoose.Types.ObjectId.isValid(video)) {
             throw new apiError(400, "Invalid video Id", video)
        }
    })

    const dbPlayList = await Playlist.findById(playListId);

    if (dbPlayList) {

        if (dbPlayList.owner.toString() !== req.user._id.toString()) {
          throw new apiError(401, "Unauthoried request ")
        }
    } else {
        throw new apiError(400, "PlayList not found")
    }

    const uniqueVideos = [...new Set(videos)];

    const videosinPlayList = await Promise.all(

        uniqueVideos.map(async (video) => {
            const dbvideo = await Video.findById(video);

            if (!dbvideo) {
                throw new apiError(400, "Invalid video Id");
            }

            const videoObjectId = new mongoose.Types.ObjectId(video);

            // Check if the video is already in the playlist
            if (!dbPlayList.videos.includes(videoObjectId)) {
                // Only push the video if it's not already in the playlist
                return await Playlist.findByIdAndUpdate(
                    playListId,
                    { $push: { videos: videoObjectId } },
                    { new: true }
                );
            }
            return null;
        }

        )
    )

    // const filteredVideos = videosinPlayList.filter((video) => video !== null);

    // console.log("filteredVideos:",filteredVideos,typeof filteredVideos.length)
    // console.log("filteredVideos len:",filteredVideos.length)

    
    const    playList = await Playlist.findById(playListId)
    

    // console.log("playList:",playList)
    
    //  let playlistvideos = filteredVideos.length > 0 ? filteredVideos : playList;

    // console.log("playlistvideos:",playlistvideos)
    // console.log("filteredVideos:",filteredVideos)
    // console.log("playList:",playList)    

    res.status(200)
        .json(
            new ApiResponse(
                200,
                playList,
                "videos added in playlist successfully"
            )
        )
})

const removeVideosFromPlaylist = asynHandler(async (req, res) => {

    const { videos, playListId } = req.body;

    if (!playListId || !Array.isArray(videos) || videos.length === 0) {
        throw new apiError(400, "Playlist ID and videos are required");
    }
    // console.log("videos : ", req.body.videos)

    if (!mongoose.Types.ObjectId.isValid(playListId)) {
        throw new apiError(400, "Invalid playlist Id")
    }
    videos.forEach((video) => {
        if (!mongoose.Types.ObjectId.isValid(video)) {
             throw new apiError(400, "Invalid video Id", video)
        }
    })

    const dbPlayList = await Playlist.findById(playListId);

    if (dbPlayList) {

        if (dbPlayList.owner.toString() !== req.user._id.toString()) {
          throw new apiError(401, "Unauthoried request ")
        }
    } else {
        throw new apiError(400, "PlayList not found")
    }

    const uniqueVideos = [...new Set(videos)];

    const videosinPlayList = await Promise.all(

        uniqueVideos.map(async (video) => {
            const dbvideo = await Video.findById(video);

            if (!dbvideo) {
                throw new apiError(400, "Invalid video Id");
            }

            const videoObjectId = new mongoose.Types.ObjectId(video);

            // Check if the video is already in the playlist
            if (dbPlayList.videos.includes(videoObjectId)) {
                return await Playlist.findByIdAndUpdate(
                    playListId,
                    { $pull: { videos: videoObjectId } },
                    { new: true }
                );
            }

            return null;
        }

        )
    )

    // console.log("videosinPlayList:`",videosinPlayList)

    // const filteredVideos = videosinPlayList.filter((video) => video !== null );
    

    
    // console.log("filteredVideos:",filteredVideos,typeof filteredVideos.length)
    // console.log("filteredVideos len:",filteredVideos.length)

    
     const playList = await Playlist.findById(playListId)

 
    

    // console.log("playList:",playList)
    
    //  let playlistvideos = filteredVideos.length > 0 ? latestVideo : playList;

    // console.log("playlistvideos:",playlistvideos)
    // console.log("filteredVideos:",filteredVideos)
    // console.log("playList:",playList)    

    res.status(200)
        .json(
            new ApiResponse(
                200,
                playList,
                "videos removed in playlist successfully"
            )
        )
})
const removeVideosFromPlaylist1 = asynHandler(async (req, res) => {

    const { videos, playListId } = req.body;

    if (!playListId || !Array.isArray(videos) || videos.length === 0) {
        throw new apiError(400, "Playlist ID and a non-empty videos array are required");
    }

    if (!mongoose.isValidObjectId(playListId)) {
        new apiError(400, "Invalid playlist Id")
    }

    const dbPlayList = await Playlist.find({ owner: req.user._id })

    if (dbPlayList.owner.toString() !== req.user._id.toString()) {
        throw new apiError(401, "Unauthorized request");
    }

    const updatePlayList = Promise.all(

        videos.map(async (video) => {
            const dbvideo = await Video.findById(video);

            if (!dbvideo) {
                throw new apiError(400, "Invalid video Id");
            }

            await Playlist.findByIdAndUpdate(
                playListId,
                {
                    $pull: {
                        videos: video
                    }

                },
                {
                    new: true
                }

            );

        })

    )

    req.status(200)
        .json(
            new ApiResponse(
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
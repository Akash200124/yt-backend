import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import {
    addVideoInPlayList,
    createPlayList,
    deletePlayList,
    getPlayListById,
    getUserPlayLists,
    removeVideosFromPlaylist,
    updatePlayList,

} from "../controllers/playlist.controller.js"



const router = Router();

router.use(verifyJwt); // apply verifyjwt middleware to all routes in this field

// all routes are secure here
router.route("/create-playlist").post(createPlayList);
router.route("/getPlayListById").get(getPlayListById);
router.route("/getUser-playlists").get(getUserPlayLists);
router.route("/delete-playlist").delete(deletePlayList);
router.route("/update-playlist").patch(updatePlayList);
router.route("/addVideo-playlist").post(addVideoInPlayList);
router.route("/removeVideo-playlist").patch(
    removeVideosFromPlaylist
)





export default router


import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {likeVideo ,unlikeVideo,getAllLikedVideo} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJwt); // add middleware to secure all the routes below
// all routes are secure here 
router.route("/likeVideo").post(likeVideo);
router.route("/unlikeVideo").post(unlikeVideo);
// router.route("/likeComment").post(likeComment);
// router.route("/likeTweet").post(likeTweet);
router.route("/getUserLikedVideos").get(getAllLikedVideo);

export default router;

import { Router } from 'express';
import {
    publishAVideo,
    getVideoByID,
    getAllVideos,
    updateVideo,
    deleteVideo,
    unPublishVideo

} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from "../middlewares/auth.middleware.js"



const router = Router();



router.use(verifyJwt); // add middleware to secure all the routes below
// all routes are secure here 
router.route("/upload-video").post(

    upload.fields([
        { name: "thumnail", maxCount: 1 },
        { name: "videoFile", maxCount: 1 }
    ]),

    publishAVideo
);


router.route("/get-videoById").get(getVideoByID);
router.route("/get-allvideos").get(getAllVideos);
router.route("/update-video").patch(upload.single("thumnail"), updateVideo);
router.route("/delete-video").delete(deleteVideo);
router.route("/unpublish-video").patch(unPublishVideo);

export default router;
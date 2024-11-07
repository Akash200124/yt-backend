import {Router} from 'express';
import { publishAVideo } from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from "../middlewares/auth.middleware.js"



const router = Router();



router.use(verifyJwt) ; // add middleware to secure all the routes below
// all routes are secure here 
router.route("/upload-video").post(
    upload.fields([
        {
            name: "thumnail",
            maxCount: 1
        },
        {
            name : "videoFile",
            maxCount : 1
        }
    ])
    , publishAVideo);

export default router;
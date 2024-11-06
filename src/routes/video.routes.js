import {Router} from 'express';
import { uploadVideo } from '../controllers/video.controller.js';
import {verifyJwt} from '../middlewares/auth.middleware.js'



const router = Router();


// all routes are secure here 
router.route("/upload-video").post(verifyJwt, uploadVideo);

export default router;
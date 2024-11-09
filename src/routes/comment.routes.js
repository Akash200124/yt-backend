import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";

import {addComments,
        updateComment,
        getAllVideoComments,
        deleteComment
} from "../controllers/comment.controller.js"


const router = Router();

router.use(verifyjwt) ; // apply verifyjwt middleware to all routes in this field 

// all routes are secure here
router.route("/add-comment").post(addComments);
router.route("/update-comment").put(updateComment);
router.route("/get-video-comments").get(getAllVideoComments);
router.route("/delete-comment").delete(deleteComment);




export default router;
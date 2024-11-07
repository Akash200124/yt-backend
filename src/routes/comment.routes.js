import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyjwt) ; // apply verifyjwt middleware to all routes in this field 

router.route("/:videoId").get(getVideoComments).post(addComments);



export default router;
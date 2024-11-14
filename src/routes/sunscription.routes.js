import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import { 
    subscribeChannel,
    unsubscribeChannel } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJwt);

// all routes are secure here
router.route("/subscribeChannel").post(subscribeChannel);

router.route("/unsubscribeChannel").post(unsubscribeChannel);





export default router
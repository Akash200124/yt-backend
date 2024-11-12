import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";

import { createTweet,
        updateTweet,
        deletTweet,
        getAllUserTweet

 } from "../controllers/tweet.controller.js";



const router = Router();

router.use(verifyJwt); // add middleware to secure all the routes below

router.route("/create-tweet").post(createTweet);
router.route("/update-tweet").patch(updateTweet)
router.route("/delete-tweet").delete(deletTweet)
router.route("/getAllUser-tweet").get(getAllUserTweet)



export default router

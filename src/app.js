import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';


const app = express();

app.use(cors({
  
    origin: true,
    credentials: true,

}))

console.log("process.env.CORS_ORIGIN",process.env.CORS_ORIGIN)

// to accept json in body 
app.use(express.json({ "limit": "16kb" }))
// to get the data from the url 
app.use(express.urlencoded({extended : true , limit : "16kb"}))
//public assets 
app.use(express.static("public"))
//to accept cookie
app.use(cookieParser());


//routes  import 
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import  likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import   subscriptionRouter  from "./routes/sunscription.routes.js";

//routes decleartion 
app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/comment",commentRouter);
app.use("/api/v1/like",likeRouter);
app.use("/api/v1/tweet",tweetRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/subscription",subscriptionRouter);





// http://localhost:8000/api/v1/users/register




app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.statusCode || 500).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data
    });
  });

export { app }
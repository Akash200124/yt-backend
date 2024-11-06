import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';


const app = express();

app.use(cors({
    "origin": process.env.CORS_ORIGIN,
    "credentials": true,

}))


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

//routes decleartion 
app.use("/api/v1/users",userRouter);

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
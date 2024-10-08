import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express";

const app = express();

; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", () => {
            console.log("error in db connection to frontend", error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listing in port : ${process.env.PORT} `)
        })


    } catch (e) {
        console.log(e.message + "error in db connection");
    }
})();
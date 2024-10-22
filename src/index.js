// require('dotenv').config()
import  dotenv from 'dotenv';
import {connectDB} from './db/index.js'
import { app } from './app.js';

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    
    app.listen(process.env.PORT ||8000,()=>{
        console.log(`Server is running on port : ${process.env.PORT} `)
    })
})
.catch((e)=>{
    console.log('error in db connection',e);
    
})












// other approach 
/*
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
*/
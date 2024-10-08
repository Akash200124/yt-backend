import mongoose from "mongoose";
import { DB_NAME } from "../constants";


// db is in another continent 

const connectDB = async ()=>{

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
    } catch (error) {
        console.log("error in db connection"+ error);
        process.exit(1);
        
        
    }
}
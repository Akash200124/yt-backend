import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// db is in another continent 

export const connectDB = async ()=>{

    try {
        console.log(process.env.MONGODB_URI);
        
       const connectionInstant =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    //    console.log(connectionInstant);
       
       console.log(`\n MongoDB conneted >> DB Host: ${connectionInstant.connection.host}`);
        
    } catch (error) {
        console.log("error in db connection :"+ error);
        process.exit(1);
        
        
    }
}

export default connectDB;
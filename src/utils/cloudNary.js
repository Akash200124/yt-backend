import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) =>{

    try {
        if(!localFilePath) return null ;
        //upload the file to cloudinary 
        const uploadResult= await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
        });
        // file has been uploaded sucessfully 
        console.log("file uploaded sucessfully",uploadResult.url);
        return uploadResult ;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // removed locally saved temparty file as the response failed 
        return null ;
    }
}

export {uploadOnCloudinary}
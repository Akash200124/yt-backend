import asynHandler from "../utils/asynHandler.js";

const registerUser = asynHandler( async (req, res) => {
    res.status(200).json({message: "Register User"})
})  


export default {registerUser} ;
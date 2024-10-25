import asynHandler from "../utils/asynHandler.js"

const registerUser = asynHandler( async (req, res) => {
    res.status(500).json({message: "Register User how "})
})  


export  { registerUser} ;
//const asyncHandler = (fun) => {async ()=>{}}


// const asynHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json(
//             {
//                 success: false,
//                 message: error.message
//             })

// }

const asynHandler = (fun) => {
    return (req,res,  next) => {
        Promise.resolve(fun(req, res, next)).catch((err) => next(err));
    };
};



export default  asynHandler 
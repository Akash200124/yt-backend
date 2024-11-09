import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")

    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
})



const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'thumnail') { // If field is for image files
        if (file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg') {
            cb(null, true); // Accept image files
        } else {
            cb(null, false); // Reject non-image files for 'image' field
        }
    } else if (file.fieldname === 'videoFile') { // If field is for video files
        if (file.mimetype === 'video/mp4') {
            cb(null, true); // Accept video files
        } else {
            cb(null, false); // Reject non-video files for 'video' field
        }
    } else {
        cb(null, false); // Reject files for unknown fields
    }
}


export const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: fileFilter
}) 
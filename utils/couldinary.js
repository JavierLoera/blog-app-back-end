import cloudinary from 'cloudinary'
import dotenv from 'dotenv'


dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.COULDINARY_KEY,
    api_secret: process.env.COULDINARY_SECRET
});

export const cloudinaryUploadImage = async fileToUpload => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resource_type: "auto",
        });
        return {
            url: data?.secure_url,
        };
    } catch (error) {
        return error;
    }
};
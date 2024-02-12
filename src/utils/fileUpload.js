import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudianryFileUpload = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //Else upload file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //uploaded
    //console.log("File has been uploaded successfully!!", response.url);
    fs.unlinkSync(localFilePath);
    //console.log(response);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Temporarily save vako file lai remove gardinchha local server bata
    return null;
  }
};

export { cloudianryFileUpload };

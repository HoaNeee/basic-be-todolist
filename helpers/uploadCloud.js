const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// config cloud
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//End config cloud

let streamUpload = async (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: "learn-node",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports.upload = async (buffer) => {
  let result = await streamUpload(buffer);
  return result;
};

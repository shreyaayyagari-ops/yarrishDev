const path = require("path");
const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new AWS.S3();

exports.uploadFile = async (file, bucket, folder) => {
    if (!file || !bucket || !folder) return null;
    const extension = path.extname(file.name);
    const filename = `${Date.now()}${extension}`;
    const fileContent = file.data;
    const params = {
        Bucket: 'yaarish',
        Key: `${folder}/${filename}`,
        Body: fileContent,
        ContentType: file.mimetype
    } 
    const profilePicPath = await s3.upload(params).promise();
    const s3Url = profilePicPath.Location;
    return s3Url;
}

exports.deleteFile = async (picPath, bucket, folder) => {
    if (!picPath || !bucket || !folder) return null;
    const fileKey = picPath.split(`${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
    if (!fileKey || !fileKey.startsWith(folder)) {
        console.log("Invalid file key or folder mismatch");
        return null;
    }
    const params = {
        Bucket: bucket,
        Key: fileKey
    };
    try {
        const result = await s3.deleteObject(params).promise();
        console.log("File deleted successfully from S3:", result);
        return true;
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        return false;
    }
};
const {GetObjectCommand, PutObjectCommand} = require("@aws-sdk/client-s3") ;
const {getSignedUrl} = require( "@aws-sdk/s3-request-presigner");
const s3Client = require("../config/awsConfig");

async function getObjectURL(key){
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
    })
    const url = await getSignedUrl(s3Client, command);
    return url;
}

async function putObjectURL(fileName, contentType){
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: `${process.env.AWS_FILE_PATH}/${fileName}`,
        ContentType: contentType,
    })

    const url = await getSignedUrl(s3Client, command);
    return url;
}

module.exports = {
    getObjectURL,
    putObjectURL,
}
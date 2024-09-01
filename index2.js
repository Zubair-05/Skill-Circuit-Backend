const {S3Client, GetObjectCommand, PutObjectCommand} = require("@aws-sdk/client-s3") ;
const {getSignedUrl} = require( "@aws-sdk/s3-request-presigner");
const {OAuth2Client} = require("google-auth-library");
require('dotenv').config()

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
})

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

async function init(){
    // const url = await getObjectURL("Mahammad Zubair_resume.pdf")
    const url = await putObjectURL(`image-${Date.now()}.png`, "image/png");
    console.log(url)
}

init();
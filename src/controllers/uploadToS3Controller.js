const s3Service = require('../services/s3service');

const imageUpload = async (req, res) => {
    try{
        const url = await s3Service.putObjectURL(req.body.fileName, req.body.contentType);
        res.status(200).send({url:url, fileUrl:`${process.env.S3_BASE_URL}${req.body.fileName}`});
    } catch (e){
        return res.status(500).send({message:"Something went wrong"});
    }

}

module.exports = {
    imageUpload
}
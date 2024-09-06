const s3Service = require('../services/s3service');

const imageUpload = async (req, res) => {
    const url = s3Service.putObjectURL(req.body.fileName, req.body.contentType);
    res.status(200).send(url);
}

module.exports = {
    imageUpload
}
const express = require('express');
const router = express.Router();
const uploadToS3Controller = require('../controllers/uploadToS3Controller');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/upload-image', authenticateToken, uploadToS3Controller.imageUpload);
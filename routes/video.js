const express = require('express');
const multer = require('multer');
const path = require('path');
const Video = require('../models/video');

const router = express.Router();

// Set up storage for videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Upload video API (POST)
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        // Save video info to DB
        const newVideo = new Video({
            title: req.body.title,
            url: `/uploads/videos/${req.file.filename}`, // Local path or construct S3 URL if S3
            description: req.body.description || ""
        });
        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch all videos
router.get('/', async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
});

module.exports = router;

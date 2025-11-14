const express = require('express');
const path = require('path');
const multer = require('multer');
const adminAuth = require('../middleware/adminAuth');
const Media = require('../models/Media');

const router = express.Router();

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']);

const storage = multer.memoryStorage();

const MAX_UPLOAD_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024, 10);

const upload = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_SIZE },
    fileFilter: (req, file, cb) => {
        const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
        const ext = path.extname(file.originalname || '').toLowerCase();
        if (!isImageMime && !IMAGE_EXTENSIONS.has(ext)) {
            return cb(new Error('Only image uploads are allowed'));
        }
        cb(null, true);
    }
});

router.get('/', adminAuth, async (req, res) => {
    try {
        const mediaItems = await Media.find().sort({ createdAt: -1 }).select('-data');
        res.json(mediaItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', adminAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const mediaItem = new Media({
            originalName: req.file.originalname,
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            storage: 'database',
            metadata: {
                folder: req.body?.folder || 'default'
            },
            data: req.file.buffer,
            uploadedBy: req.user ? req.user.id : undefined
        });

        mediaItem.url = `/api/media/${mediaItem._id}`;
        await mediaItem.save();

        res.status(201).json({
            _id: mediaItem._id,
            originalName: mediaItem.originalName,
            mimeType: mediaItem.mimeType,
            size: mediaItem.size,
            url: mediaItem.url,
            storage: mediaItem.storage,
            metadata: mediaItem.metadata,
            uploadedBy: mediaItem.uploadedBy,
            createdAt: mediaItem.createdAt
        });
    } catch (error) {
        console.error('Media upload failed', error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const mediaItem = await Media.findById(req.params.id);
        if (!mediaItem) {
            return res.status(404).json({ message: 'Media not found' });
        }

        await mediaItem.deleteOne();

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

const express = require('express');
const Media = require('../models/Media');

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const mediaItem = await Media.findById(req.params.id);
        if (!mediaItem || !mediaItem.data) {
            return res.status(404).json({ message: 'Media not found' });
        }

        res.set('Content-Type', mediaItem.mimeType || 'application/octet-stream');
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(mediaItem.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

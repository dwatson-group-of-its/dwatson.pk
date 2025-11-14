const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const Section = require('../models/Section');

const router = express.Router();

function parseConfig(config) {
    if (config === undefined || config === null) return {};
    if (typeof config === 'object') return config;
    if (typeof config === 'string') {
        try {
            return JSON.parse(config);
        } catch (error) {
            return { value: config };
        }
    }
    return {};
}

function buildFilters(query) {
    const filters = {};
    if (query.type) filters.type = query.type;
    if (query.active !== undefined) filters.isActive = query.active === 'true' || query.active === true;
    if (query.published !== undefined) filters.isPublished = query.published === 'true' || query.published === true;
    return filters;
}

router.get('/', adminAuth, async (req, res) => {
    try {
        const filters = buildFilters(req.query);
        const sections = await Section.find(filters).sort({ ordering: 1, createdAt: 1 });
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', adminAuth, async (req, res) => {
    try {
        const payload = {
            name: req.body.name,
            type: req.body.type,
            title: req.body.title,
            subtitle: req.body.subtitle,
            description: req.body.description,
            ordering: req.body.ordering,
            isActive: req.body.isActive,
            isPublished: req.body.isPublished,
            config: parseConfig(req.body.config),
            createdBy: req.user?.id,
            updatedBy: req.user?.id
        };

        if (payload.ordering === undefined || payload.ordering === null) {
            const lastSection = await Section.findOne().sort({ ordering: -1 });
            payload.ordering = lastSection ? lastSection.ordering + 1 : 0;
        }

        const section = new Section(payload);
        await section.save();
        res.status(201).json(section);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', adminAuth, async (req, res) => {
    try {
        const payload = {
            name: req.body.name,
            type: req.body.type,
            title: req.body.title,
            subtitle: req.body.subtitle,
            description: req.body.description,
            ordering: req.body.ordering,
            isActive: req.body.isActive,
            isPublished: req.body.isPublished,
            config: parseConfig(req.body.config),
            updatedBy: req.user?.id
        };

        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const section = await Section.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.json(section);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/:id', adminAuth, async (req, res) => {
    try {
        const section = await Section.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json(section);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/reorder', adminAuth, async (req, res) => {
    try {
        const { order } = req.body;
        if (!Array.isArray(order)) {
            return res.status(400).json({ message: 'Order payload must be an array' });
        }

        const updates = order.map(item => (
            item?.id ? Section.findByIdAndUpdate(item.id, { ordering: item.ordering }, { new: true }) : null
        )).filter(Boolean);

        await Promise.all(updates);
        res.json({ updated: updates.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const section = await Section.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        await section.deleteOne();
        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

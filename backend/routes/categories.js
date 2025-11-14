const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Department = require('../models/Department');
const Media = require('../models/Media');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

async function assignImageFields(target, body) {
    const providedUrl = body.image;
    if (providedUrl !== undefined) {
        target.image = providedUrl;
    }

    const fileId = body.imageFileId;
    if (fileId && fileId !== 'null' && fileId !== 'undefined') {
        const media = await Media.findById(fileId);
        if (!media) {
            const error = new Error('Invalid image file reference');
            error.statusCode = 400;
            throw error;
        }
        target.imageUpload = media._id;
        if (!target.image) {
            target.image = media.url;
        }
    } else if (fileId === '' || fileId === null) {
        target.imageUpload = undefined;
    }
}

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('department', 'name')
            .populate('imageUpload');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get featured categories
router.get('/featured', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true, isFeatured: true })
            .populate('department', 'name')
            .populate('imageUpload');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get categories by department
router.get('/department/:departmentId', async (req, res) => {
    try {
        const categories = await Category.find({
            department: req.params.departmentId,
            isActive: true
        })
            .populate('department', 'name')
            .populate('imageUpload');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('department', 'name')
            .populate('imageUpload');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new category (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const department = await Department.findById(req.body.department);
        if (!department) {
            return res.status(400).json({ message: 'Invalid department' });
        }

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            department: req.body.department,
            isFeatured: req.body.isFeatured || false,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });

        await assignImageFields(category, req.body);

        const newCategory = await category.save();
        const populatedCategory = await Category.findById(newCategory._id)
            .populate('department', 'name')
            .populate('imageUpload');
        res.status(201).json(populatedCategory);
    } catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ message: err.message });
    }
});

// Update a category (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (req.body.department) {
            const department = await Department.findById(req.body.department);
            if (!department) {
                return res.status(400).json({ message: 'Invalid department' });
            }
            category.department = req.body.department;
        }

        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;
        category.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : category.isFeatured;

        await assignImageFields(category, req.body);

        await category.save();
        const populatedCategory = await Category.findById(category._id)
            .populate('department', 'name')
            .populate('imageUpload');
        res.json(populatedCategory);
    } catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ message: err.message });
    }
});

// Delete a category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.isActive = false;
        await category.save();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
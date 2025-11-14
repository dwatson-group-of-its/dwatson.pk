const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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

// Get all products
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, department, search } = req.query;
        const query = { isActive: true };

        if (category) query.category = category;
        if (department) query.department = department;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get trending products
router.get('/trading', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isTrending: true })
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload')
            .limit(8);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get discounted products
router.get('/discounted', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, discount: { $gt: 0 } })
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload')
            .limit(8);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get new arrivals
router.get('/new', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isNewArrival: true })
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload')
            .limit(8);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new product (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            discount: req.body.discount || 0,
            image: req.body.image,
            images: req.body.images || [],
            category: req.body.category,
            department: category.department,
            stock: req.body.stock,
            isFeatured: req.body.isFeatured || false,
            isTrending: req.body.isTrending || false,
            isNewArrival: req.body.isNewArrival || false,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });

        await assignImageFields(product, req.body);

        const newProduct = await product.save();
        const populatedProduct = await Product.findById(newProduct._id)
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload');
        res.status(201).json(populatedProduct);
    } catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ message: err.message });
    }
});

// Update a product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            product.category = req.body.category;
            product.department = category.department;
        }

        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price !== undefined ? req.body.price : product.price;
        product.discount = req.body.discount !== undefined ? req.body.discount : product.discount;
        product.images = Array.isArray(req.body.images) ? req.body.images : product.images;
        product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
        product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
        product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;
        product.isTrending = req.body.isTrending !== undefined ? req.body.isTrending : product.isTrending;
        product.isNewArrival = req.body.isNewArrival !== undefined ? req.body.isNewArrival : product.isNewArrival;

        await assignImageFields(product, req.body);

        await product.save();
        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload');
        res.json(populatedProduct);
    } catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ message: err.message });
    }
});

// Delete a product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isActive = false;
        await product.save();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
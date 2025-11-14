const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Department = require('../models/Department');
const Category = require('../models/Category');

// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { 
            departmentId, 
            categoryId, 
            search,
            minPrice,
            maxPrice,
            filter,
            sort = 'name',
            page = 1,
            limit = 20
        } = req.query;

        const query = { isActive: true };

        if (departmentId) {
            query.department = departmentId;
        }

        if (categoryId) {
            query.category = categoryId;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Handle filter parameter (trending, discounted, new)
        if (filter === 'trending') {
            query.isTrending = true;
        } else if (filter === 'discounted') {
            query.discount = { $gt: 0 };
        } else if (filter === 'new') {
            query.isNewArrival = true;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let sortQuery = {};
        switch(sort) {
            case 'price-asc':
                sortQuery = { price: 1 };
                break;
            case 'price-desc':
                sortQuery = { price: -1 };
                break;
            case 'name':
            default:
                sortQuery = { name: 1 };
        }

        const products = await Product.find(query)
            .populate('category', 'name _id')
            .populate('department', 'name _id')
            .populate('imageUpload')
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        // Get all departments and categories for filters
        const departments = await Department.find({ isActive: true }).select('name _id').sort({ name: 1 });
        const categories = await Category.find({ isActive: true }).select('name _id department').populate('department', 'name').sort({ name: 1 });

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            filters: {
                departments,
                categories
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name _id')
            .populate('department', 'name _id')
            .populate('imageUpload');
        
        if (!product || !product.isActive) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


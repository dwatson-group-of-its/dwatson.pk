const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Slider = require('../models/Slider');
const Banner = require('../models/Banner');
const User = require('../models/User');

// Dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const departmentsCount = await Department.countDocuments({ isActive: true });
        const categoriesCount = await Category.countDocuments({ isActive: true });
        const productsCount = await Product.countDocuments({ isActive: true });
        const usersCount = await User.countDocuments({ isActive: true });

        res.json({
            departments: departmentsCount,
            categories: categoriesCount,
            products: productsCount,
            users: usersCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all departments (admin)
router.get('/departments', adminAuth, async (req, res) => {
    try {
        const departments = await Department.find().populate('imageUpload');
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all categories (admin)
router.get('/categories', adminAuth, async (req, res) => {
    try {
        const categories = await Category.find().populate('department', 'name').populate('imageUpload');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all products (admin)
router.get('/products', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const products = await Product.find()
            .populate('category', 'name')
            .populate('department', 'name')
            .populate('imageUpload')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Product.countDocuments();

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all sliders (admin)
router.get('/sliders', adminAuth, async (req, res) => {
    try {
        const sliders = await Slider.find().populate('imageUpload');
        res.json(sliders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all banners (admin)
router.get('/banners', adminAuth, async (req, res) => {
    try {
        const banners = await Banner.find().populate('imageUpload');
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all users (admin)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const users = await User.find()
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments();

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
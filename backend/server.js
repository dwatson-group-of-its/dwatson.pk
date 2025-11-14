const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const sliderRoutes = require('./routes/sliders');
const bannerRoutes = require('./routes/banners');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const mediaRoutes = require('./routes/media');
const mediaPublicRoutes = require('./routes/media-public');
const adminSectionRoutes = require('./routes/sections');
const publicSectionsRoutes = require('./routes/sections-public');
const reportsRoutes = require('./routes/reports');
const departmentsPublicRoutes = require('./routes/departments-public');
const categoriesPublicRoutes = require('./routes/categories-public');
const productsPublicRoutes = require('./routes/products-public');
const contactRoutes = require('./routes/contact');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwatson_pk', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/media', mediaPublicRoutes);
app.use('/api/admin/sections', adminSectionRoutes);
app.use('/api/sections', publicSectionsRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/public/departments', departmentsPublicRoutes);
app.use('/api/public/categories', categoriesPublicRoutes);
app.use('/api/public/products', productsPublicRoutes);
app.use('/api/contact', contactRoutes);

// Admin dashboard route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Cart page route
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cart.html'));
});

app.get('/cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cart.html'));
});

// Department page route (must be after static files but before catch-all)
app.get('/department/:id', (req, res) => {
    const id = req.params.id;
    // Only serve HTML if it looks like an ID (ObjectId format or simple string without file extension)
    // Reject if it contains a dot (likely a file request like .js, .css, etc.)
    if (id.includes('.') || id.includes('/')) {
        return res.status(404).send('Not found');
    }
    res.sendFile(path.join(__dirname, '../frontend/department.html'));
});

// Category page route
app.get('/category/:id', (req, res) => {
    const id = req.params.id;
    if (id.includes('.') || id.includes('/')) {
        return res.status(404).send('Not found');
    }
    res.sendFile(path.join(__dirname, '../frontend/category.html'));
});

// Products page route
app.get('/products', (req, res) => {
    if (req.path.includes('.')) {
        return res.status(404).send('Not found');
    }
    res.sendFile(path.join(__dirname, '../frontend/products.html'));
});

// Product detail page route
app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    if (id.includes('.') || id.includes('/')) {
        return res.status(404).send('Not found');
    }
    res.sendFile(path.join(__dirname, '../frontend/product.html'));
});

// About Us page route
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});

// Contact page route
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});

// Login page route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Register page route
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// Catch-all handler to serve the frontend for any non-API routes
app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
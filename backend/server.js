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
// LEGACY SECTIONS - NO LONGER USED
// const adminSectionRoutes = require('./routes/sections');
// const publicSectionsRoutes = require('./routes/sections-public');
const homepageSectionsRoutes = require('./routes/homepage-sections');
const reportsRoutes = require('./routes/reports');
const brandsRoutes = require('./routes/brands');
const videoBannersRoutes = require('./routes/video-banners');
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
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('⚠️  WARNING: MONGODB_URI environment variable is not set!');
    console.error('Database connection will fail. Please set MONGODB_URI in Heroku config.');
}

mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/dwatson_pk', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(async () => {
    console.log('✅ MongoDB connected successfully');
    
    // Ensure admin user exists
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dwatson.pk';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    try {
        const adminUser = await User.findOne({ email: adminEmail.toLowerCase().trim() });
        if (!adminUser) {
            console.log('📝 Creating admin user...');
            await User.create({
                name: 'Admin',
                email: adminEmail.toLowerCase().trim(),
                password: adminPassword,
                role: 'admin',
                isActive: true
            });
            console.log(`✅ Admin user created: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
        } else {
            console.log(`✅ Admin user already exists: ${adminEmail}`);
        }
    } catch (error) {
        console.error('❌ Error ensuring admin user:', error.message);
        console.error('   Stack:', error.stack);
    }
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Make sure MONGODB_URI is set correctly in Heroku config');
    console.error('   Error details:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
            state: dbStates[dbState] || 'unknown',
            readyState: dbState
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            hasMongoUri: !!process.env.MONGODB_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasAdminEmail: !!process.env.ADMIN_EMAIL
        }
    });
});

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
// LEGACY SECTIONS - NO LONGER USED
// app.use('/api/admin/sections', adminSectionRoutes);
// app.use('/api/sections', publicSectionsRoutes);
app.use('/api/homepage-sections', homepageSectionsRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/brands', brandsRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/admin/video-banners', videoBannersRoutes);
app.use('/api/video-banners', videoBannersRoutes);
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
const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('../models/Department');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Sample products data
const sampleProducts = [
    // Medicine Department Products
    {
        name: 'Paracetamol 500mg Tablets',
        description: 'Effective pain relief and fever reducer. Suitable for adults and children over 12 years.',
        price: 150,
        discount: 10,
        stock: 100,
        department: 'Medicine',
        category: 'Pain Relief',
        isFeatured: true,
        isTrending: true
    },
    {
        name: 'Ibuprofen 400mg Tablets',
        description: 'Anti-inflammatory pain reliever for headaches, muscle pain, and arthritis.',
        price: 250,
        discount: 0,
        stock: 80,
        department: 'Medicine',
        category: 'Pain Relief',
        isTrending: true
    },
    {
        name: 'Cetirizine 10mg Tablets',
        description: 'Antihistamine for allergy relief, hay fever, and skin allergies.',
        price: 200,
        discount: 15,
        stock: 120,
        department: 'Medicine',
        category: 'Allergy Medicine',
        isFeatured: true
    },
    {
        name: 'Omeprazole 20mg Capsules',
        description: 'Proton pump inhibitor for acid reflux and stomach ulcers.',
        price: 350,
        discount: 5,
        stock: 90,
        department: 'Medicine',
        category: 'Stomach Medicine',
        isNewArrival: true
    },
    {
        name: 'Aspirin 75mg Tablets',
        description: 'Low-dose aspirin for heart health and blood thinning.',
        price: 180,
        discount: 0,
        stock: 150,
        department: 'Medicine',
        category: 'Heart Medicine',
        isFeatured: true
    },
    {
        name: 'Vitamin D3 1000IU Capsules',
        description: 'Essential vitamin for bone health and immune system support.',
        price: 450,
        discount: 20,
        stock: 200,
        department: 'Medicine',
        category: 'Vitamins & Supplements',
        isTrending: true
    },
    {
        name: 'Multivitamin Tablets',
        description: 'Complete daily multivitamin for overall health and wellness.',
        price: 600,
        discount: 10,
        stock: 180,
        department: 'Medicine',
        category: 'Vitamins & Supplements',
        isFeatured: true
    },
    // Cosmetics Department Products
    {
        name: 'Matte Lipstick - Red',
        description: 'Long-lasting matte lipstick in classic red. Cruelty-free and vegan.',
        price: 1200,
        discount: 25,
        stock: 50,
        department: 'Cosmetics',
        category: 'Color Cosmetics',
        isFeatured: true,
        isTrending: true
    },
    {
        name: 'Foundation - Natural Beige',
        description: 'Full coverage foundation with SPF 30. Suitable for all skin types.',
        price: 2500,
        discount: 15,
        stock: 40,
        department: 'Cosmetics',
        category: 'Color Cosmetics',
        isNewArrival: true
    },
    {
        name: 'Moisturizing Face Cream',
        description: 'Daily moisturizer with hyaluronic acid for hydrated, glowing skin.',
        price: 1800,
        discount: 20,
        stock: 60,
        department: 'Cosmetics',
        category: 'Skincare',
        isFeatured: true
    },
    {
        name: 'Sunscreen SPF 50',
        description: 'Broad spectrum sunscreen for protection against UVA and UVB rays.',
        price: 1500,
        discount: 10,
        stock: 70,
        department: 'Cosmetics',
        category: 'Skincare',
        isTrending: true
    },
    {
        name: 'Anti-Aging Serum',
        description: 'Advanced anti-aging serum with retinol and vitamin C.',
        price: 3500,
        discount: 30,
        stock: 30,
        department: 'Cosmetics',
        category: 'Skincare',
        isFeatured: true,
        isNewArrival: true
    },
    {
        name: 'Mascara - Black',
        description: 'Volumizing mascara for longer, fuller lashes. Waterproof formula.',
        price: 800,
        discount: 0,
        stock: 55,
        department: 'Cosmetics',
        category: 'Color Cosmetics',
        isTrending: true
    },
    {
        name: 'Face Cleanser',
        description: 'Gentle daily cleanser for all skin types. Removes makeup and impurities.',
        price: 950,
        discount: 15,
        stock: 65,
        department: 'Cosmetics',
        category: 'Skincare',
        isFeatured: true
    },
    {
        name: 'Eyeshadow Palette - Nude',
        description: '12-shade nude eyeshadow palette with matte and shimmer finishes.',
        price: 2200,
        discount: 20,
        stock: 35,
        department: 'Cosmetics',
        category: 'Color Cosmetics',
        isNewArrival: true
    }
];

async function addSampleProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwatson_pk', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Get all departments and categories
        const departments = await Department.find({ isActive: true });
        const categories = await Category.find({ isActive: true }).populate('department');

        console.log(`Found ${departments.length} departments and ${categories.length} categories`);

        // Create a map for quick lookup
        const deptMap = {};
        departments.forEach(dept => {
            deptMap[dept.name] = dept._id;
        });

        const catMap = {};
        categories.forEach(cat => {
            const deptName = cat.department?.name || '';
            const key = `${deptName}-${cat.name}`;
            catMap[key] = cat._id;
        });

        let added = 0;
        let skipped = 0;

        for (const productData of sampleProducts) {
            const deptId = deptMap[productData.department];
            const catKey = `${productData.department}-${productData.category}`;
            const catId = catMap[catKey];

            if (!deptId) {
                console.log(`Skipping ${productData.name}: Department "${productData.department}" not found`);
                skipped++;
                continue;
            }

            if (!catId) {
                console.log(`Skipping ${productData.name}: Category "${productData.category}" not found in department "${productData.department}"`);
                skipped++;
                continue;
            }

            // Check if product already exists
            const existing = await Product.findOne({ 
                name: productData.name,
                department: deptId,
                category: catId
            });

            if (existing) {
                console.log(`Product "${productData.name}" already exists, skipping...`);
                skipped++;
                continue;
            }

            const product = new Product({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                discount: productData.discount || 0,
                stock: productData.stock,
                department: deptId,
                category: catId,
                isFeatured: productData.isFeatured || false,
                isTrending: productData.isTrending || false,
                isNewArrival: productData.isNewArrival || false,
                isActive: true
            });

            await product.save();
            console.log(`✓ Added: ${productData.name}`);
            added++;
        }

        console.log(`\n✅ Completed! Added ${added} products, skipped ${skipped} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error adding sample products:', error);
        process.exit(1);
    }
}

addSampleProducts();


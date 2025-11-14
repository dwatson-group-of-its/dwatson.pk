// scripts/initDatabase.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Department = require('../models/Department');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Slider = require('../models/Slider');
const Banner = require('../models/Banner');
const User = require('../models/User');
const Section = require('../models/Section');

const adminEmail = process.env.ADMIN_EMAIL || 'admin@dwatson.pk';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwatson_pk', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
    initializeDatabase();
})
.catch(err => console.log('MongoDB connection error:', err));

async function initializeDatabase() {
    try {
        // Clear existing data
        await Department.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Slider.deleteMany({});
        await Banner.deleteMany({});
        await User.deleteMany({});
        
        console.log('Cleared existing data');
        
        // Create departments
        const medicineDept = await Department.create({
            name: 'Medicine',
            description: 'All types of medicines for various health conditions',
            image: 'https://dwatson.pk/media/wysiwyg/medicines_3.png'
        });
        
        const cosmeticsDept = await Department.create({
            name: 'Cosmetics',
            description: 'Beauty and personal care products',
            image: 'https://dwatson.pk/media/wysiwyg/Cosmetics.png'
        });
        
        const perfumeDept = await Department.create({
            name: 'Perfume',
            description: 'Fragrances for men and women',
            image: 'https://dwatson.pk/media/wysiwyg/fragnances.png'
        });
        
        const groceryDept = await Department.create({
            name: 'Grocery',
            description: 'Food and household items',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        });
        
        const crockeryDept = await Department.create({
            name: 'Crockery',
            description: 'Kitchen and dining items',
            image: 'https://images.unsplash.com/photo-1523365280197-f1783db9fe62?auto=format&fit=crop&w=800&q=80'
        });
        
        const undergarmentsDept = await Department.create({
            name: 'Undergarments',
            description: 'Innerwear for men and women',
            image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
        });
        
        const opticianDept = await Department.create({
            name: 'Optician',
            description: 'Eyeglasses and contact lenses',
            image: 'https://images.unsplash.com/photo-1510925758641-869d353cecc0?auto=format&fit=crop&w=800&q=80'
        });
        
        console.log('Created departments');
        
        // Create categories for Medicine department
        const allergyCat = await Category.create({
            name: 'Allergy Medicine',
            description: 'Medicines for allergies',
            image: 'https://images.unsplash.com/photo-1580281780460-92f78080ade9?auto=format&fit=crop&w=1200&q=90',
            department: medicineDept._id,
            isFeatured: true
        });
        
        const heartCat = await Category.create({
            name: 'Heart Medicine',
            description: 'Medicines for heart conditions',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=90',
            department: medicineDept._id,
            isFeatured: true
        });
        
        const stomachCat = await Category.create({
            name: 'Stomach Medicine',
            description: 'Medicines for stomach issues',
            image: 'https://images.unsplash.com/photo-1580894908373-fb1d4780d151?auto=format&fit=crop&w=1200&q=90',
            department: medicineDept._id,
            isFeatured: true
        });
        
        const painCat = await Category.create({
            name: 'Pain Relief',
            description: 'Medicines for pain relief',
            image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=90',
            department: medicineDept._id,
            isFeatured: true
        });
        
        const vitaminCat = await Category.create({
            name: 'Vitamins & Supplements',
            description: 'Vitamins and dietary supplements',
            image: 'https://images.unsplash.com/photo-1598511723374-3ba6bc5d5b47?auto=format&fit=crop&w=1200&q=90',
            department: medicineDept._id,
            isFeatured: true
        });
        
        // Create categories for Cosmetics department
        const skincareCat = await Category.create({
            name: 'Skincare',
            description: 'Skincare products',
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=90',
            department: cosmeticsDept._id,
            isFeatured: true
        });
        
        const makeupCat = await Category.create({
            name: 'Color Cosmetics',
            description: 'Makeup products',
            image: 'https://images.unsplash.com/photo-1513483460601-25834dd141f2?auto=format&fit=crop&w=1200&q=90',
            department: cosmeticsDept._id,
            isFeatured: true
        });
        
        console.log('Created categories');
        
        // Create sample products
        await Product.create({
            name: 'Panadol Extra',
            description: 'Effective pain relief for headaches and body aches',
            price: 120,
            discount: 10,
            image: 'https://dwatson.pk/media/catalog/product/cache/76af4558267cf27b3c9184e82bae2371/P/a/Panadol_Extra_Tablets_24s.jpeg',
            category: painCat._id,
            department: medicineDept._id,
            stock: 50,
            isTrending: true
        });
        
        await Product.create({
            name: 'Claritin Tablets',
            description: '24-hour relief for indoor and outdoor allergies without drowsiness',
            price: 950,
            discount: 5,
            image: 'https://images.unsplash.com/photo-1580281658629-01d4da01fab8?auto=format&fit=crop&w=800&q=85',
            category: allergyCat._id,
            department: medicineDept._id,
            stock: 80,
            isFeatured: true
        });
        
        await Product.create({
            name: 'Flixotide Nasal Spray',
            description: 'Steroid-based spray to ease chronic allergic rhinitis symptoms',
            price: 1290,
            discount: 8,
            image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=800&q=85',
            category: allergyCat._id,
            department: medicineDept._id,
            stock: 45,
            isNewArrival: true
        });
        
        await Product.create({
            name: 'Zyrtec Kids Syrup',
            description: 'Gentle allergy relief formulated for children above two years',
            price: 720,
            image: 'https://images.unsplash.com/photo-1588258219510-052ce3278211?auto=format&fit=crop&w=800&q=85',
            category: allergyCat._id,
            department: medicineDept._id,
            stock: 60
        });
        
        await Product.create({
            name: 'Aspirin 75mg',
            description: 'Low dose aspirin for heart health',
            price: 150,
            image: 'https://dwatson.pk/media/catalog/product/cache/76af4558267cf27b3c9184e82bae2371/A/s/Aspirin_Tablets_75mg.jpg',
            category: heartCat._id,
            department: medicineDept._id,
            stock: 40,
            isFeatured: true
        });
        
        await Product.create({
            name: 'CardioPlus Capsules',
            description: 'Omega-3 supplement designed to support heart function and circulation',
            price: 1680,
            discount: 12,
            image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=800&q=85',
            category: heartCat._id,
            department: medicineDept._id,
            stock: 70,
            isFeatured: true
        });
        
        await Product.create({
            name: 'Blood Pressure Monitor',
            description: 'Portable arm cuff monitor with Bluetooth app syncing',
            price: 5490,
            image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=85',
            category: heartCat._id,
            department: medicineDept._id,
            stock: 30,
            isTrending: true
        });
        
        await Product.create({
            name: 'CoQ10 Softgels',
            description: 'Coenzyme Q10 antioxidant supplement for cardiovascular health',
            price: 2100,
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85',
            category: heartCat._id,
            department: medicineDept._id,
            stock: 55
        });
        
        await Product.create({
            name: 'Vitamin C Tablets',
            description: 'Immune system support',
            price: 200,
            discount: 15,
            image: 'https://dwatson.pk/media/catalog/product/cache/76af4558267cf27b3c9184e82bae2371/V/i/Vitamin_C_Tablets.jpeg',
            category: vitaminCat._id,
            department: medicineDept._id,
            stock: 60,
            isNewArrival: true
        });
        
        await Product.create({
            name: 'Immune Defense Gummies',
            description: 'Vitamin C, D and Zinc gummies for all-day immune support',
            price: 1450,
            image: 'https://images.unsplash.com/photo-1560790671-b76ca4de58f2?auto=format&fit=crop&w=800&q=85',
            category: vitaminCat._id,
            department: medicineDept._id,
            stock: 88,
            isTrending: true
        });
        
        await Product.create({
            name: 'Prenatal Multivitamin',
            description: 'Complete prenatal formula with folic acid and iron',
            price: 1850,
            image: 'https://images.unsplash.com/photo-1586473219010-2ffc57b0f0c4?auto=format&fit=crop&w=800&q=85',
            category: vitaminCat._id,
            department: medicineDept._id,
            stock: 60,
            isNewArrival: true
        });
        
        await Product.create({
            name: 'Magnesium Powder Drink',
            description: 'Effervescent magnesium drink mix to ease stress and cramps',
            price: 990,
            image: 'https://images.unsplash.com/photo-1606207588344-1d5d839d7f9d?auto=format&fit=crop&w=800&q=85',
            category: vitaminCat._id,
            department: medicineDept._id,
            stock: 70
        });
        
        await Product.create({
            name: 'Moisturizing Cream',
            description: 'Daily moisturizer for all skin types',
            price: 450,
            discount: 20,
            image: 'https://dwatson.pk/media/catalog/product/cache/76af4558267cf27b3c9184e82bae2371/C/r/Creme_21_Body_Lotion_400ml_Normal_Skin_.jpeg',
            category: skincareCat._id,
            department: cosmeticsDept._id,
            stock: 25,
            isTrending: true
        });
        
        await Product.create({
            name: 'Hydrating Gel Cleanser',
            description: 'PH-balanced gel cleanser for daily use and sensitive skin',
            price: 1750,
            image: 'https://images.unsplash.com/photo-1498842812179-c81beecf902c?auto=format&fit=crop&w=800&q=85',
            category: skincareCat._id,
            department: cosmeticsDept._id,
            stock: 85,
            isTrending: true
        });
        
        await Product.create({
            name: 'Retinol Night Serum',
            description: 'Encapsulated retinol serum to boost cell renewal overnight',
            price: 3250,
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85',
            category: skincareCat._id,
            department: cosmeticsDept._id,
            stock: 48,
            isFeatured: true
        });
        
        await Product.create({
            name: 'Mineral Sunscreen SPF50',
            description: 'Lightweight mineral sunscreen that blends seamlessly',
            price: 1950,
            discount: 10,
            image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=85',
            category: skincareCat._id,
            department: cosmeticsDept._id,
            stock: 95
        });
        
        await Product.create({
            name: 'Lipstick - Red',
            description: 'Long-lasting red lipstick',
            price: 650,
            image: 'https://dwatson.pk/media/catalog/product/cache/76af4558267cf27b3c9184e82bae2371/M/a/Maybelline_Color_Sensational_Lipstick_535.jpg',
            category: makeupCat._id,
            department: cosmeticsDept._id,
            stock: 35,
            isNewArrival: true
        });
        
        await Product.create({
            name: 'Velvet Matte Lip Kit',
            description: 'Long-wear liquid lipstick plus liner in bestselling nude shades',
            price: 2150,
            image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=85',
            category: makeupCat._id,
            department: cosmeticsDept._id,
            stock: 76,
            isTrending: true
        });
        
        await Product.create({
            name: 'Illuminating Highlighter Palette',
            description: 'Glow-enhancing powder palette with three universal tones',
            price: 2450,
            image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=85',
            category: makeupCat._id,
            department: cosmeticsDept._id,
            stock: 44,
            isFeatured: true
        });
        
        await Product.create({
            name: 'Precision Brow Kit',
            description: 'Dual-ended pencil and gel for perfectly groomed brows',
            price: 1850,
            discount: 6,
            image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=85',
            category: makeupCat._id,
            department: cosmeticsDept._id,
            stock: 58
        });
        
        await Product.create({
            name: 'Digestive Enzyme Complex',
            description: 'Helps break down food and supports nutrient absorption',
            price: 1400,
            image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e34e?auto=format&fit=crop&w=800&q=85',
            category: stomachCat._id,
            department: medicineDept._id,
            stock: 64,
            isTrending: true
        });
        
        await Product.create({
            name: 'Probiotic Sachets',
            description: 'High-potency probiotics to balance gut flora and ease bloating',
            price: 980,
            discount: 7,
            image: 'https://images.unsplash.com/photo-1611695434398-a0cfa0973360?auto=format&fit=crop&w=800&q=85',
            category: stomachCat._id,
            department: medicineDept._id,
            stock: 52
        });
        
        await Product.create({
            name: 'Herbal Digest Tea',
            description: 'Caffeine-free herbal blend to soothe stomach discomfort',
            price: 620,
            image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=85',
            category: stomachCat._id,
            department: medicineDept._id,
            stock: 42
        });
        
        await Product.create({
            name: 'Ultra Pain Relief Gel',
            description: 'Cooling menthol gel for joint and muscle aches',
            price: 450,
            discount: 5,
            image: 'https://images.unsplash.com/photo-1556228724-4c1e1ad6d812?auto=format&fit=crop&w=800&q=85',
            category: painCat._id,
            department: medicineDept._id,
            stock: 90,
            isTrending: true
        });
        
        await Product.create({
            name: 'Heat Therapy Patch',
            description: 'Self-heating patch that soothes lower back and period cramps',
            price: 320,
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85',
            category: painCat._id,
            department: medicineDept._id,
            stock: 120
        });
        
        await Product.create({
            name: 'Ibuprofen Softgels 400mg',
            description: 'Fast acting softgels for headaches and muscular aches',
            price: 380,
            image: 'https://images.unsplash.com/photo-1607619056574-ef4c7c7820e9?auto=format&fit=crop&w=800&q=85',
            category: painCat._id,
            department: medicineDept._id,
            stock: 110,
            isFeatured: true
        });
        
        console.log('Created categories and products');
        
        // Create sliders
        const heroSlides = [];
        const sliderOne = await Slider.create({
            title: '11.11 Mega Sale',
            description: 'Unmissable discounts on pharmacy essentials and beauty bestsellers',
            image: 'https://dwatson.pk/static/frontend/Magento/luma/en_US/DWatson_HomepageBanner/images/homepage-banners/desktop/cb4e614e21c447dbaad88487c12e853b.png',
            link: '/offers',
            order: 1
        });
        heroSlides.push(sliderOne._id);
        const sliderTwo = await Slider.create({
            title: 'Laica Hot Deals',
            description: 'Premium healthcare devices with exclusive savings',
            image: 'https://dwatson.pk/static/frontend/Magento/luma/en_US/DWatson_HomepageBanner/images/homepage-banners/desktop/5eafbed5cb5f1e0006db407605b5e086.png',
            link: '/departments/health-devices',
            order: 2
        });
        heroSlides.push(sliderTwo._id);
        const sliderThree = await Slider.create({
            title: 'Shop Online & Save',
            description: 'Order online for instant access to member-only promotions',
            image: 'https://dwatson.pk/static/frontend/Magento/luma/en_US/DWatson_HomepageBanner/images/homepage-banners/desktop/25e03bf3c4e384a4d014305e666076db.png',
            link: '/products',
            order: 3
        });
        heroSlides.push(sliderThree._id);

        console.log('Created sliders');

        const sectionsPayload = [
            {
                name: 'Hero Slider',
                type: 'hero',
                ordering: 0,
                isActive: true,
                isPublished: true,
                config: { sliderIds: heroSlides }
            },
            {
                name: 'Promotions Trio',
                type: 'promoGrid',
                ordering: 1,
                isActive: true,
                isPublished: true,
                config: {
                    items: [
                        {
                            title: 'Fragrance Boutique',
                            description: 'Luxury scents curated for every season. Exclusive in-store testers available.',
                            link: '/departments/perfume',
                            image: 'https://dwatson.pk/static/frontend/Magento/luma/en_US/DWatson_HomepageBanner/images/homepage-banners/desktop/25e03bf3c4e384a4d014305e666076db.png'
                        },
                        {
                            title: 'Health Devices',
                            description: 'Smart monitors, thermometers, and mobility aids at member-only prices.',
                            link: '/departments/health-devices',
                            image: 'https://dwatson.pk/static/frontend/Magento/luma/en_US/DWatson_HomepageBanner/images/homepage-banners/desktop/5eafbed5cb5f1e0006db407605b5e086.png'
                        },
                        {
                            title: 'Beauty Vault',
                            description: 'International bestsellers and derm-approved essentials in one place.',
                            link: '/departments/cosmetics',
                            image: 'https://dwatson.pk/static/frontend/Magento/luma/en_US/DWatson_HomepageBanner/images/homepage-banners/desktop/f71b5191cf176dcfdfa702c128204e46.png'
                        }
                    ]
                }
            },
            {
                name: 'Category Spotlights',
                type: 'categorySpotlight',
                ordering: 2,
                isActive: true,
                isPublished: true,
                config: {
                    categoryIds: [],
                    productLimit: 4
                }
            },
            {
                name: 'Brand Partners',
                type: 'brandMarquee',
                ordering: 3,
                isActive: true,
                isPublished: true,
                config: {
                    logos: [
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Logo-maybelline.svg/2560px-Logo-maybelline.svg.png', alt: 'Maybelline' },
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/L%27Or%C3%A9al_logo.svg/512px-L%27Or%C3%A9al_logo.svg.png', alt: 'L\'Oréal' },
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/The_Ordinary_logo.svg/512px-The_Ordinary_logo.svg.png', alt: 'The Ordinary' },
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Clinique_logo.svg/512px-Clinique_logo.svg.png', alt: 'Clinique' },
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Garnier_logo.svg/320px-Garnier_logo.svg.png', alt: 'Garnier' },
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Neutrogena_logo.svg/512px-Neutrogena_logo.svg.png', alt: 'Neutrogena' },
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Nivea_logo.svg/512px-Nivea_logo.svg.png', alt: 'Nivea' },
                        { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Vaseline_logo.svg/512px-Vaseline_logo.svg.png', alt: 'Vaseline' }
                    ]
                }
            },
            {
                name: 'Store CTA',
                type: 'storeCta',
                ordering: 4,
                isActive: true,
                isPublished: true,
                config: {
                    eyebrow: 'Visit Us In-Store',
                    title: 'Experience D.Watson Flagship Service',
                    description: 'Book a personalised consultation with our pharmacists and beauty advisors at Blue Area, Islamabad. Same-day prescription filling and skin diagnostics available.',
                    primaryAction: { label: 'Call for Appointment', href: 'tel:+923001234567' },
                    secondaryAction: { label: 'Get Directions', href: 'https://maps.google.com/?q=D.Watson+Blue+Area', external: true },
                    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80'
                }
            },
            {
                name: 'Trending Products',
                type: 'productStrip',
                ordering: 5,
                isActive: true,
                isPublished: true,
                title: 'Trending Now',
                subtitle: 'Carefully chosen for quick relief',
                config: { mode: 'trending', limit: 4 }
            },
            {
                name: 'Discounted Products',
                type: 'productStrip',
                ordering: 6,
                isActive: true,
                isPublished: true,
                title: 'Limited Time Offers',
                subtitle: 'Save more on curated bundles',
                config: { mode: 'discounted', limit: 4 }
            },
            {
                name: 'New Arrivals',
                type: 'productStrip',
                ordering: 7,
                isActive: true,
                isPublished: true,
                title: 'Just In',
                subtitle: 'Fresh arrivals for the season',
                config: { mode: 'new', limit: 4 }
            },
            {
                name: 'Wellness Journal',
                type: 'blogHighlights',
                ordering: 8,
                isActive: true,
                isPublished: true,
                config: {
                    articles: [
                        {
                            tag: 'Health Talk',
                            title: 'Understanding Blood Pressure Medications',
                            description: 'Our pharmacists break down common prescriptions, potential side effects, and the lifestyle habits that make them work better.',
                            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
                            link: '/blog/blood-pressure-advice'
                        },
                        {
                            tag: 'Beauty Lab',
                            title: 'Layering Skincare for Islamabad’s Climate',
                            description: 'Discover dermatologist-approved routines that hydrate, brighten, and protect your skin in high-altitude conditions.',
                            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
                            link: '/blog/skincare-layering'
                        },
                        {
                            tag: 'Family Care',
                            title: 'Building an Immunity Plan for Your Kids',
                            description: 'Pediatricians share supplement tips, diet additions, and vaccination reminders to keep your little ones protected.',
                            image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80',
                            link: '/blog/immunity-plan'
                        }
                    ]
                }
            }
        ];

        await Section.deleteMany({});
        const createdSections = await Section.insertMany(sectionsPayload);

        // attach category ids to category spotlight section now that categories exist
        const spotlightSection = createdSections.find(section => section.type === 'categorySpotlight');
        if (spotlightSection) {
            const categoryIds = await Category.find({}, '_id').then(docs => docs.map(doc => doc._id));
            spotlightSection.config = {
                categoryIds,
                productLimit: 4
            };
            await spotlightSection.save();
        }

        console.log('Created homepage sections');
        
        // Create banners
        await Banner.create({
            title: 'Special Offer on Perfumes',
            description: 'Buy 1 Get 1 Free on selected fragrances',
            image: 'https://dwatson.pk/static/frontend/Magento/luma/en_US/DWatson_HomepageBanner/images/homepage-banners/desktop/25e03bf3c4e384a4d014305e666076db.png',
            link: '/departments/perfume',
            position: 'middle'
        });
        
        console.log('Created banners');
        
        // Create admin user
        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });
        
        console.log('Created admin user');
        
        console.log('Database initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}
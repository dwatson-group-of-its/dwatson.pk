const express = require('express');
const Section = require('../models/Section');
const Slider = require('../models/Slider');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Media = require('../models/Media');

const router = express.Router();

async function resolveMedia(mediaId) {
    if (!mediaId) return null;
    try {
        const media = await Media.findById(mediaId);
        return media ? media.url : null;
    } catch (error) {
        return null;
    }
}

function resolveImageUrl(primaryUrl, mediaDoc) {
    if (mediaDoc && mediaDoc.url) return mediaDoc.url;
    return primaryUrl || null;
}

async function serializeSlides(sliderIds) {
    let sliders = [];
    if (Array.isArray(sliderIds) && sliderIds.length) {
        sliders = await Slider.find({ _id: { $in: sliderIds }, isActive: true }).sort({ order: 1, createdAt: 1 }).populate('imageUpload');
    }
    if (!sliders.length) {
        sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).populate('imageUpload');
    }

    // Filter out sliders without images and map to slide format
    return sliders
        .filter(slide => {
            // Only include slides that have an image (either from image field or imageUpload)
            const hasImage = slide.image || (slide.imageUpload && slide.imageUpload.url);
            return hasImage;
        })
        .map(slide => ({
            id: slide._id,
            title: slide.title || '',
            description: slide.description || '',
            link: slide.link || '/products',
            image: resolveImageUrl(slide.image, slide.imageUpload)
        }));
}

async function serializeCategories(categoryIds, limit) {
    let categories = [];
    if (Array.isArray(categoryIds) && categoryIds.length) {
        categories = await Category.find({ _id: { $in: categoryIds }, isActive: true }).populate('imageUpload').populate('department', 'name');
    }
    if (!categories.length) {
        categories = await Category.find({ isActive: true, isFeatured: true }).populate('imageUpload').populate('department', 'name');
    }

    const productLimit = limit || 4;

    const results = [];
    for (const category of categories) {
        const products = await Product.find({ category: category._id, isActive: true })
            .populate('category', 'name')
            .populate('imageUpload')
            .sort({ createdAt: -1 })
            .limit(productLimit);

        results.push({
            id: category._id,
            name: category.name,
            description: category.description,
            image: resolveImageUrl(category.image, category.imageUpload),
            department: category.department ? { id: category.department._id, name: category.department.name } : null,
            products: products.map(p => serializeProduct(p))
        });
    }
    return results;
}

function buildProductQuery(mode) {
    const query = { isActive: true };
    switch ((mode || '').toLowerCase()) {
        case 'trending':
            query.isTrending = true;
            break;
        case 'discounted':
            query.discount = { $gt: 0 };
            break;
        case 'new':
        case 'newarrival':
        case 'new-arrival':
            query.isNewArrival = true;
            break;
        default:
            break;
    }
    return query;
}

async function fetchProductsByMode(mode, limit) {
    const query = buildProductQuery(mode);
    return Product.find(query)
        .populate('category', 'name')
        .populate('imageUpload')
        .sort({ createdAt: -1 })
        .limit(limit || 8);
}

function serializeProduct(product) {
    return {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount,
        image: resolveImageUrl(product.image, product.imageUpload),
        stock: product.stock,
        category: product.category ? { id: product.category._id, name: product.category.name } : null
    };
}

router.get('/', async (req, res) => {
    try {
        const sections = await Section.find({ isActive: true, isPublished: true })
            .sort({ ordering: 1, createdAt: 1 });

        const output = [];
        for (const section of sections) {
            const config = section.config || {};
            const result = {
                id: section._id,
                name: section.name,
                type: section.type,
                title: section.title,
                subtitle: section.subtitle,
                description: section.description,
                ordering: section.ordering,
                data: {}
            };

            switch (section.type) {
                case 'hero':
                    result.data.slides = await serializeSlides(config.sliderIds);
                    break;
                case 'promoGrid':
                    result.data.items = Array.isArray(config.items) ? config.items : [];
                    break;
                case 'categorySpotlight':
                    result.data.categories = await serializeCategories(config.categoryIds, config.productLimit);
                    break;
                case 'productStrip': {
                    const products = await fetchProductsByMode(config.mode || 'trending', config.limit || 4);
                    result.data.mode = config.mode || 'trending';
                    result.data.products = products.map(p => serializeProduct(p));
                    break;
                }
                case 'brandMarquee':
                    result.data.logos = Array.isArray(config.logos) ? config.logos : [];
                    break;
                case 'storeCta':
                    result.data = {
                        eyebrow: config.eyebrow,
                        title: config.title,
                        description: config.description,
                        primaryAction: config.primaryAction,
                        secondaryAction: config.secondaryAction,
                        image: config.image
                    };
                    break;
                case 'blogHighlights':
                    result.data.articles = Array.isArray(config.articles) ? config.articles : [];
                    break;
                case 'custom':
                default:
                    result.data = config;
                    break;
            }

            output.push(result);
        }

        res.json(output);
    } catch (error) {
        console.error('Error fetching sections', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

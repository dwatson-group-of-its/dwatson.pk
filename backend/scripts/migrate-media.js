const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('../models/Department');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Slider = require('../models/Slider');
const Banner = require('../models/Banner');
const Media = require('../models/Media');

async function createMediaFromUrl(url, metadata = {}) {
    if (!url || url.startsWith('/api/media/')) {
        return null;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch (${response.status})`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        const media = new Media({
            originalName: url.split('/').pop() || 'image',
            filename: url,
            mimeType: response.headers.get('content-type') || 'image/jpeg',
            size: buffer.length,
            storage: 'database',
            metadata,
            data: buffer
        });

        media.url = `/api/media/${media._id}`;
        await media.save();

        return media;
    } catch (error) {
        console.warn(`Unable to cache image ${url}: ${error.message}`);
        return null;
    }
}

async function migrateModel(Model, { imageField = 'image', imageUploadField = 'imageUpload', folder }) {
    const docs = await Model.find({
        [imageField]: { $exists: true, $ne: null, $ne: '' },
        $or: [
            { [imageUploadField]: { $exists: false } },
            { [imageUploadField]: null }
        ]
    });

    let updated = 0;

    for (const doc of docs) {
        const currentUrl = doc[imageField];
        if (!currentUrl || currentUrl.startsWith('/api/media/')) {
            continue;
        }

        const media = await createMediaFromUrl(currentUrl, { folder, model: Model.modelName, sourceUrl: currentUrl });
        if (!media) {
            continue;
        }

        doc[imageField] = media.url;
        doc[imageUploadField] = media._id;

        try {
            await doc.save();
            updated += 1;
        } catch (error) {
            console.warn(`Failed to update ${Model.modelName} ${doc._id}: ${error.message}`);
        }
    }

    return updated;
}

async function migrateProducts() {
    const docs = await Product.find({
        image: { $exists: true, $ne: null, $ne: '' },
        $or: [{ imageUpload: { $exists: false } }, { imageUpload: null }]
    });

    let updated = 0;

    for (const doc of docs) {
        if (!doc.image || doc.image.startsWith('/api/media/')) {
            continue;
        }

        const media = await createMediaFromUrl(doc.image, { folder: 'products', model: 'Product', sourceUrl: doc.image });
        if (!media) {
            continue;
        }

        doc.image = media.url;
        doc.imageUpload = media._id;

        if (Array.isArray(doc.images) && doc.images.length) {
            doc.images = doc.images.map(img => (img && !img.startsWith('/api/media/') ? media.url : img));
        }

        try {
            await doc.save();
            updated += 1;
        } catch (error) {
            console.warn(`Failed to update product ${doc._id}: ${error.message}`);
        }
    }

    return updated;
}

async function runMigration() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwatson_pk', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log('MongoDB connected');

    const results = {};

    results.departments = await migrateModel(Department, { folder: 'departments' });
    results.categories = await migrateModel(Category, { folder: 'categories' });
    results.banners = await migrateModel(Banner, { folder: 'banners' });
    results.sliders = await migrateModel(Slider, { folder: 'sliders' });
    results.products = await migrateProducts();

    console.log('Migration summary:', results);

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
}

runMigration().catch(error => {
    console.error('Migration failed', error);
    mongoose.disconnect();
    process.exit(1);
});


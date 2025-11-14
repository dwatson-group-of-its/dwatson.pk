const mongoose = require('mongoose');
require('dotenv').config();

const Section = require('../models/Section');
const Slider = require('../models/Slider');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwatson_pk', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected');

        const sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        const sliderIds = sliders.map(slider => slider._id);

        console.log('Active sliders:', sliderIds);

        const heroSection = await Section.findOne({ type: 'hero' });
        if (!heroSection) {
            console.warn('No hero section found.');
            return;
        }

        heroSection.config = {
            ...(heroSection.config || {}),
            sliderIds
        };

        await heroSection.save();

        console.log('Updated hero section', heroSection._id.toString(), 'with slider IDs', sliderIds);
    } catch (error) {
        console.error('Failed to update hero section', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
}

run();


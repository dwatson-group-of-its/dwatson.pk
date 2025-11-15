/**
 * Database Migration Script
 * Migrates all data from old database to new database
 * 
 * Usage:
 * 1. Set OLD_MONGODB_URI in environment or update below
 * 2. Set NEW_MONGODB_URI in environment or update below
 * 3. Run: node scripts/migrate-database.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// OLD DATABASE (update with your current database connection string)
const OLD_MONGODB_URI = process.env.OLD_MONGODB_URI || 'mongodb://localhost:27017/dwatson_pk';

// NEW DATABASE (from .env file)
const NEW_MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dwatsononlineco_db_user:ZuqoJj5gOfUZumDX@cluster0.zjrtlrp.mongodb.net/mydatabase?retryWrites=true&w=majority';

// Import all models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Department = require('../models/Department');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Banner = require('../models/Banner');
const Slider = require('../models/Slider');
const Media = require('../models/Media');
const Brand = require('../models/Brand');
const VideoBanner = require('../models/VideoBanner');
const HomepageSection = require('../models/HomepageSection');

const COLLECTIONS = [
    { name: 'users', model: User },
    { name: 'products', model: Product },
    { name: 'categories', model: Category },
    { name: 'departments', model: Department },
    { name: 'carts', model: Cart },
    { name: 'orders', model: Order },
    { name: 'banners', model: Banner },
    { name: 'sliders', model: Slider },
    { name: 'media', model: Media },
    { name: 'brands', model: Brand },
    { name: 'videobanners', model: VideoBanner },
    { name: 'homepagesections', model: HomepageSection }
];

let oldConnection = null;
let newConnection = null;

async function connectDatabases() {
    try {
        console.log('📡 Connecting to OLD database...');
        oldConnection = await mongoose.createConnection(OLD_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).asPromise();
        console.log('✅ Connected to OLD database');

        console.log('📡 Connecting to NEW database...');
        newConnection = await mongoose.createConnection(NEW_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).asPromise();
        console.log('✅ Connected to NEW database');
    } catch (error) {
        console.error('❌ Connection error:', error);
        throw error;
    }
}

async function migrateCollection(collectionInfo) {
    const { name, model } = collectionInfo;
    
    try {
        console.log(`\n📦 Migrating ${name}...`);
        
        // Get old model instance
        const OldModel = oldConnection.model(name, model.schema);
        const NewModel = newConnection.model(name, model.schema);
        
        // Count documents in old database
        const count = await OldModel.countDocuments();
        console.log(`   Found ${count} documents in old database`);
        
        if (count === 0) {
            console.log(`   ⏭️  Skipping ${name} (no documents)`);
            return { name, migrated: 0, skipped: 0, errors: 0 };
        }
        
        // Clear existing data in new database (optional - comment out if you want to keep existing data)
        const existingCount = await NewModel.countDocuments();
        if (existingCount > 0) {
            console.log(`   ⚠️  Found ${existingCount} existing documents in new database`);
            console.log(`   🗑️  Clearing existing data...`);
            await NewModel.deleteMany({});
        }
        
        // Fetch all documents from old database
        const documents = await OldModel.find({}).lean();
        console.log(`   📥 Fetched ${documents.length} documents`);
        
        // Insert into new database in batches
        let migrated = 0;
        let errors = 0;
        const batchSize = 100;
        
        for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            try {
                await NewModel.insertMany(batch, { ordered: false });
                migrated += batch.length;
                process.stdout.write(`   Progress: ${migrated}/${documents.length}\r`);
            } catch (error) {
                // If batch insert fails, try individual inserts
                for (const doc of batch) {
                    try {
                        await NewModel.create(doc);
                        migrated++;
                    } catch (err) {
                        errors++;
                        console.error(`   ❌ Error migrating document ${doc._id}:`, err.message);
                    }
                }
            }
        }
        
        console.log(`\n   ✅ Migrated ${migrated} documents`);
        if (errors > 0) {
            console.log(`   ⚠️  ${errors} errors occurred`);
        }
        
        return { name, migrated, skipped: count - migrated - errors, errors };
    } catch (error) {
        console.error(`   ❌ Error migrating ${name}:`, error.message);
        return { name, migrated: 0, skipped: 0, errors: 1 };
    }
}

async function verifyMigration() {
    console.log('\n🔍 Verifying migration...');
    
    const results = [];
    for (const collectionInfo of COLLECTIONS) {
        const { name, model } = collectionInfo;
        try {
            const OldModel = oldConnection.model(name, model.schema);
            const NewModel = newConnection.model(name, model.schema);
            
            const oldCount = await OldModel.countDocuments();
            const newCount = await NewModel.countDocuments();
            
            const status = oldCount === newCount ? '✅' : '⚠️';
            console.log(`   ${status} ${name}: ${oldCount} → ${newCount}`);
            
            results.push({ name, oldCount, newCount, match: oldCount === newCount });
        } catch (error) {
            console.error(`   ❌ Error verifying ${name}:`, error.message);
            results.push({ name, oldCount: 0, newCount: 0, match: false });
        }
    }
    
    return results;
}

async function main() {
    console.log('🚀 Starting Database Migration');
    console.log('================================\n');
    console.log('OLD Database:', OLD_MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('NEW Database:', NEW_MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('');
    
    try {
        // Connect to both databases
        await connectDatabases();
        
        // Migrate all collections
        const results = [];
        for (const collectionInfo of COLLECTIONS) {
            const result = await migrateCollection(collectionInfo);
            results.push(result);
        }
        
        // Verify migration
        const verification = await verifyMigration();
        
        // Summary
        console.log('\n📊 Migration Summary');
        console.log('==================');
        let totalMigrated = 0;
        let totalErrors = 0;
        
        results.forEach(result => {
            console.log(`${result.name}: ${result.migrated} migrated, ${result.errors} errors`);
            totalMigrated += result.migrated;
            totalErrors += result.errors;
        });
        
        console.log(`\nTotal: ${totalMigrated} documents migrated, ${totalErrors} errors`);
        
        // Close connections
        await oldConnection.close();
        await newConnection.close();
        
        console.log('\n✅ Migration completed!');
        console.log('⚠️  Remember to update your .env file with the new MONGODB_URI');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    main().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { migrateCollection, verifyMigration };


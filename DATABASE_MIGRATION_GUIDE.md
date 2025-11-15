# Database Migration Guide

This guide will help you migrate all your data from your old database to the new MongoDB Atlas database.

## Step 1: Update Environment File

1. Navigate to the `backend` directory
2. Create a `.env` file (if it doesn't exist) or update the existing one
3. Add the following content:

```env
# MongoDB Connection String (NEW DATABASE)
MONGODB_URI=mongodb+srv://dwatsononlineco_db_user:ZuqoJj5gOfUZumDX@cluster0.zjrtlrp.mongodb.net/mydatabase?retryWrites=true&w=majority

# JWT Secret (update if needed)
JWT_SECRET=your_jwt_secret_key_here

# Server Port (optional, defaults to 5000)
PORT=5000

# OLD DATABASE (for migration - update with your current database connection)
OLD_MONGODB_URI=mongodb://localhost:27017/dwatson_pk
```

**Important:** 
- Replace `OLD_MONGODB_URI` with your current database connection string
- If your old database is also MongoDB Atlas, use the full connection string
- If it's local, use: `mongodb://localhost:27017/your_database_name`

## Step 2: Run the Migration Script

1. Open a terminal in the project root
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Run the migration script:
   ```bash
   node scripts/migrate-database.js
   ```

The script will:
- ✅ Connect to both old and new databases
- ✅ Migrate all collections (users, products, categories, departments, carts, orders, banners, sliders, media, brands, videobanners, homepagesections)
- ✅ Verify the migration by comparing document counts
- ✅ Show a summary of migrated data

## Step 3: Verify Migration

After migration, the script will automatically verify:
- Document counts in old vs new database
- Any errors that occurred during migration

Check the console output for verification results.

## Step 4: Test the Application

1. Start your server:
   ```bash
   npm start
   # or
   node server.js
   ```

2. Test the following:
   - ✅ Login with existing admin credentials
   - ✅ View products, categories, departments
   - ✅ Check orders, carts
   - ✅ Verify banners, sliders, brands
   - ✅ Test homepage sections

## Step 5: Update Production Environment

If you're deploying to Heroku or another platform:

1. **Heroku:**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://dwatsononlineco_db_user:ZuqoJj5gOfUZumDX@cluster0.zjrtlrp.mongodb.net/mydatabase?retryWrites=true&w=majority"
   ```

2. **Other platforms:** Update the `MONGODB_URI` environment variable in your platform's settings

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Check your MongoDB Atlas IP whitelist - add `0.0.0.0/0` to allow all IPs (or your specific IP)
2. Verify the connection string is correct
3. Check your MongoDB Atlas user credentials

### Migration Errors

If some documents fail to migrate:
- Check the console output for specific error messages
- The script will continue migrating other documents even if some fail
- You can re-run the script - it will clear existing data first (or modify the script to skip duplicates)

### Missing Collections

If a collection doesn't exist in the old database:
- The script will skip it automatically
- This is normal if you haven't used certain features yet

## Collections Being Migrated

The following collections will be migrated:
- ✅ Users (admin and customer accounts)
- ✅ Products (all product data)
- ✅ Categories (product categories)
- ✅ Departments (product departments)
- ✅ Carts (shopping carts)
- ✅ Orders (all orders)
- ✅ Banners (homepage banners)
- ✅ Sliders (hero sliders)
- ✅ Media (uploaded images/videos)
- ✅ Brands (brand logos)
- ✅ VideoBanners (video banner content)
- ✅ HomepageSections (homepage section configurations)

## Important Notes

⚠️ **Backup First:** Always backup your old database before migration

⚠️ **Test Environment:** Consider testing the migration on a test database first

⚠️ **Media Files:** The migration script migrates database references to media files. If your media files are stored locally, you may need to:
- Upload them to a cloud storage (AWS S3, Cloudinary, etc.)
- Or keep the local files and ensure the server can access them

## Need Help?

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your connection strings are correct
3. Ensure both databases are accessible
4. Check MongoDB Atlas network access settings


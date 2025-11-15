#!/bin/bash
# Bash script to create .env file
# Run this script from the backend directory

cat > .env << 'EOF'
# MongoDB Connection String (NEW DATABASE)
MONGODB_URI=mongodb+srv://dwatsononlineco_db_user:ZuqoJj5gOfUZumDX@cluster0.zjrtlrp.mongodb.net/mydatabase?retryWrites=true&w=majority

# JWT Secret (update if needed)
JWT_SECRET=your_jwt_secret_key_here

# Server Port (optional, defaults to 5000)
PORT=5000

# OLD DATABASE (for migration - update with your current database connection)
# OLD_MONGODB_URI=mongodb://localhost:27017/dwatson_pk
EOF

echo "✅ .env file created successfully!"
echo "⚠️  Please update OLD_MONGODB_URI with your current database connection string before running migration"


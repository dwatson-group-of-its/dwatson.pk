# Setup Instructions

## Quick Setup

### Step 1: Install Dependencies

Run this command **once** to install all dependencies:

```bash
npm run setup
```

Or manually:
```bash
cd backend
npm install
cd ..
```

### Step 2: Create Environment File

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/dwatson_pk
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
PORT=5000
ADMIN_EMAIL=admin@dwatson.pk
ADMIN_PASSWORD=your_secure_admin_password
CONTACT_EMAIL=dwatsononline.co@gmail.com
```

### Step 3: Run the Project

```bash
npm start
```

## Troubleshooting

### If packages are not downloading:

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be 14.0.0 or higher

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Delete node_modules and reinstall:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Install manually:**
   ```bash
   cd backend
   npm install
   ```

### If you see continuous printing:

- Press `Ctrl+C` to stop the process
- Check if MongoDB is running (if using local MongoDB)
- Verify your `.env` file has correct values
- Check the error messages in the console

## Alternative: Run Backend Directly

If `run.js` is causing issues, you can run the backend directly:

```bash
cd backend
npm start
```

Then open `http://localhost:5000` in your browser.


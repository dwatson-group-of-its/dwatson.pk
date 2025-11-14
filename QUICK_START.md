# Quick Start Guide

## 🚀 Fastest Way to Run the Project

### Option 1: Using Root Scripts (Recommended)

From the **root directory** of the project:

```bash
# Install all dependencies (backend)
npm install

# Run the project
npm start
```

That's it! The script will:
- ✅ Check Node.js version
- ✅ Install backend dependencies automatically
- ✅ Check for .env file
- ✅ Start the server

### Option 2: Manual Installation

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Go back to root
cd ..

# Start the server
npm start
```

## 📋 Prerequisites

- **Node.js** 14.0.0 or higher
- **npm** 6.0.0 or higher
- **MongoDB** (local or MongoDB Atlas)

## ⚙️ Environment Setup

1. Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/dwatson_pk
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
PORT=5000
ADMIN_EMAIL=admin@dwatson.pk
ADMIN_PASSWORD=your_secure_admin_password
CONTACT_EMAIL=dwatsononline.co@gmail.com

# Optional: Email configuration (choose one)
# Option 1: SendGrid (Recommended)
SENDGRID_API_KEY=your_sendgrid_api_key

# Option 2: Generic SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

2. Update the values with your actual configuration.

## 🎯 Available Scripts

From the **root directory**:

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies (backend) |
| `npm start` | Run the project (auto-installs deps if needed) |
| `npm run backend` | Run only the backend server |
| `npm run install:all` | Explicitly install all dependencies |

## 🌐 Access the Application

Once the server starts, access:

- **Storefront:** http://localhost:5000/
- **Admin Login:** http://localhost:5000/login
- **Admin Dashboard:** http://localhost:5000/admin

## 🛑 Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.

## 📁 Project Structure

```
ECommerace/
├── package.json          # Root package.json (NEW)
├── run.js                # Project runner script (NEW)
├── backend/              # Backend API server
│   ├── package.json
│   ├── server.js
│   └── ...
└── frontend/             # Frontend static files
    ├── index.html
    └── ...
```

## ❓ Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the `PORT` in your `.env` file.

### MongoDB Connection Error
- Make sure MongoDB is running locally, OR
- Update `MONGODB_URI` in `.env` with your MongoDB Atlas connection string

### Dependencies Not Installing
- Make sure you have Node.js 14+ installed
- Try deleting `node_modules` and `package-lock.json` in the backend folder, then run `npm install` again

### Environment Variables Not Working
- Make sure `.env` file is in the `backend` directory
- Restart the server after changing `.env` file

## 📚 More Information

- See `readme.md` for detailed project information
- See `DEPLOYMENT.md` for Heroku deployment instructions
- See `PRODUCTION_READINESS_ASSESSMENT.md` for production deployment checklist


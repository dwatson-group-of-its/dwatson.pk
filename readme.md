# D.Watson Pharmacy - E-Commerce Platform

Full-stack e-commerce platform for D.Watson Pharmacy with admin dashboard, product management, shopping cart, and order processing.

## Project Structure

```
ECommerace/
├── package.json          # Root package.json (project runner)
├── run.js                # Project runner script
├── frontend/             # Frontend static files (HTML, CSS, JS)
│   ├── css/
│   ├── js/
│   ├── images/
│   └── *.html
├── backend/             # Backend API server
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── scripts/         # Database initialization scripts
│   ├── uploads/         # Uploaded media files
│   ├── Procfile         # Heroku deployment config
│   ├── package.json
│   └── server.js
└── README.md
```

## Quick Start (Local Development)

### 🚀 Fastest Method (Recommended)

From the **root directory**:

```bash
# Install all dependencies
npm install

# Run the project
npm start
```

The script will automatically:
- ✅ Check Node.js version
- ✅ Install backend dependencies
- ✅ Check for .env file
- ✅ Start the server

### 📋 Alternative Method (Manual)

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**  
   Create `backend/.env` file with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dwatson_pk
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ADMIN_EMAIL=admin@dwatson.pk
   ADMIN_PASSWORD=admin123
   CONTACT_EMAIL=dwatsononline.co@gmail.com
   ```

3. **Run the server**
   ```bash
   npm start
   ```

4. **Access the app**  
   - Storefront: `http://localhost:5000/`  
   - Admin login: `http://localhost:5000/login`  
   - Admin dashboard: `http://localhost:5000/admin`

> 💡 **Tip:** See `QUICK_START.md` for detailed setup instructions and troubleshooting.

## Heroku Deployment

See `backend/README.md` for detailed Heroku deployment instructions.

### Quick Deploy
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
# ... set other env vars
git push heroku main
```

## Features

- ✅ Product catalog with departments, categories, and products
- ✅ Shopping cart with persistent storage
- ✅ Order management with status tracking
- ✅ Admin dashboard for content management
- ✅ Sales reports with filters
- ✅ Banner and slider management
- ✅ Section-based homepage layout
- ✅ Responsive design

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, JavaScript (jQuery), Bootstrap
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer (SendGrid/SMTP)

## License

ISC
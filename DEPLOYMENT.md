# Heroku Deployment Guide

## Prerequisites

1. Heroku CLI installed: https://devcenter.heroku.com/articles/heroku-cli
2. Git installed
3. MongoDB Atlas account (or other MongoDB hosting)
4. Node.js 14+ installed locally

## Step-by-Step Deployment

### 1. Prepare Your Code

Make sure all files are committed:
```bash
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### 2. Create Heroku App

```bash
cd backend
heroku create your-app-name
# Example: heroku create dwatson-pharmacy
```

### 3. Set Environment Variables

```bash
# Required variables
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/dwatson_pk"
heroku config:set JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
heroku config:set ADMIN_EMAIL="admin@dwatson.pk"
heroku config:set ADMIN_PASSWORD="your-secure-admin-password"
heroku config:set CONTACT_EMAIL="dwatsononline.co@gmail.com"

# Optional: Email configuration (choose one method)

# Method 1: SendGrid (Recommended - No password needed)
heroku config:set SENDGRID_API_KEY="SG.your-sendgrid-api-key"

# Method 2: Generic SMTP
heroku config:set SMTP_HOST="smtp.gmail.com"
heroku config:set SMTP_PORT="587"
heroku config:set SMTP_SECURE="false"
heroku config:set SMTP_USER="your-email@gmail.com"
heroku config:set SMTP_PASS="your-app-password"
```

### 4. Deploy to Heroku

```bash
# From the backend directory
git push heroku main

# Or if your default branch is master:
git push heroku master
```

### 5. Open Your App

```bash
heroku open
```

### 6. Initialize Database (Optional)

If you need to seed the database with initial data:

```bash
heroku run node scripts/database-init.js
```

## Post-Deployment

### View Logs
```bash
heroku logs --tail
```

### Run Commands
```bash
heroku run node scripts/add-sample-products.js
```

### Update Environment Variables
```bash
heroku config:set VARIABLE_NAME="new-value"
```

### View All Config Variables
```bash
heroku config
```

## Troubleshooting

### App Crashes on Startup
- Check logs: `heroku logs --tail`
- Verify all required environment variables are set
- Ensure MongoDB connection string is correct

### Static Files Not Loading
- Verify frontend folder structure is correct
- Check that `server.js` serves static files correctly

### Database Connection Issues
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Heroku)

### Email Not Working
- Verify email configuration variables
- Check SendGrid API key or SMTP credentials
- Review logs for email errors

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (min 32 chars) |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `CONTACT_EMAIL` | Yes | Email to receive contact form messages |
| `SENDGRID_API_KEY` | No* | SendGrid API key (recommended) |
| `SMTP_HOST` | No* | SMTP server hostname |
| `SMTP_PORT` | No* | SMTP server port |
| `SMTP_USER` | No* | SMTP username |
| `SMTP_PASS` | No* | SMTP password |

*At least one email method (SendGrid or SMTP) is required for contact form to work.

## Heroku Add-ons (Optional)

### MongoDB Atlas
- Free tier available
- Add via: https://www.mongodb.com/cloud/atlas

### SendGrid
- Free tier: 100 emails/day
- Add via: https://elements.heroku.com/addons/sendgrid

## Notes

- Heroku automatically sets `PORT` environment variable
- The app uses `process.env.PORT || 5000` for port binding
- Static files are served from `../frontend` directory
- Uploads are stored in `backend/uploads/` (consider using cloud storage for production)


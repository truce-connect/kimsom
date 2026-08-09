# Deployment Guide - Kinmson Int'l Success Venture

This guide covers both local development and production deployment using Vercel for both frontend and backend.

## Project Structure

```
kinsomapp/
├── kimsonbackend/          # Node.js/Express API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── vercel.json
│   └── package.json
├── kimsonfrontend/         # Static HTML/CSS/JS frontend
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── index.html
│   ├── admin.html
│   ├── vercel.json
│   └── package.json
├── vercel.json            # Root config for frontend deployment
└── package.json
```

## Local Development

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Git

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd kimsonbackend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your local configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kinsom
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
MAX_FILE_SIZE=5242880
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

4. **Seed the database (optional):**
```bash
npm run seed
```

5. **Start the backend server:**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd kimsonfrontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the frontend server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

The frontend is configured to automatically connect to the backend at `http://localhost:5000/api` when running locally.

## Production Deployment (Vercel)

### Step 1: Deploy Backend to Vercel

1. **Push your code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/kinsomapp.git
git push -u origin main
```

2. **Set up MongoDB Atlas (for production database):**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account
   - Create a new cluster
   - Create a database user
   - Whitelist IP addresses (use 0.0.0.0/0 for Vercel)
   - Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/kinsom`

3. **Deploy backend on Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Important:** Set "Root Directory" to `kimsonbackend`
   - Configure environment variables:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kinsom
     JWT_SECRET=your_secure_jwt_secret_for_production
     JWT_EXPIRE=7d
     FRONTEND_URL=https://your-frontend.vercel.app
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=your_secure_admin_password
     MAX_FILE_SIZE=5242880
     PAYSTACK_SECRET_KEY=your_production_paystack_secret
     PAYSTACK_PUBLIC_KEY=your_production_paystack_public
     NODE_ENV=production
     ```
   - Click "Deploy"

4. **Note your backend URL:**
   After deployment, Vercel will provide a URL like:
   ```
   https://kimsonbackend.vercel.app
   ```
   Copy this URL - you'll need it for the frontend configuration.

### Step 2: Deploy Frontend to Vercel

1. **Update root `vercel.json` with your backend URL:**
   Edit the root `vercel.json` file and replace the backend URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://kimsonbackend.vercel.app/api/$1"
       }
     ],
     "headers": [
       {
         "source": "/(.*).(js|css)",
         "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
       }
     ]
   }
   ```
   Replace `https://kimsonbackend.vercel.app` with your actual backend URL from Step 1.

2. **Deploy frontend on Vercel:**
   - Go to Vercel dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - **Important:** Set "Root Directory" to `kimsonfrontend`
   - Click "Deploy"

3. **Note your frontend URL:**
   After deployment, Vercel will provide a URL like:
   ```
   https://kimsonfrontend.vercel.app
   ```

### Step 3: Update Backend CORS Configuration

1. **Update backend environment variables:**
   - Go to your Vercel project dashboard for the backend
   - Go to Settings → Environment Variables
   - Update `FRONTEND_URL` to your actual frontend URL:
     ```
     FRONTEND_URL=https://kimsonfrontend.vercel.app
     ```
   - Redeploy the backend

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Local | Production |
|----------|-------------|-------|------------|
| `PORT` | Server port | 5000 | (auto-set by Vercel) |
| `NODE_ENV` | Environment | development | production |
| `MONGODB_URI` | MongoDB connection string | Local MongoDB | MongoDB Atlas |
| `JWT_SECRET` | JWT signing secret | Any string | Strong random string |
| `JWT_EXPIRE` | Token expiration time | 7d | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | Your Vercel frontend URL |
| `ADMIN_USERNAME` | Admin username | admin | admin |
| `ADMIN_PASSWORD` | Admin password | admin123 | Strong password |
| `MAX_FILE_SIZE` | Max upload size in bytes | 5242880 | 5242880 |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Test key | Production key |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Test key | Production key |

## API Communication

### Local Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API calls: `http://localhost:5000/api/*`

### Production
- Frontend: `https://kimsonfrontend.vercel.app`
- Backend: `https://kimsonbackend.vercel.app`
- API calls: Proxied through frontend at `/api/*` → backend

The frontend automatically detects the environment and routes API calls accordingly:
- **Local:** Direct calls to `http://localhost:5000/api`
- **Production:** Proxied through `/api` to backend via Vercel rewrites

## File Upload Notes

For Vercel serverless deployment, file uploads use memory storage and are converted to base64 data URLs. This is suitable for small images but has limitations:

- **Max file size:** 5MB (configurable via `MAX_FILE_SIZE`)
- **Storage:** Images stored as base64 in MongoDB
- **Recommendation:** For production with many images, consider using cloud storage (Cloudinary, AWS S3, Vercel Blob)

## Testing the Deployment

### Local Testing
1. Start backend: `cd kimsonbackend && npm run dev`
2. Start frontend: `cd kimsonfrontend && npm run dev`
3. Open `http://localhost:3000` in browser
4. Test product loading, cart functionality, admin panel

### Production Testing
1. Visit your frontend Vercel URL
2. Test all functionality:
   - Product browsing
   - Add to cart
   - Checkout flow
   - Admin login and product management
   - Order management

## Troubleshooting

### Backend Issues
- **Database connection:** Check `MONGODB_URI` is correct and MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- **CORS errors:** Ensure `FRONTEND_URL` matches your actual frontend URL
- **Environment variables:** Verify all required variables are set in Vercel dashboard

### Frontend Issues
- **API not working:** Check root `vercel.json` has correct backend URL
- **Images not loading:** Ensure images are stored as valid base64 data URLs in database
- **Admin not working:** Verify JWT token is being stored and sent correctly

### Common Issues
- **Build failures:** Check Node.js version is 18+ in Vercel project settings
- **Timeout errors:** Vercel serverless functions have 10s timeout for free tier
- **Memory issues:** Large base64 images may exceed memory limits

## Security Recommendations

1. **Use strong secrets:** Generate random strings for `JWT_SECRET` in production
2. **Environment variables:** Never commit `.env` files to Git
3. **MongoDB security:** Use strong passwords and enable IP whitelisting
4. **HTTPS:** Vercel automatically provides HTTPS
5. **Rate limiting:** Backend has rate limiting enabled (100 requests per 15 minutes)
6. **Admin credentials:** Change default admin password in production

## Maintenance

### Updating the Application
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Vercel will auto-deploy on push to main branch

### Database Backups
- MongoDB Atlas provides automated backups
- Consider setting up regular export of critical data

### Monitoring
- Vercel provides analytics and logs
- Monitor API errors and performance
- Check MongoDB Atlas metrics for database performance

## Support

For issues or questions:
- Check Vercel deployment logs
- Review MongoDB Atlas metrics
- Verify environment variables are correctly set
- Ensure CORS configuration is correct

# Kinsom Backend API

Backend API for Kinmson Int'l Success Venture e-commerce platform.

## Features

- Product management (CRUD operations)
- Order management
- User authentication (JWT)
- Admin dashboard
- File upload for product images
- Payment integration ready
- MongoDB database

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository
```bash
cd kimsonbackend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`
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
UPLOAD_PATH=./uploads
```

5. Start MongoDB server
```bash
# If using local MongoDB
mongod
```

6. Seed the database
```bash
npm run seed
```

7. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/updatedetails` - Update user details (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get single order (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (admin only)
- `GET /api/admin/recent-orders` - Get recent orders (admin only)

## Default Admin Credentials

- Email: `admin@kinsom.com`
- Password: `admin123`

## Database Schema

### Product
- name (String, required)
- category (String, required)
- price (Number, required)
- oldPrice (Number, optional)
- stock (Number, required)
- badge (String, optional)
- description (String, optional)
- image (String, optional)
- rating (Number, default: 5.0)
- reviews (Number, default: 0)
- isActive (Boolean, default: true)

### Order
- orderNumber (String, unique, auto-generated)
- customerName (String, required)
- customerEmail (String, required)
- customerPhone (String, required)
- customerAddress (String, required)
- items (Array of objects)
- subtotal (Number, required)
- deliveryFee (Number, default: 2000)
- total (Number, required)
- paymentMethod (String, required)
- paymentStatus (String, default: 'pending')
- status (String, default: 'pending')
- notes (String, optional)

### User
- name (String, required)
- email (String, required, unique)
- phone (String, required)
- password (String, required)
- address (String, optional)
- role (String, default: 'user')
- isActive (Boolean, default: true)

## Security Features

- Helmet.js for security headers
- Rate limiting
- JWT authentication
- Password hashing with bcrypt
- CORS enabled
- Input validation

## File Upload

Product images are uploaded to the `uploads` directory and served statically at `/uploads`.

Max file size: 5MB (configurable via .env)
Allowed formats: JPEG, JPG, PNG, GIF, WEBP

## Payment Integration

The backend is ready for payment integration. Currently supports:
- Bank transfer
- Cash on delivery
- Card payment (placeholder for integration with payment gateway)

To integrate with a payment gateway (e.g., Paystack, Flutterwave):
1. Add payment gateway SDK to package.json
2. Create payment controller
3. Add payment routes
4. Update order creation flow

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=your_frontend_url
```

### Recommended Deployment Platforms
- Backend: Heroku, DigitalOcean, AWS, Railway
- Database: MongoDB Atlas
- File Storage: AWS S3, Cloudinary (for production)

## License

ISC

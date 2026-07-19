require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kinsom', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Seed data
const seedProducts = [
    {
        name: 'LED Smart Bulb 12W',
        category: 'bulbs',
        price: 2500,
        oldPrice: 3000,
        stock: 50,
        badge: 'Best Seller',
        description: 'Energy-efficient LED smart bulb with WiFi connectivity and app control',
        image: 'https://images.unsplash.com/photo-1560692857-cca5501d8995?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 4.5,
        reviews: 120
    },
    {
        name: 'Premium 2-Gang Switch',
        category: 'switches',
        price: 1800,
        oldPrice: 2200,
        stock: 35,
        badge: 'New',
        description: 'High-quality 2-gang modular switch with smooth operation',
        image: 'https://images.unsplash.com/photo-1613315622081-3b066dbe5d83?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 5.0,
        reviews: 85
    },
    {
        name: '2.5mm Electrical Cable',
        category: 'cables',
        price: 350,
        stock: 100,
        badge: '',
        description: 'High-quality electrical cable sold per meter',
        image: 'https://images.unsplash.com/photo-1758101755915-462eddc23f57?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 5.0,
        reviews: 200
    },
    {
        name: 'Extension Socket 4-Way',
        category: 'accessories',
        price: 4500,
        oldPrice: 5500,
        stock: 25,
        badge: 'Popular',
        description: '4-way extension socket with surge protection',
        image: 'https://images.unsplash.com/photo-1762330464388-de535963b42e?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 95
    },
    {
        name: 'Rechargeable LED Bulb',
        category: 'bulbs',
        price: 3500,
        oldPrice: 4200,
        stock: 40,
        badge: '',
        description: 'Rechargeable LED bulb with 4 hours backup',
        image: 'https://images.unsplash.com/photo-1563647214-2bedb91e306a?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 5.0,
        reviews: 150
    },
    {
        name: '3-Gang Modular Switch',
        category: 'switches',
        price: 2200,
        oldPrice: 2800,
        stock: 30,
        badge: '',
        description: 'Premium 3-gang modular switch with modern design',
        image: 'https://images.unsplash.com/photo-1566417110090-6b15a06ec800?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviews: 65
    },
    {
        name: '4mm Electrical Cable (Per Roll)',
        category: 'cables',
        price: 45000,
        stock: 20,
        badge: 'Bulk',
        description: 'High-quality 4mm electrical cable sold per roll (100 meters)',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 5.0,
        reviews: 45
    },
    {
        name: 'Circuit Breaker 32A',
        category: 'circuit-breakers',
        price: 5500,
        oldPrice: 6500,
        stock: 15,
        badge: '',
        description: '32A circuit breaker for residential and commercial use',
        image: 'https://images.unsplash.com/photo-1571233594617-434b02ec3dbb?fm=jpg&q=80&w=600&auto=format&fit=crop',
        rating: 5.0,
        reviews: 80
    }
];

const seedAdmin = {
    name: 'Admin User',
    email: 'admin@kinsom.com',
    phone: '08033179784',
    password: 'admin123',
    role: 'admin'
};

// Seed database
const seedDB = async () => {
    try {
        // Clear existing data
        await Product.deleteMany();
        await User.deleteMany();

        // Insert seed data
        await Product.insertMany(seedProducts);
        await User.create(seedAdmin);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['bulbs', 'switches', 'sockets', 'cables', 'circuit-breakers', 'extension-boxes', 'industrial', 'accessories']
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
        default: null
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    badge: {
        type: String,
        enum: ['', 'Best Seller', 'New', 'Popular', 'Bulk'],
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

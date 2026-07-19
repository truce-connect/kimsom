const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    customerAddress: {
        type: String,
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 2000
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bank_transfer', 'card', 'cash_on_delivery']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentReference: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = 'ORD' + String(count + 1).padStart(6, '0');
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);

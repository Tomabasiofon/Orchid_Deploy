const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true, // Ensure each code is unique
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    expiringPromoDate: {
        type: Date,
    },
}, {
    timestamps: true
});

const Promos = mongoose.model('PromoCode', promoCodeSchema);

module.exports = Promos;

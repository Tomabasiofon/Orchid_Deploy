const mongoose = require('mongoose');

const officeSpaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['space', 'room'],
        default: 'space', 
    },
    seat_number: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
    }
},
{
    timestamps: true
})

officeSpaceSchema.index({ type: 1, seat_number: 1 }, { unique: true });

const OfficeSpace = mongoose.model('OfficeSpace', officeSpaceSchema);
module.exports = OfficeSpace;

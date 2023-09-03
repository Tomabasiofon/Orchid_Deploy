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
        enum: ['single_space', 'four_spaces', 'conference_room'],
        default: 'single_space', 
    },
    price: {
        type: Number,
        required: true,
    }
},
{
    timestamps: true
})

const OfficeSpace = mongoose.model('OfficeSpace', officeSpaceSchema);
module.exports = OfficeSpace;
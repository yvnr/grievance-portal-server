const mongoose = require('mongoose');
const Enumeration = require('./enumeration');

const zoneSchema = new mongoose.Schema({
    stateName: {
        type: String,
        enum: Enumeration.State,
        required: true
    },
    zoneName: {
        type: String,
        enum: Enumeration.Zone,
        required: true
    }
}, {
    timestamps: true
});

const Zone = mongoose.model('Zone', zoneSchema);
module.exports = Zone;
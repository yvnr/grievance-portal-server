const mongoose = require('mongoose');
const EnumValues = require('mongoose-enumvalues');

const Enumeration = require('./enumeration');

const districtSchema = new mongoose.Schema({
    districtName: {
        type: String,
        enum: Enumeration.District,
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

const District = mongoose.model('District', districtSchema);
module.exports = District;
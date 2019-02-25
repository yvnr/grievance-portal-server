const mongoose = require('mongoose');
const EnumValues = require('mongoose-enumvalues');

const Enumeration = require('./enumeration');

const pincodeSchema = new mongoose.Schema({
    pincode: {
        type: String,
        enum: Enumeration.Pincode,
        required: true
    },
    districtName: {
        type: String,
        enum: Enumeration.District,
        required: true
    }
},{
    timestamps:true
});

const Pincode = mongoose.model('Pincode', pincodeSchema);
module.exports = Pincode;
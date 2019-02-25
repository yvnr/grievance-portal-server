//`use strict`;

const mongoose = require('mongoose');
const Email = require('mongoose-type-email');
const EnumValues = require('mongoose-enumvalues');

const Enumeration = require('./enumeration');

//for promises
mongoose.Promise = global.Promise;

const districtOfficerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    districtName: {
        type: String,
        enum: Enumeration.District,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const DistrictOfficer = mongoose.model('districtOfficer', districtOfficerSchema);
module.exports = DistrictOfficer;
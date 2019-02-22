//`use strict`;

const mongoose = require('mongoose');
const Email = require('mongoose-type-email');
const Enumeration = require('./enumeration');

//for promises
mongoose.Promise = global.Promise;

const zonalOfficerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    zoneName: {
        type: String,
        enum: Enumeration.Zone,
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

const ZonalOfficer = mongoose.model('ZonalOfficer', zonalOfficerSchema);
module.exports = ZonalOfficer;
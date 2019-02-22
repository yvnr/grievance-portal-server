const mongoose = require('mongoose');

const Enumeration = require('./enumeration');

const grievanceStatusSchema = new mongoose.Schema({
    grievanceId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Enumeration.status,
        required: true
    },
    scrutinizedTime: {
        type: String
    },
    rejectedTime: {
        type: String
    },
    resolvedTime: {
        type: String
    },
    inprogressTime: {
        type: String
    },
    submittedTime: {
        type: String,
        required: true
    },
    cancelledTime: {
        type: String
    },
}, {
    timestamps: true
});

const GrievanceStatus = new mongoose.model('GrievanceStatus', grievanceStatusSchema);
module.exports = GrievanceStatus;

module.exports.setStatus = async (newStatus) => {
    try {
        const status = await newStatus.save();
        console.log(`The status has been successfully created`);
        return status;
    } catch (err) {
        console.log(`Following error occurred while creating new user : ${err}`);
        throw err;
    }
};
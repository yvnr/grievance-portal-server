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

async function getGrievancesForZonalOfficersFunction(username) {
    const District = require('./district');
    const Grievance = require('./grievance');
    const GrievanceStatus = require('./grievanceStatus');
    const Escalation = require('./escalation');

    const zonnalOfficerObject = await ZonalOfficer.findOne({
        username: username
    }).select('zoneName').exec();

    const districtsObject = await District.find({
        zoneName: zonnalOfficerObject.zoneName
    }).exec();

    const grievancesFinalObjectPromise = districtsObject.map(async districtObject => {
        const grievancesObject = await Grievance.find({
            district: districtObject.districtName
        }).exec();

        const grievancesObjectPromise = grievancesObject.map(async grievanceObject => {
            const grievanceStatusObject = await GrievanceStatus.findOne({
                grievanceId: grievanceObject.grievanceId
            }).select('status').exec();

            const escalationObject = await Escalation.findOne({
                grievanceId: grievanceObject.grievanceId
            }).select('officerHierarchyStack').exec();

            const officerId = escalationObject.officerHierarchyStack[0];
            console.log(`${officerId}`);

            const districtOfficerDetailsObject = await DistrictOfficer.findOne({
                username: officerId
            }).select('fullName email phoneNumber').exec();

            const finalObject = {
                ...districtOfficerDetailsObject,
                ...grievanceStatusObject,
                ...grievanceObject,
            };
            return finalObject;
        });

        const grievancesObject = await Promise.all(grievancesObjectPromise);
        return grievancesObject;
    });

    const grievancesFinalObject = await Promise.all(grievancesFinalObjectPromise);
    return grievancesFinalObject;
}

module.exports.getGrievancesForZonalOfficers = getGrievancesForZonalOfficersFunction;
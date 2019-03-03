//`use strict`;

const mongoose = require('mongoose');
const Email = require('mongoose-type-email');
const EnumValues = require('mongoose-enumvalues');

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
    const DistrictOfficer = require('./districtOfficer');

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

        const grievancesObjectPromise = await grievancesObject.map(async grievanceObject => {
            const grievanceStatusObject = await GrievanceStatus.findOne({
                grievanceId: grievanceObject.id
            }).select('status').exec();

            if (grievanceStatusObject.status !== `cancelled`) {
                const escalationObject = await Escalation.findOne({
                    grievanceId: grievanceObject.id
                }).select('officerHierarchyStack').exec();

                console.log(escalationObject.officerHierarchyStack);

                let index = 0;
                if (escalationObject.officerHierarchyStack.length === 2) {
                    index = 1;
                }

                const officerId = escalationObject.officerHierarchyStack[index];
                console.log(`${officerId}`);

                const districtOfficerDetailsObject = await DistrictOfficer.findOne({
                    username: officerId
                }).select('fullName email phoneNumber').exec();

                const finalObject = {
                    id: grievanceObject.id,
                    username: grievanceObject.username,
                    fullName: grievanceObject.fullName,
                    country: grievanceObject.country,
                    address: grievanceObject.address,
                    gender: grievanceObject.gender,
                    state: grievanceObject.state,
                    district: grievanceObject.district,
                    pincode: grievanceObject.pincode,
                    email: grievanceObject.email,
                    description: grievanceObject.description,
                    department: grievanceObject.department,
                    attachments: grievanceObject.attachments,
                    status: grievanceStatusObject.status,
                    officerFullName: districtOfficerDetailsObject.fullName,
                    officerEmail: districtOfficerDetailsObject.email,
                    officerPhoneNumber: districtOfficerDetailsObject.phoneNumber
                };
                return finalObject;
            }

        });

        const grievancesObjectForTotalZone = await Promise.all(grievancesObjectPromise);
        return grievancesObjectForTotalZone;
    });

    const grievancesFinalObject = await Promise.all(grievancesFinalObjectPromise);
    return grievancesFinalObject;
}

module.exports.getGrievancesForZonalOfficers = getGrievancesForZonalOfficersFunction;
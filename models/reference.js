const mongoose = require('mongoose');
const Email = require('mongoose-type-email');
const Enumeration = require('./enumeration');

//for sending emails
const mail = require('./../mail');

const referenceSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: Enumeration.Gender,
        required: true
    },
    state: {
        type: String,
        enum: Enumeration.State,
        required: true
    },
    district: {
        type: String,
        enum: Enumeration.District,
        required: true
    },
    pincode: {
        type: String,
        enum: Enumeration.Pincode,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    attachments: [{
        type: String,
        required: true
    }],
    tokenPassword: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Reference = new mongoose.model('Reference', referenceSchema);
module.exports = Reference;

async function createReferenceFunction(reference) {
    try {
        const referenceObject = reference.save();

        //sending email to public
        const publicEmail = reference.email;
        const subForPublic = `Confimation of grievance lodged by you.`;
        const msgForPublic = `Your grievance has been recorded successfully.\nYou can now track your grievance status using\n TokenId: ${reference.token}\nTokenPassword: ${reference.tokenPassword}\nPlease do not share this details with anyone.\n\n\nIf this message is irrelevant, please ignore.`;

        await mail(publicEmail, subForPublic, msgForPublic);
        console.log(`mail sent to public`);


        return referenceObject
    } catch (err) {
        throw err;
    }
}

module.exports.createReference = createReferenceFunction;

async function getReferencesFunction() {
    try {
        const Escalation = require('./escalation');

        const references = await Reference.find({}).exec();
        const referenceObjectPromises = references.map(async reference => {
            const escalationObject = await Escalation.findOne({
                grievanceId: reference.id
            }).select('officerHierarchyStack').exec();

            const officerId = escalationObject.officerHierarchyStack[0];
            console.log(`${officerId}`);

            if (escalationObject.officerHierarchyStack.length === 1) {
                const DistrictOfficer = require('./districtOfficer');

                const districtOfficerDetailsObject = await DistrictOfficer.findOne({
                    username: officerId
                }).exec();

                const finalObject = {
                    officerName: districtOfficerDetailsObject.fullName,
                    officerPhoneNumber: districtOfficerDetailsObject.phoneNumber,
                    officerEmail: districtOfficerDetailsObject.email,
                    username: reference.username,
                    fullName: reference.fullName,
                    country: reference.country,
                    address: reference.address,
                    gender: reference.gender,
                    state: reference.state,
                    district: reference.state,
                    district: reference.district,
                    pincode: reference.pincode,
                    email: reference.email,
                    phoneNumber: reference.phoneNumber,
                    description: reference.description,
                    department: reference.department,
                    token: reference.token,
                    role: `districtOfficer`
                };
                return finalObject;

            } else {
                const ZonalOfficer = require('./zonalOfficer');

                const zonalOfficerDetailsObject = await ZonalOfficer.findOne({
                    username: officerId
                }).exec();

                const finalObject = {
                    officerName: zonalOfficerDetailsObject.fullName,
                    officerPhoneNumber: zonalOfficerDetailsObject.phoneNumber,
                    officerEmail: zonalOfficerDetailsObject.email,
                    username: reference.username,
                    fullName: reference.fullName,
                    country: reference.country,
                    address: reference.address,
                    gender: reference.gender,
                    state: reference.state,
                    district: reference.state,
                    district: reference.district,
                    pincode: reference.pincode,
                    email: reference.email,
                    phoneNumber: reference.phoneNumber,
                    description: reference.description,
                    department: reference.department,
                    token: reference.token,
                    role: `zonalOfficer`
                };
                return finalObject;
            }
        });

        const referenceObject = await Promise.all(referenceObjectPromises);
        return referenceObject;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports.getReferences = getReferencesFunction;
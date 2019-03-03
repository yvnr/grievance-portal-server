const mongoose = require('mongoose');
const Email = require('mongoose-type-email');
const Enumeration = require('./enumeration');

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
        return referenceObject
    } catch (err) {
        throw err;
    }
}

module.exports.createReference = createReferenceFunction;

async function getReferencesFunction() {
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

            const date = new Date(Number(grievanceStatusObject.submittedTime));
            grievanceStatusObject.submittedTime = `${date.toLocaleDateString("en-US")} ${date.toLocaleTimeString("en-US")}`;

            const finalObject = {
                officerName: districtOfficerDetailsObject.fullName,
                status: grievanceStatusObject.status,
                username: grievanceObject.username,
                fullName: grievanceObject.fullName,
                country: grievanceObject.country,
                address: grievanceObject.address,
                gender: grievanceObject.gender,
                state: grievanceObject.state,
                district: grievanceObject.state,
                district: grievanceObject.district,
                pincode: grievanceObject.pincode,
                email: grievanceObject.email,
                phoneNumber: grievanceObject.phoneNumber,
                description: grievanceObject.description,
                department: grievanceObject.department,
                token: grievanceObject.token,
                role: `districtOfficer`,
                submittedTime: grievanceStatusObject.submittedTime
            };
            return finalObject;

        } else {

        }
    });
}

module.exports.getReferences = getReferencesFunction;
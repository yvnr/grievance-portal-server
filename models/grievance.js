//`use strict`;

const mongoose = require('mongoose');
const Email = require('mongoose-type-email');
const Enumeration = require('./enumeration');

const DistrictOfficer = require('./districtOfficer');
const Escalation = require('./escalation');
const GrievanceStatus = require('./grievanceStatus');

//for sending emails
const mail = require('./../mail');

//for checking statuses
const timer = require('./../timer');

//for promises
mongoose.Promise = global.Promise;

const grievanceSchema = new mongoose.Schema({
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

module.exports = Grievance = mongoose.model('grievance', grievanceSchema);

//for creating new grievance
module.exports.raiseGrievance = async (newGrievance) => {
    try {
        const grievance = await newGrievance.save();
        console.log(`${grievance}`);

        //sending email to public
        const publicEmail = grievance.email;
        const subForPublic = `Confimation of grievance lodgged by you.`;
        const msgForPublic = `Your grievance has been recorded successfully\nyou can track your grievance status with\n     tokenId: ${grievance.token}\n   tokenPassword: ${grievance.tokenPassword}\nif this message was irrelavant to you kindly ignore`;

        await mail(publicEmail, subForPublic, msgForPublic);
        console.log(`mail sent to public`);

        const districtOfficer = await DistrictOfficer.findOne({
            districtName: grievance.district
        }).exec();
        console.log(`allocated officer ${districtOfficer}`);

        const currentTime = Date.now();

        //sending email to district officer
        const officerEmail = districtOfficer.email;
        const subForOfficial = `notification from DIPP.`;
        const msgForOfficial = `A new grievance has been launched in your zone\nkindly take respective actions and update datails in system.`;

        await mail(officerEmail, subForOfficial, msgForOfficial);
        console.log(`mail sent to official`);

        const escalationObject = new Escalation({
            grievanceId: grievance.id,
            officerHierarchyStack: districtOfficer.username,
            escalationStack: currentTime
        });
        const escalation = await Escalation.createEscalation(escalationObject);
        console.log(`${escalation}`);

        const status = GrievanceStatus({
            grievanceId: grievance.id,
            status: `submitted`,
            submittedTime: currentTime
        });
        const grievanceStatus = await GrievanceStatus.setStatus(status);
        console.log(`${grievanceStatus}`);

        //calling function to check work in progress
        const firstTimer = timer(grievance.id, 12000, null);

        //calling function to check submitted/scrutinized
        timer(grievance.id, 6000, firstTimer);

        //sending response
        const trueObject = {
            message: `all collections created succesfully`
        };

        return trueObject;
    } catch (err) {
        console.log(`Following error occurred while creating new grievance : ${err}`);
        throw err;
    }
};

const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema({
    grievanceId: {
        type: String,
        required: true
    },
    officerHierarchyStack: {
        type: [String],
        required: true
    },
    escalationStack: {
        type: [String],
        required: true
    }
}, {
    timestamps: true
});

module.exports = Escalation = mongoose.model('Escalation', escalationSchema);

module.exports.createEscalation = async (newEscalation) => {
    try {
        const escalation = await newEscalation.save();
        console.log(`new escalation has been created`);
        return escalation;
    } catch (err) {
        console.log(`Following error occurred while creating new user : ${err}`);
        throw err;
    }
};

async function updateOfficer(idOfGrievance) {
    try {
        const Grievance = require('./grievance');
        const District = require('./district');
        const DistrictOfficer = require('./districtOfficer');
        const ZonalOfficer = require('./zonalOfficer');
        const mail = require('./../mail');

        console.log(idOfGrievance);
        const grievanceObject = await Grievance.findOne({
            id: idOfGrievance,
        }).select('district').exec();
        console.log(grievanceObject);

        const districtObject = await District.findOne({
            districtName: grievanceObject.district
        }).select('zoneName').exec();
        console.log(districtObject);

        const zonalOfficerObject = await ZonalOfficer.findOne({
            zoneName: districtObject.zoneName
        }).select('username email').exec();
        console.log(zonalOfficerObject);

        //updating escalation object
        const currentTime = Date.now();

        //sending email to district officer
        const officerEmail = zonalOfficerObject.email;
        const subForOfficial = `notification from DIPP.`;
        const msgForOfficial = `A new grievance has been launched in your zone\nkindly take respective actions and update datails in system.`;

        await mail(officerEmail, subForOfficial, msgForOfficial);
        console.log(`mail sent to official`);

        const updatedEscalation = await Escalation.findOneAndUpdate({
            grievanceId: idOfGrievance
        }, {
            $push: {
                officerHierarchyStack: zonalOfficerObject.username,
                escalationStack: currentTime
            }
        });

        //returned updated escalation object
        return updatedEscalation;

    } catch (err) {
        throw err;
    }
};

module.exports.updateOfficer = updateOfficer;
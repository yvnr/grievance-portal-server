const mongoose = require('mongoose');
const EnumValues = require('mongoose-enumvalues');

//for promises
mongoose.Promise = global.Promise;

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
        const currentTime = Date.now() + "";

        //sending email to district officer
        const officerEmail = zonalOfficerObject.email;
        const subForOfficial = `notification from DIPP.`;
        const msgForOfficial = `A new grievance has been launched in your zone\nkindly take respective actions and update datails in system.`;

        await mail(officerEmail, subForOfficial, msgForOfficial);
        console.log(`mail sent to official`);

        //update escalation object
        const updatedEscalation = await Escalation.collection.findAndModify({
            grievanceId: idOfGrievance
        }, [], {
            '$push': {
                'officerHierarchyStack': {
                    '$each': [zonalOfficerObject.username],
                    '$position': 0
                },
                'escalationStack': {
                    '$each': [currentTime],
                    '$position': 0
                }
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err)
                console.log(err);
            else
                console.log(doc);
        });

        //returned updated escalation object
        return updatedEscalation;

    } catch (err) {
        throw err;
    }
};

module.exports.updateOfficer = updateOfficer;

async function getGrievancesFunction(officialUsername, status, role) {
    try {
        const Grievance = require('./grievance');
        const GrievanceStatus = require('./grievanceStatus');

        const grievanceIds = await Escalation.find({
            "officerHierarchyStack.0": officialUsername
        }).select('grievanceId').exec();

        console.log(grievanceIds);
        const grievancesArrayPromise = grievanceIds.map(async grievanceIdObject => {
            try {
                const grievanceStatus = await GrievanceStatus.findOne({
                    grievanceId: grievanceIdObject.grievanceId
                }).exec();

                console.log(grievanceStatus);

                if (role === 'districtOfficer') {
                    if (grievanceStatus.status === status) {
                        const grievance = await Grievance.findOne({
                            id: grievanceIdObject.grievanceId
                        }).exec();

                        console.log(grievance);

                        const finalGrievance = {
                            id: grievanceIdObject.id,
                            username: grievanceIdObject.phoneNumber,
                            fullName: grievanceIdObject.fullName,
                            country: grievanceIdObject.country,
                            address: grievanceIdObject.address,
                            gender: grievanceIdObject.gender,
                            state: grievanceIdObject.state,
                            district: grievanceIdObject,
                            pincode: grievanceIdObject.pincode,
                            email: grievanceIdObject.email,
                            description: grievanceIdObject.description,
                            department: grievanceIdObject.department,
                            attachments: grievanceIdObject.attachments,
                            status: grievanceStatus.status,
                            scrutinizedTime: grievanceStatus,
                            rejectedTime: grievanceStatus.rejectedTime,
                            resolvedTime: grievanceStatus.resolvedTime,
                            inprogressTime: grievanceStatus.inprogressTime,
                            submittedTime: grievanceStatus.submittedTime
                        }

                        return finalGrievance;
                    }
                }else{
                    if(grievanceStatus.status !== 'cancelled'){
                        const grievance = await Grievance.findOne({
                            id: grievanceIdObject.grievanceId
                        }).exec();

                        console.log(grievance);

                        const finalGrievance = {
                            id: grievanceIdObject.id,
                            username: grievanceIdObject.phoneNumber,
                            fullName: grievanceIdObject.fullName,
                            country: grievanceIdObject.country,
                            address: grievanceIdObject.address,
                            gender: grievanceIdObject.gender,
                            state: grievanceIdObject.state,
                            district: grievanceIdObject,
                            pincode: grievanceIdObject.pincode,
                            email: grievanceIdObject.email,
                            description: grievanceIdObject.description,
                            department: grievanceIdObject.department,
                            attachments: grievanceIdObject.attachments,
                            status: grievanceStatus.status,
                            scrutinizedTime: grievanceStatus,
                            rejectedTime: grievanceStatus.rejectedTime,
                            resolvedTime: grievanceStatus.resolvedTime,
                            inprogressTime: grievanceStatus.inprogressTime,
                            submittedTime: grievanceStatus.submittedTime
                        }

                        return finalGrievance;
                    }
                }

            } catch (err) {
                throw err;
            }
        });

        const grievancesArrayObject = await Promise.all(grievancesArrayPromise);
        //returing grievances
        return grievancesArrayObject;

    } catch (err) {
        throw err;
    }
};

module.exports.getGrievances = getGrievancesFunction;
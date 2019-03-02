const mongoose = require('mongoose');
const EnumValues = require('mongoose-enumvalues');

const Enumeration = require('./enumeration');

const grievanceStatusSchema = new mongoose.Schema({
    grievanceId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Enumeration.Status,
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

updateStatusFunction = async (grievanceId, toChangeStatus) => {
    try {
        const mail = require('./../mail');
        const Grievance = require('./grievance');

        const grievanceObject = await Grievance.findOne({
            id: grievanceId
        }).select('email').exec();

        const currentTime = Date.now();

        //send mail to user
        const email = grievanceObject.email;
        const subForUser = `Notification for your grievance`;
        const msgForUser = `Your complaint has been ${toChangeStatus}`;

        mail(email, subForUser, msgForUser);

        if (toChangeStatus === 'scrutinized') {
            const updatedStatusObjectForScrutinized = await GrievanceStatus.findOneAndUpdate({
                grievanceId: grievanceId
            }, {
                status: toChangeStatus,
                scrutinizedTime: currentTime
            }, {
                new: true
            });

            return updatedStatusObjectForScrutinized;
        } else if (toChangeStatus === 'accepted') {
            const updatedStatusObjectForAccepted = await GrievanceStatus.findOneAndUpdate({
                grievanceId: grievanceId
            }, {
                status: `work in progress`,
                inprogressTime: currentTime
            }, {
                new: true
            });

            return updatedStatusObjectForAccepted;
        } else if (toChangeStatus === 'rejected') {
            const updatedStatusObjectForRejected = await GrievanceStatus.findOneAndUpdate({
                grievanceId: grievanceId
            }, {
                status: toChangeStatus,
                rejectedTime: currentTime
            }, {
                new: true
            });

            return updatedStatusObjectForRejected;
        } else if (toChangeStatus === 'resolved') {
            const updatedStatusObjectForResolved = await GrievanceStatus.findOneAndUpdate({
                grievanceId: grievanceId
            }, {
                status: toChangeStatus,
                resolvedTime: currentTime
            }, {
                new: true
            });

            return updatedStatusObjectForResolved;
        }
    } catch (err) {
        throw err;
    }
};

module.exports.updateStatus = updateStatusFunction;

const cancelGrievanceFunction = async function (token) {
    try {
        const grievanceStatusObject = await GrievanceStatus.findOne({
            grievanceId: token
        }).exec();

        if (grievanceStatusObject.status === "submitted") {
            const currentTime = Date.now() + "";
            const updatedGrievanceObject = await GrievanceStatus.findOneAndUpdate({
                grievanceId: token
            }, {
                status: 'cancelled',
                cancelledTime: currentTime
            }, {
                new: true
            });
            return {
                object: updatedGrievanceObject,
                message: `successful`
            }
        } else {
            throw new Error();
        }

    } catch (err) {
        throw err;
    }
}

module.exports.cancelGrievance = cancelGrievanceFunction;

const grievancesDataFunction = async function () {
    try {
        const GrievanceStatus = require('./grievanceStatus');
        const grievanceStatusTotalSubmited = await GrievanceStatus.count({}).exec();
        const grievanceStatusTotalResolved = await GrievanceStatus.count({
            status: 'resolved'
        }).exec();
        const inProgressCount = await GrievanceStatus.count({
            status: 'work in progress'
        }).exec();
        const rejectedCount = await GrievanceStatus.count({
            status: 'rejected'
        }).exec();
        const cancelledCount = await GrievanceStatus.count({
            status: 'cancelled'
        }).exec();
        const scrutinizedCount = await GrievanceStatus.count({
            status: 'scrutinized'
        }).exec();
        const submittedCount = await GrievanceStatus.count({
            status: 'submitted'
        }).exec();
        const stats = {
            submitted: grievanceStatusTotalSubmited,
            resolved: grievanceStatusTotalResolved,
            submittedCount: submittedCount,
            inProgressCount: inProgressCount,
            cancelledCount: cancelledCount,
            resolvedCount: grievanceStatusTotalResolved,
            rejectedCount: rejectedCount,
            scrutinizedCount: scrutinizedCount
        }
        return stats;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports.grievancesData = grievancesDataFunction;

const getGrievancesFunction = async function (status) {
    try {
        const Grievance = require('./grievance');
        const Escalation = require('./escalation');
        const DistrictOfficer = require('./districtOfficer');
        const ZonalOfficer = require('./zonalOfficer');

        const grievancesStatusObjects = await GrievanceStatus.find({
            status: status
        }).exec();

        const grievancesFinalObjectPromises = grievancesStatusObjects.map(async grievanceStatusObject => {

            const grievanceObject = await Grievance.findOne({
                id: grievanceStatusObject.grievanceId
            }).exec();

            const escalationObject = await Escalation.findOne({
                grievanceId: grievanceObject.id
            }).select('officerHierarchyStack').exec();

            const officerId = escalationObject.officerHierarchyStack[0];
            console.log(`${officerId}`);

            if (escalationObject.officerHierarchyStack.length === 1) {
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
                    submittedTime: grievanceStatusObject.submittedTime,
                    officerPhoneNumber: districtOfficerDetailsObject.phoneNumber,
                    officerEmailAddress: districtOfficerDetailsObject.email
                };
                return finalObject;

            } else {
                const zonalOfficerDetailsObject = await ZonalOfficer.findOne({
                    username: officerId
                }).exec();

                const date = new Date(Number(grievanceStatusObject.submittedTime));
                grievanceStatusObject.submittedTime = `${date.toLocaleDateString("en-US")} ${date.toLocaleTimeString("en-US")}`;


                const finalObject = {
                    officerName: zonalOfficerDetailsObject.fullName,
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
                    role: `zonalOfficer`,
                    submittedTime: grievanceStatusObject.submittedTime,
                    officerPhoneNumber: zonalOfficerDetailsObject.phoneNumber,
                    officerEmailAddress: zonalOfficerDetailsObject.email
                };
                return finalObject;
            }

        });

        const grievancesFinalObject = await Promise.all(grievancesFinalObjectPromises);
        return grievancesFinalObject;

    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports.getGrievances = getGrievancesFunction;
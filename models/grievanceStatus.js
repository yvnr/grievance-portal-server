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

    const grievanceStatusObject = await GrievanceStatus.findOne({
        grievanceId: token
    }).exec();

    if (grievanceStatusObject.status === 'submitted') {
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
        return {
            message: `cant cancelled`
        }
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
        const stats = {
            submitted: grievanceStatusTotalSubmited,
            resolved: grievanceStatusTotalResolved

        }
        return stats;
    } catch (err) {
        console.log(err);
        throw err;

    }
}

module.exports.grievancesData = grievancesDataFunction;
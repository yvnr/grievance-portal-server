const mongoose = require('mongoose');
const EnumValues = require('mongoose-enumvalues');

const resolutionSchema = new mongoose.Schema({
    grievanceId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    attachments: [{
        type: String,
        require: true
    }]
}, {
    timestamps: true
});

module.exports = GrievanceResolution = mongoose.model('GrievanceResolution', resolutionSchema);

async function createResolutionFunction(grievanceResolutionObject) {
    try {
        const grievanceResolution = await grievanceResolutionObject.save();
        return grievanceResolution;
    } catch (err) {
        throw err;
    }
}

module.exports.createResolution = createResolutionFunction;
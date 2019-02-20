const mongoose = require('mongoose');
const Email = require('mongoose-type-email');
const Enumeration = require('./enumeration');

//for promises
mongoose.Promise = global.Promise;

const publicSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: Enumeration.Gender,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    country: {
        type: String,
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
    phoneNumber: {
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

const Public = mongoose.model('User', publicSchema);
module.exports = Public;

//for registering new user in system
module.exports.createPublicUser = async (newUser) => {
    try {
        const user = await newUser.save();
        console.log(`This user has been successfully created`);
        return user;
    } catch (err) {
        console.log(`Following error occurred while creating new user : ${err}`);
        throw err;
    }
};
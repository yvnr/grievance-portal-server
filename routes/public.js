const express = require('express');
const Public = require('./../models/public');
const router = express.Router();

//Public registration process
router.route('/register')
    .post((req, res) => {

        //retrieving form fields from request body
        const phoneNumber = req.body.phoneNumber;
        const gender = req.body.gender;
        const address = req.body.address;
        const country = req.body.country;
        const state = req.body.state;
        const district = req.body.district;
        const pincode = req.body.pincode;
        const email = req.body.email;
        const password = req.body.password;

        const public = new Public({
            username: phoneNumber,
            gender: gender,
            address: address,
            country: country,
            state: state,
            district: district,
            pincode: pincode,
            phoneNumber: phoneNumber,
            email: email,
            password: password
        });

        Public.createPublicUser(public)
            .then(user => {
                console.log(user);
                res.status(200).json({
                    message: `success`
                });
            }).catch(err => {
                res.status(500).json({
                    message: `username/password already exists`
                });
            })
    });

//Public login process
router.route('/login')
    .post((req, res) => {
        console.log(`Trigered post request on "public/login"`);
        res.status(200).json({
            message: `successful`
        });
    });

module.exports = router;
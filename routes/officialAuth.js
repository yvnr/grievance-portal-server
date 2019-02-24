const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const DistrictOfficer = require('./../models/districtOfficer');
const ZonalOfficer = require('./../models/zonalOfficer');

//official login process
router.route('/login')
    .post((req, res) => {
        passport.authenticate('officialLogin', (err, userFromAuth, info) => {
            if (err) {
                res.status(500).json({
                    message: info.message
                });
            }
            if (userFromAuth === false) {
                console.log(`message: ${info.message}`);
                res.status(500).json({
                    message: info.message
                });
            } else {
                //logging in user goes here

                console.log(`${userFromAuth.username}`);

                if (info.role === `districtOfficer`) {

                    DistrictOfficer.findOne({
                            username: userFromAuth.username
                        })
                        .then(userDoc => {

                            const token = jwt.sign({
                                username: userDoc.username
                            }, process.env.JWT_SECRET);

                            res.status(200).json({
                                auth: true,
                                token: token,
                                message: `user found and logged in`,
                                user: {
                                    username: userDoc.username,
                                    fullName: userDoc.fullName,
                                    email: userDoc.email,
                                    phoneNumber: userDoc.phoneNumber,
                                    role: `districtOfficer`
                                }
                            });
                        });
                } else {

                    ZonalOfficer.findOne({
                            username: userFromAuth.username
                        })
                        .then(userDoc => {

                            const token = jwt.sign({
                                username: userDoc.username
                            }, process.env.JWT_SECRET);

                            res.status(200).json({
                                auth: true,
                                token: token,
                                message: `user found and logged in`,
                                user: {
                                    username: userDoc.username,
                                    fullName: userDoc.fullName,
                                    email: userDoc.email,
                                    phoneNumber: userDoc.phoneNumber,
                                    role: `zonalOfficer`
                                }
                            });
                        })
                        .catch(err => {
                            console.log(`Error occured ${err}`);
                            res.status(500).json({
                                message: `unsuccessful`
                            })
                        });
                }
            }
        })(req, res);
    });
//`use strict`;

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Path = require('path');

const Public = require('./../models/public');
const Grievance = require('./../models/grievance');

//initialize multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './attachments');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${Path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage
});

//Public registration process
router.route('/register')
    .post((req, res, next) => {
        passport.authenticate('register', (err, userFromAuth, info) => {
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
                //registration goes here
                req.logIn(userFromAuth, err => {
                    Public.findOne({
                            email: req.body.email
                        })
                        .then(user => {
                            if (user !== null) {
                                console.log(`email already taken`);
                                res.status(500).json({
                                    message: `${user.email} is already taken`
                                })
                            } else {

                                const public = new Public({
                                    username: userFromAuth.username,
                                    gender: req.body.gender,
                                    address: req.body.address,
                                    country: req.body.country,
                                    state: req.body.state,
                                    district: req.body.district,
                                    pincode: req.body.pincode,
                                    phoneNumber: req.body.phoneNumber,
                                    email: req.body.email,
                                    fullName: req.body.fullName,
                                    password: userFromAuth.password
                                });

                                Public.createPublicUser(public)
                                    .then(user => {
                                        console.log(user);
                                        res.status(200).json({
                                            message: `success`
                                        });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            message: `unsuccessful`
                                        })
                                    })
                            }
                        })
                        .catch(err => {
                            console.log(`Error occured ${err}`);
                        });
                });

            }
        })(req, res, next);
    });

//Public login process
router.route('/login')
    .post((req, res, next) => {
        passport.authenticate('publicLogin', (err, userFromAuth, info) => {
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
                req.logIn(userFromAuth, err => {
                    console.log(`${userFromAuth.username}`);

                    Public.findOne({
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
                                    phoneNumber: userDoc.phoneNumber
                                }
                            });
                        })
                        .catch(err => {
                            console.log(`Error occured ${err}`);
                            res.status(500).json({
                                message: `unsuccessful`
                            })
                        });

                });
            }
        })(req, res, next);
    });

//public raising new grievance process
router.route('/newGrievance')
    //     include 
    //      passport.authenticate('jwt', {
    //     session: false
    // }), 
    .post(upload.any(), (req, res) => {
        //creating attachments path array
        console.log(req.files);
        let attachmentsPath = [];

        req.files.map(file => {
            attachmentsPath.push(file.path);
        });

        //generating token object
        const tokenObject = {
            token: req.body.username,
            tokenPassword: req.body.username.substring(3, 7)
        };

        const grievance = new Grievance({
            id: Date.now(),
            username: req.body.username,
            fullName: req.body.fullName,
            country: req.body.country,
            address: req.body.address,
            gender: req.body.gender,
            state: req.body.state,
            district: req.body.district,
            pincode: req.body.pincode,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            description: req.body.description,
            department: req.body.department,
            attachments: attachmentsPath,
            token: tokenObject.token,
            tokenPassword: tokenObject.tokenPassword
        });

        Grievance.raiseGrievance(grievance)
            .then(trueObject => {
                console.log(trueObject);
                res.status(200).json({
                    message: `successful`
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: `unsuccessful`
                });
            });
    });

module.exports = router;
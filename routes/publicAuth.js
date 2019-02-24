const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const Public = require('./../models/public');

//Public registration process
router.route('/register')
    .post((req, res, next) => {
        console.log(req.body);
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

module.exports = router;
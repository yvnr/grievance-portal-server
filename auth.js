//`use strict`;

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const Public = require('./models/public');
const DistrictOfficer = require('./models/districtOfficer');
const ZonalOfficer = require('./models/zonalOfficer');

//bcrypt salt rounds
const BCRYPT_SALT_ROUNDS = 12;

module.exports = () => {

    //local strategy for registering a new user
    passport.use('register', new LocalStrategy({
        usernameField: 'phoneNumber',
        passwordField: 'password',
        session: false
    }, (username, password, done) => {
        console.log(`${username}`);
        Public.findOne({
                username: username
            })
            .then(user => {
                if (user) {
                    return done(null, false, {
                        message: `${user.username} is already taken`
                    });
                } else {
                    bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
                        .then(hashedPassword => {

                            const user = {
                                username: username,
                                password: hashedPassword
                            };

                            console.log(user);
                            return done(null, user);
                        });
                }
            })
            .catch(err => {
                console.log(`Error occured ${err}`);
                return (err, false, {
                    message: `unsuccessful`
                })
            });
    }));

    //local strategy to pubic/login route
    passport.use('publicLogin', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false
    }, (username, password, done) => {
        Public.findOne({
                username: username
            }).select('username password')
            .then(user => {
                if (user === null) {
                    return done(null, false, {
                        message: `username is not valid`
                    });
                } else {
                    console.log(`typed password: ${password}\nhashed password: ${user.password}`);
                    bcrypt.compare(password, user.password)
                        .then(res => {
                            if (res) {
                                console.log(`user authenticated`);
                                return done(null, user, {
                                    message: `successful`
                                });
                            } else {
                                return done(null, false, {
                                    message: `password is incorect`
                                });
                            }
                        });
                }
            })
            .catch(err => {
                console.log(`Error occured ${err}`);
                return (err, false, {
                    message: `unsucessful`
                });
            });
    }));

    //local strategy to official/login route
    passport.use('officialLogin', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false
    }, (username, password, done) => {
        DistrictOfficer.findOne({
                username: username
            }).select('username password')
            .then(user => {
                if (user === null) {
                    ZonalOfficer.findOne({
                            username: username
                        }).select('username password')
                        .then(user => {
                            if (user == null) {
                                return done(null, false, {
                                    message: `username or password is incorrect.`
                                });
                            } else {
                                console.log(`typed password : ${password}\nhashed password : ${user.password}`);
                                if (password === user.password) {
                                    console.log(`user authenticated`);
                                    return done(null, user, {
                                        role: `zonalOfficer`,
                                        message: `successful`
                                    });
                                } else {
                                    return done(null, false, {
                                        message: `username or password is incorrect.`
                                    });
                                }
                            }
                        })
                } else {
                    console.log(`typed password : ${password}\nhashed password : ${user.password}`);
                    if (password === user.password) {
                        console.log(`user authenticated`);
                        return done(null, user, {
                            role: `districtOfficer`,
                            message: `successful.`
                        });
                    } else {
                        return done(null, false, {
                            message: `username or password is incorrect.`
                        });
                    }
                }
            })
            .catch(err => {
                console.log(`Error occured ${err}`);
                return (err, false, {
                    message: `Internal server error, please try again after sometime.`
                });
            });
    }));

    //passport jwt strategy to decode jwt from request
    //options for strategy
    const options = {
        jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('Bearer'),
        secretOrKey: process.env.JWT_SECRET
    }

    passport.use('publicJWT', new JWTStrategy(options, (jwt_payload, done) => {
        Public.findOne({
                username: jwt_payload.username
            })
            .then(user => {
                if (user) {
                    console.log('IN PASSPORT: user found');
                    return done(null, user);
                } else {
                    console.log('IN PASSPORT: user not found');
                    return done(null, false, {
                        message: `Not authenticated user`
                    });
                }
            })
            .catch(err => {
                console.log(`Error occured is internal : ${err}`);
                return done(err, false, {
                    message: `Internal server error`
                });
            });
    }));

    passport.use('officialJWT', new JWTStrategy(options, (jwt_payload, done) => {
        DistrictOfficer.findOne({
                username: jwt_payload.username
            })
            .then(user => {
                if (user) {
                    console.log('IN PASSPORT: user found');
                    return done(null, user);
                } else {
                    ZonalOfficer.findOne({
                            username: jwt_payload.username
                        })
                        .then(user => {
                            if (user) {
                                console.log('IN PASSPORT: user found');
                                return done(null, user);
                            } else {
                                console.log('IN PASSPORT: user not found');
                                return done(null, false, {
                                    message: `Not authenticated user`
                                });
                            }
                        });
                }
            })
            .catch(err => {
                console.log(`Error occured is internal : ${err}`);
                return done(err, false, {
                    message: `Internal server error`
                });
            });
    }));
};
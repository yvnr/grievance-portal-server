//`use strict`;

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./auth');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');

//for cors request
const cors = require('cors');

// config dotenv to use process.env
dotenv.config();

const app = express();

async function connectToDatabase() {
    try {
        const connection = await mongoose.connect('mongodb+srv://DIPPHakunaMatatadbAdmin:beanbag@123@clusterdipp-gsdin.mongodb.net/test?retryWrites=true', {
            useNewUrlParser: true
        });
        console.log(`connection established successfully`);
        return connection;
    } catch (err) {
        console.log(`connection was unsucessfull ${err}`);
    }
};

connectToDatabase().then(() => {

    //for cross origin resource sharing
    app.use(cors());

    //static
    app.use('/', express.static(path.join(__dirname, './')));

    //for authentication
    app.use(passport.initialize());

    //using body-parser
    app.use(bodyParser.json({
        limit: '10mb'
    }));
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb',
        parameterLimit: 100000
    }));

    //call auth() function 
    auth();

    // auth middleware
    function isAuthenticatedPublic(req, res, next) {
        passport.authenticate('publicJWT', {
            session: false
        }, (err, userFromAuth, info) => {
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
                console.log(userFromAuth);
                req.user = userFromAuth;
                next();
            }
        })(req, res, next);
    }

    function isAuthenticatedOfficial(req, res, next) {
        passport.authenticate('officialJWT', {
            session: false
        }, (err, userFromAuth, info) => {
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
                console.log(userFromAuth);
                req.user = userFromAuth;
                next();
            }
        })(req, res, next);
    }

    //routes

    //home
    const index = require('./routes/index');
    app.use('/', index);

    //public authentication
    const publicAuth = require('./routes/publicAuth');
    app.use('/api/public/auth', publicAuth);

    //official authentication
    const officialAuth = require('./routes/officialAuth');
    app.use('/api/official/auth', officialAuth);

    //to view status
    const grievance = require('./routes/grievance');
    app.use('/api/grievance', grievance);

    //public
    const public = require('./routes/public');
    app.use('/api/public', isAuthenticatedPublic, public);

    //official
    const official = require('./routes/official');
    app.use('/api/official', isAuthenticatedOfficial, official);

});

app.listen(process.env.PORT || 8080, () => {
    console.log('Listening on port 8080...');
});

module.exports = app;
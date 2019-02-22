//`use strict`;

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./auth');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');

// config dotenv to use process.env
dotenv.config();

const app = express();

async function connectToDatabase() {
    try {
        const connection = await mongoose.connect('mongodb://localhost:27017/dippGrievanceDB', {
            useNewUrlParser: true
        });
        console.log(`connection established successfully`);
        return connection;
    } catch (err) {
        console.log(`connection was uncessfull`);
    }
};

connectToDatabase().then(() => {

    //static
    app.use('/attachments', express.static(path.join(__dirname, './attachments')));

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

    //routes

    //home
    const index = require('./routes/index');
    app.use('/', index);

    //public
    const public = require('./routes/public');
    app.use('/public', public);

    //official
    const official = require('./routes/official');
    app.use('/official', official);

});

module.exports = app;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

async function connectToDatabase() {
    try {
        const connection = await mongoose.connect('mongodb://localhost:27017/dippGrievanceDB');
        console.log(`connection established successfully`);
        return connection;
    } catch (err) {
        console.log(`connection was uncessfull`);
    }
};

connectToDatabase().then(() => {
    //using body-parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    //call auth() function 


    const index = require('./routes/index');
    app.use('/', index);

    const public = require('./routes/public');
    app.use('/public', public);

});

module.exports = app;
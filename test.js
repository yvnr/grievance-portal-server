const Escalation = require('./models/escalation');
const mongoose = require('mongoose');

const connection = mongoose.connect('mongodb://localhost:27017/dippGrievanceDB', {
    useNewUrlParser: true
});

Escalation.updateOfficer('1550814665705').then(doc => console.log(doc))
    .catch(err => console.log(err));
const mongoose = require('mongoose');
const Escalation = require('./models/escalation');

mongoose.connect('mongodb://localhost:27017/dippGrievanceDB', {
    useNewUrlParser: true
});

mongoose.Promise = global.Promise

const currentTime = Date.now();
console.log('hello');
(function () {
    Escalation.collection.findAndModify({
        grievanceId: "1550894433235"
    }, [], {
        '$push': {
            'officerHierarchyStack': {
                '$each': ["7777777777"],
                '$position': 0
            },
            'escalationStack': {
                '$each': [currentTime + ""],
                '$position': 0
            }
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err)
            console.log(err);
        else
            console.log(doc);
    });
})();
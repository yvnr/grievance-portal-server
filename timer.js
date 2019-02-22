const mongoose = require('mongoose');
const Escalation = require('./models/escalation');

module.exports = (id, timeLimit, timer) => {
    return setTimeout(() => {
        console.log(`grievance id ${id}`);
        Escalation.updateOfficer(id)
            .then(escalation => {
                console.log(`${escalation}`);
            })
            .catch(err => {
                console.log(err);
            });
        if (timer !== null) {
            //this is for submitted/scrutinized status
            clearTimeout(timer);
        } else {
            //this is for work in progress state
        }
    }, timeLimit);
};
const express = require('express');
const router = express.Router();

const Grievance = require('./../models/grievance');

router.route('/status')
    .post((req, res) => {
        Grievance.getGrievancesFromToken(req.body.tokenId, req.body.tokenPassword)
            .then(resultObject => {
                console.log(resultObject);
                res.status(200).json({
                    message: resultObject.message,
                    grievance: resultObject.grievance
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `Internal server error, please try again after sometime.`,
                    grievance: {}
                });
            });
    });

module.exports = router;
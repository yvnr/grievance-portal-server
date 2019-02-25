//`use strict`;

const express = require('express');
const router = express.Router();

const GrievanceStatus = require('./../models/grievanceStatus');
router.route('/')
    .get((req, res) => {
        GrievanceStatus.grievancesData()
            .then(stats => {
                console.log(stats);
                res.status(200).json({
                    message: `successful`,
                    stats: stats
                });
            })
            .catch(err => {
                res.status(400).json({
                    message: 'unsuccesful',
                    stats: null
                });
            });

    });

module.exports = router;
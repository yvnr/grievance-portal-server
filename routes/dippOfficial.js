const express = require('express');
const router = express.Router();
const GrievanceStatus = require('./../models/grievanceStatus');
const Grievance = require('./../models/grievance');
const Reference = require('./../models/reference');

router.route('/stats')
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
                    message: 'Internal server error, please try again after sometime.',
                    stats: {}
                });
            });
    });

router.route('/grievances')
    .get((req, res) => {
        GrievanceStatus.getGrievances(req.query.status)
            .then(grievances => {
                console.log(grievances);
                res.status(200).json({
                    message: `successful`,
                    grievances: grievances
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: `Internal server error, please try again after sometime.`,
                    grievances: []
                });
            });
    });

router.route('/districtStats')
    .get((req, res) => {
        Grievance.getStats(req.query.district)
            .then(statsObject => {
                console.log(statsObject);
                res.status(200).json(statsObject);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `Internal server error, please try again after sometime.`,
                    stats: {}
                });
            });
    });

router.route('/rtiGrievances')
    .get((req, res) => {
        Reference.getReferences()
            .then(references => {
                console.log(references);
                res.status(200).json({
                    message: `successful`,
                    references: references
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `Internal server error, try after sometime`,
                    references: []
                });
            });
    });

module.exports = router;
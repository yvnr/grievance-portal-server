//`use strict`;

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Path = require('path');

const DistrictOfficer = require('./../models/districtOfficer');
const ZonalOfficer = require('./../models/zonalOfficer');
const Escalation = require('./../models/escalation');
const GrievanceStatus = require('./../models/grievanceStatus');
const GrievanceResolution = require('./../models/grievanceResolution');

//initialize multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './attachments');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${Path.extname(file.originalname)}`);
    }
});

//for multer
const upload = multer({
    storage
});

//official grievance view process
router.route('/allocatedGrievances')
    .get((req, res) => {
        Escalation.getGrievances(req.user.username, req.query.status, req.query.role)
            .then(grievances => {
                console.log(grievances);
                res.status(200).json({
                    message: `successful`,
                    grievances: grievances
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `unsuccesful`,
                    grievances: null
                });
            });
    });

router.route('/updateGrievanceStatus')
    .put((req, res) => {
        GrievanceStatus.updateStatus(req.query.grievanceId, req.query.status)
            .then(resultObject => {
                console.log(resultObject);
                res.status(200).json({
                    message: `successful`
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `unsuccessful`
                });
            });
    })
    .post(upload.any(), (req, res) => {
        GrievanceStatus.updateStatus(req.query.grievanceId, req.query.status)
            .then(resultObject => {
                console.log(resultObject);

                //add later..
                // let attachmentsPath = [];

                //creating attachments path array
                // console.log(req.files);

                // req.files.map(file => {
                //     attachmentsPath.push(file.path);
                // });

                const grievanceResolution = new GrievanceResolution({
                    grievanceId: req.query.grievanceId,
                    description: req.body.description,
                    //attachments: attachmentsPath
                });

                GrievanceResolution.createResolution(grievanceResolution)
                    .then(grievanceResolutionObject => {
                        console.log(grievanceResolutionObject);
                        res.status(200).json({
                            message: `successful`
                        });
                    });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `unsuccessful`
                });
            });
    });

router.route('/zonalGrievances')
    .get((req, res) => {
        ZonalOfficer.getGrievancesForZonalOfficer(req.user.username)
            .then(grievances => {
                console.log(grievances);
                res.status(200).json({
                    message: `successful`,
                    grievances: grievances
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `unsuccessful`,
                    grievances: null
                });
            });
    });

module.exports = router;
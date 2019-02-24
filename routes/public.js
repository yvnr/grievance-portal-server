//`use strict`;

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Path = require('path');

const Public = require('./../models/public');
const Grievance = require('./../models/grievance');
const GrievanceStatus = require('./../models/grievanceStatus');

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

//public raising new grievance process
router.route('/newGrievance')
    .post(upload.any(), (req, res) => {
        //creating attachments path array
        console.log(req.files);
        let attachmentsPath = [];

        req.files.map(file => {
            attachmentsPath.push(file.path);
        });

        //check for middleware
        console.log(req.user.username);

        //generating token object
        const tokenObject = {
            token: req.user.username,
            tokenPassword: req.user.username.substring(3, 7)
        };

        const grievance = new Grievance({
            id: Date.now(),
            username: req.user.username,
            fullName: req.body.fullName,
            country: req.body.country,
            address: req.body.address,
            gender: req.body.gender,
            state: req.body.state,
            district: req.body.district,
            pincode: req.body.pincode,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            description: req.body.description,
            department: req.body.department,
            attachments: attachmentsPath,
            token: tokenObject.token,
            tokenPassword: tokenObject.tokenPassword
        });

        Grievance.raiseGrievance(grievance)
            .then(trueObject => {
                console.log(trueObject);
                res.status(200).json({
                    message: `successful`
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: `unsuccessful`
                });
            });
    });

router.route('/cancelGrievance')
    .put((req, res) => {
        GrievanceStatus.cancelGrievance(req.query.token)
            .then(resultObject => {
                console.log(resultObject.object);
                res.status(200).json({
                    message: resultObject.message
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `unsuccessful`
                });
            });
    });

router.route('/submittedGrievances')
    .get((req, res) => {
        Grievance.getGrievances(req.user.username)
            .then(grievances => {
                console.log(grievances);
                res.status(200).json({
                    message: `successful`,
                    grievances: grievances
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: `unsuccessful`
                });
            });
    });

module.exports = router;
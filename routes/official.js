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

// initialize cloud storage
const firebase = require('firebase');
const gcloud = require('@google-cloud/storage');

//console.log(gcloud);

const cStorage = new gcloud.Storage({
    projectId: 'dipp-d6ff8',
    keyFilename: './firebase.json'
});

const bucket = cStorage.bucket('gs://dipp-d6ff8.appspot.com/');

//initialize multer
const storage = multer.memoryStorage();
//for multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
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
                    message: `Internal server error, please try again after sometime.`,
                    grievances: []
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
                    message: `Internal server error, please try again after sometime.`
                });
            });
    })
    .post(upload.single('attachments'), (req, res) => {
        GrievanceStatus.updateStatus(req.query.grievanceId, req.query.status)
            .then(async resultObject => {
                try {
                    console.log(resultObject);

                    let attachmentsPath = [];

                    //creating attachments path array
                    console.log(req.file);

                    //changed from array to single object
                    // const dummyPromise = req.files.map(file => {
                    // attachmentsPath.push(file.path);
                    const path = await uploadFileToCloud(req.file);
                    attachmentsPath.push(path);

                    const grievanceResolution = new GrievanceResolution({
                        grievanceId: req.query.grievanceId,
                        description: req.body.description,
                        attachments: attachmentsPath
                    });

                    GrievanceResolution.createResolution(grievanceResolution)
                        .then(grievanceResolutionObject => {
                            console.log(grievanceResolutionObject);
                            res.status(200).json({
                                message: `successful`
                            });
                        });
                } catch (err) {
                    throw err;
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `Internal server error, please try again after sometime.`
                });
            });
    });

router.route('/zonalGrievances')
    .get((req, res) => {
        ZonalOfficer.getGrievancesForZonalOfficers(req.user.username)
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
                    message: `Internal server error, please try again after sometime.`,
                    grievances: []
                });
            });
    });

const uploadFileToCloud = (file) => {
    let prom = new Promise((resolve, reject) => {
        console.log(file);
        const fileName = `attachments-${Date.now()}${Path.extname(file.originalname)}`;
        const fileUpload = bucket.file(fileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            throw new Error(err);
        });

        blobStream.on('finish', () => {
            const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media`;
            resolve(url);
        });

        blobStream.end(file.buffer);
    });
    return prom;
}

module.exports = router;
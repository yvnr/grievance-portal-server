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
const Reference = require('./../models/reference');

//initialize cloud storage
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

//public raising new grievance process
router.route('/newGrievance')
    .post(upload.single('attachments'), async (req, res) => {
        try {
            //creating attachments path array
            console.log(req.files);

            let attachmentsPath = [];

            //creating attachments path array
            console.log(req.file);

            // req.files.map(file => {
            //     attachmentsPath.push(file.path);
            // });

            const path = await uploadFileToCloud(req.file);
            attachmentsPath.push(path);

            //check for middleware
            console.log(req.user.username);

            const currentTime = Date.now() + "";

            //generating token object
            const tokenObject = {
                token: currentTime,
                tokenPassword: currentTime.substring(3, 6) + req.user.username.substring(3, 6)
            };

            if ((req.body.reference.length) > 0) {
                Grievance.findOne({
                        id: req.body.reference
                    })
                    .then(async grievance => {
                        const reference = new Reference({
                            id: grievance.id,
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

                        

                        Reference.createReference(reference)
                            .then(reference => {
                                console.log(reference);
                                res.status(200).json({
                                    message: `successful`,
                                    reference: reference
                                });
                            });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            message: `Internal server error, please try after some time`,
                            reference: {}
                        });
                    });
            } else {
                const grievance = new Grievance({
                    id: currentTime,
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
                            message: `TokenId:${tokenObject.token} TokenPassword:${tokenObject.tokenPassword}`
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: `Internal server error, please try again after sometime.`
                        });
                    });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: `Internal server error, please try again after sometime.`
            });
        }
    });

router.route('/cancelGrievance')
    .put((req, res) => {
        GrievanceStatus.cancelGrievance(req.query.token)
            .then(grievanceObject => {
                console.log(grievanceObject.object);
                res.status(200).json({
                    message: grievanceObject.message
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: `Internal server error, please try again after sometime.`
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
            console.log(err);
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
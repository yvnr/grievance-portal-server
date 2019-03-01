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

//initialize cloud storage
const firebase = require('firebase');
const gcloud = require('@google-cloud/storage');

console.log(gcloud);

const cStorage = new gcloud.Storage({
    projectId: 'dipp-d6ff8',
    keyFilename: {
        "type": "service_account",
        "project_id": "dipp-d6ff8",
        "private_key_id": "8423b0cc67fa2f58f1089d9ff3517d4850d0dde2",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDkGrz/Pu8zhTkb\nYT9sOTQFuWmAJ9LvZQ+W4dV0VYDRWYEr+M7133Mo3ouB2sZDBLjlZcaJu3aiDlGc\nwpJ/i9aaqfSgFYatESh1cUecitX/P+hhgtgP/whlp3jVgu59LE9pyCcZexKr3nad\na1bOtqqOPyVNYqchZr/GqS9GiQp10TXnKtGR7jAhLsnrLuRZLwCDA+dt8KZNKGkJ\nUiO6qp26023ong8SbcJzCIRI8dmBGpprYo9GPAumWehgCo5TCvoq70vsPve0s5E5\n9hUpBN8WCfdHdDZ/IAmIUXDQJDCv6dDAxHb/6KrAsbpvnyNKvFMU/jT8ekCEVj8r\nwlrg7+DbAgMBAAECggEACbdH2JluJ+QjUBK+2FXBbQL+RuqrVe4YkWUyKd/gekpV\nMbHJ4vgvGA0OpSvT6RPg6kiBAendvj5c5I/3HH6w1+qoVE9GasXB0urN0ZGqVtJ6\ni/i+SkQjL+1HvNR0YxmJkmhnnfK7k12I8OCbFHf8YM24wYiTtN0DCyu2q0r4CpeX\nlT6xgJ627SIjZ8urMaoKuAgZM+aW4ua36Hi5CXdikW7+uVmqN3+XQoDpmdb7l+5i\nPsQye11cfunb49PUTJOB57agxPHHy8naMbuhWhqp8o0fmLvxDwvsRhiPfy+cECCE\nKg0Oy6RariI8oDZdvLtUW1nEYVmMurSBWegE+zDg0QKBgQD/rPrhUvVGu144mPeu\nHfNtHEXZvSMI12IGAr5ZHcHG6InimyWk3Jr2kFNn+YJZ7L5oxLPECsCUMkGP4HTK\n3/J+IGSSmYC2GcYiLlpHwrWCEX0ytvvPz3vdqA2d0L4SPWCee47ITMmYN8j1VB4f\nG0+Or02vCT7qoqTkTRO8kIowCwKBgQDkZM4/c7rSZKmWsSvjEYe/x+B3y7FAVR4f\nPKBmf1dXxy9Y7IAcs/AqMpGEyYki9qBQ6M8NTTI0nqkTyvKyZphq3ylVLC0EJ7rb\n5MlrNLHxkDaMulS/AEDehPxgP+etlI1L5XJ/i0LO/mS75UKRiuV9xC6lHqlUqoJx\nEi/7PWGEcQKBgCElG6D6UDHLOHu92N4Jo/URJT0E9/W9dkexM1v6L5TJsJZf5pFo\nx+4O58Ei53Mg7c5HMcbIXg7YNQeh4YIrZhRTvrYCkF0LGlR0DeAfrcge3EwmzJ40\nF6q0jo9W8E0NB+mDuw7cZYYGNVcYgI8nyziEIV3/pNhmHVo7Y8OeOUvhAoGBAI9u\nMwwsHKYmK06EY0BNcQfieTgiRmVVTv5k74KO9AYfA7//fhEIe4m0iihu/F1lrpZB\nLk53LVFYVmwkprecsJllHirr/DVA0htoGYnm5N0EKQ3FspTkjthvgaLcXx1mTjnc\nlUQ9663cmtxZBK4sISUTQAvYLpUKI7LorhNEn+oxAoGASexAjeG536fAKuiuQIpb\nC+oR6ftXAyVnJ7khUhFEVlQITeP6qHHUHhvSyWDdGJueRUOlhD1NgikSy0qxGVeq\nLEUHZi8xMUKJC8i5dW18bPU5496DHhsTk2qoudRfgMqyQw5XkF1cPExEfCyKAWGq\nTovcqID9q6fA5BuWdAu5kfU=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-jinqe@dipp-d6ff8.iam.gserviceaccount.com",
        "client_id": "114263007077454359046",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jinqe%40dipp-d6ff8.iam.gserviceaccount.com"
    }
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
                        message: `successful`
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        message: `Internal server error, please try again after sometime.`
                    });
                });
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
            .then(resultObject => {
                console.log(resultObject.object);
                res.status(200).json({
                    message: resultObject.message
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
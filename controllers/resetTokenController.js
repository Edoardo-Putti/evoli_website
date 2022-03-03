var db = require('../models/index')
const crypto = require('crypto');
const nodemailer = require('nodemailer');



const { body, validationResult } = require('express-validator');

const transport = nodemailer.createTransport({
    host: 'XXXX',
    port: XX,
});

exports.create = [
    body('email').isEmail().escape().withMessage('a proper email must be specified.'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('resetPwd', { title: 'Reset Password', errors: errors.array() });
            return;
        } else {
            if (req.baseUrl.includes('student')) {
                db.Student.findOne({ where: { email: req.body.email } }).then(data => {
                    if (data) {
                        var expireDate = new Date();
                        expireDate.setHours(expireDate.getHours() + 1);
                        const token = {
                            email: req.body.email,
                            expiration: expireDate,
                            token: crypto.randomBytes(64).toString('base64').replace('+', 'K'),
                            used: 0
                        }
                        db.ResetToken.create(token).then(data => {
                            const message = {
                                from: 'evoli-noreply@polimi.it',
                                to: req.body.email,
                                replyTo: 'noreply',
                                subject: 'Reset password',
                                text: 'To reset your password, please click the link below.\n\nhttps://www.evoli.polimi.it/reset-password?token=' + encodeURIComponent(data.token) + '&email=' + req.body.email + '&stud=true'
                            };
                            transport.sendMail(message, function(err, info) {
                                if (err) {
                                    res.render('resetPwd', { title: 'Reset Password', errors: [err] });

                                } else {
                                    res.render('resetPwd', { title: 'Reset Password', success: 'Email successfully sent' });
                                }
                            });
                        })

                    } else {
                        res.render('resetPwd', { title: 'Reset Password', success: 'Email successfully sent' });
                    }
                })
            } else {
                db.Teacher.findOne({ where: { email: req.body.email } }).then(data => {
                    if (data) {
                        var expireDate = new Date();
                        expireDate.setHours(expireDate.getHours() + 1);
                        var t = crypto.randomBytes(64).toString('base64')
                        const token = {
                            email: req.body.email,
                            expiration: expireDate,
                            token: t,
                            used: 0
                        }
                        db.ResetToken.create(token).then(data => {
                            const message = {
                                from: 'evoli-noreply@polimi.it',
                                to: req.body.email,
                                replyTo: 'noreply',
                                subject: 'Reset password',
                                text: 'To reset your password, please click the link below.\n\nhttps://www.evoli.polimi.it/reset-password?token=' + encodeURIComponent(data.token) + '&email=' + req.body.email + '&stud=false'
                            };
                            transport.sendMail(message, function(err, info) {
                                if (err) {
                                    res.render('resetPwd', { title: 'Reset Password', errors: [err] });

                                } else {
                                    res.render('resetPwd', { title: 'Reset Password', success: 'Email successfully sent' });
                                }
                            });
                        })

                    } else {
                        res.render('resetPwd', { title: 'Reset Password', success: 'Email successfully sent' });
                    }
                })
            }

        }


    }
];

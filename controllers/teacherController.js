const { body, validationResult } = require('express-validator');
var db = require('../models/index')
const firebaseSecurity = require('firebase-scrypt');
const crypto = require('crypto');
const session = require('express-session');
const { Op } = require("sequelize");
var async = require('async')
var uuid = require("uuid");

const parameters = {
    memCost: 14,
    rounds: 8,
    saltSeparator: 'Bw==',
    signerKey: 'IbuhlHCi1htxQKG5bQlTBa8FgceAnnZCBGdkZeTQUKtKPmGcuQkhpqinJe+NIGrFuXeq5rNduMdU4wPdJxTZ4g==',
}
const scrypt = new firebaseSecurity.FirebaseScrypt(parameters)

exports.logIn = [
    body('email').isEmail().escape().withMessage('a proper email must be specified.'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.message = {
                login: true,
                message: 'a proper email must be specified.'
            }
            res.redirect(301, '/teacher');
            return;
        } else {
            db.Teacher.findOne({ where: { email: req.body.email } }).then(data => {
                if (data) {
                    scrypt.verify(req.body.password, data.salt, data.hash).then(isValid => {
                        if (isValid) {
                            req.session.teacherId = data.uid
                            req.session.teacher = data.email;

                            res.redirect(301, '/teacher');
                        } else {
                            req.session.message = {
                                login: true,
                                message: 'Auth Failed Password mismatch'
                            }
                            res.redirect(301, '/teacher');

                        }
                    })
                } else {
                    req.session.message = {
                        login: true,
                        message: 'User not found'
                    }
                    res.redirect(301, '/teacher');
                }
            })
        }
    }
]

exports.signUp = [
    body('email').isEmail().escape().withMessage('a proper email must be specified.'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.message = {
                signup: true,
                message: 'a proper email must be specified.'
            }
            res.redirect(301, '/teacher');
            return;
        } else {
            db.Teacher.findOne({ where: { email: req.body.email } }).then(data => {
                if (data) {
                    req.session.message = {
                        signup: true,
                        message: 'User Already Exist'
                    }
                    res.redirect(301, '/teacher');
                } else {
                    var salt = crypto.randomBytes(16).toString('base64');
                    scrypt.hash(req.body.password, salt).then(hash => {
                        var stud = {
                            email: req.body.email,
                            hash: hash,
                            salt: salt
                        }
                        db.Teacher.create(stud).then(data => {
                            req.session.teacherId = data.uid
                            req.session.teacher = data.email;
                            res.redirect(301, '/teacher');
                        }).catch(err => {
                            req.session.message = {
                                signup: true,
                                message: err
                            }
                            res.redirect(301, '/teacher');
                        })
                    })
                }
            })
        }
    }
]

exports.logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/teacher');
}

exports.retriveData = (req, res) => {
    async.parallel({
        folders: function(callback) {
            db.Folder.findAll({ where: { uid: req.session.teacherId } }).then(data => {
                if (data) {
                    callback(null, data);
                } else {
                    var folder = {
                        fid: uuid.v4().replace(/-/g, ""),
                        uid: req.session.teacherId,
                        name: 'untitled'
                    }
                    db.Folder.create(folder).then(data => {
                        callback(null, [data]);
                    })
                }

            })


        },
        videos: function(callback) {
            db.Video.findAll({ where: { uid: req.session.teacherId } }).then(data => {
                callback(null, data);
            })

        }

    }).then(results => {
        res.status(200).send(results)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}






exports.newVideo = (req, res) => {
    var video = {
        vid: uuid.v4().replace(/-/g, ""),
        title: req.body.title,
        duration: req.body.seconds,
        folder: req.body.folder,
        url: req.body.id,
        uid: req.session.teacherId,
        video_code: crypto.randomBytes(4).toString('base64').slice(0, -2),
        comment: req.body.comment
    }
    db.Video.create(video).then(data => {
        res.status(200).send(data)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })

}

exports.newFolder = (req, res) => {
    var folder = {
        fid: uuid.v4().replace(/-/g, ""),
        name: req.body.name,
        uid: req.session.teacherId,
    }
    db.Folder.create(folder).then(data => {
        res.status(200).send(data)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}
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
            res.redirect(301, '/student');
            return;
        } else {
            db.Student.findOne({ where: { email: req.body.email } }).then(data => {
                if (data) {
                    scrypt.verify(req.body.password, data.salt, data.hash).then(isValid => {
                        if (isValid) {
                            req.session.loggedin = true;
                            req.session.email = data.email;

                            res.redirect(301, '/student');
                        } else {
                            req.session.message = {
                                login: true,
                                message: 'Auth Failed Password mismatch'
                            }
                            res.redirect(301, '/student');

                        }
                    })
                } else {
                    req.session.message = {
                        login: true,
                        message: 'User not found'
                    }
                    res.redirect(301, '/student');
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
            res.redirect(301, '/student');
            return;
        } else {
            db.Student.findOne({ where: { email: req.body.email } }).then(data => {
                if (data) {
                    req.session.message = {
                        signup: true,
                        message: 'User Already Exist'
                    }
                    res.redirect(301, '/student');
                } else {
                    var salt = crypto.randomBytes(16).toString('base64');
                    scrypt.hash(req.body.password, salt).then(hash => {
                        var stud = {
                            email: req.body.email,
                            hash: hash,
                            salt: salt
                        }
                        db.Student.create(stud).then(data => {
                            req.session.loggedin = true;
                            req.session.email = data.email;
                            res.redirect(301, '/student');
                        }).catch(err => {
                            req.session.message = {
                                signup: true,
                                message: err
                            }
                            res.redirect(301, '/student');
                        })
                    })
                }
            })
        }
    }
]

exports.logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/student');
}


exports.checkCode = async(req, res, next) => {
    db.Video.findOne({ where: { video_code: req.body.code } }).then(data => {
        if (data) {
            req.session.code = data.video_code
            req.session.url = data.url
            req.session.title = data.title
            res.redirect(req.baseUrl + '/class')

        } else {
            req.session.message = {
                code: true,
                message: 'There is no video corresponding to this code.'
            }
            res.redirect(301, '/student');
        }

    })
}


exports.checkCodeAnonim = (req, res) => {
    db.Video.findOne({ where: { video_code: req.body.code } }).then(data => {
        if (data) {
            req.session.email = req.body.anonim
            req.session.code = data.video_code
            req.session.url = data.url
            req.session.title = data.title
            res.redirect(req.baseUrl + '/class')
        } else {
            req.session.message = {
                code: true,
                message: 'There is no video corresponding to this code.'
            }
            res.redirect(301, '/student');
        }

    })
}

exports.retriveData = (req, res) => {
    if (req.session.loggedin) {
        async.parallel({
            slider: function(callback) {
                db.Slider.findOne({
                    where: {
                        [Op.and]: [{ video_code: req.session.code }, { user_name: req.session.email }]
                    }
                }).then(data => {
                    callback(null, data);
                })

            },
            reaction: function(callback) {
                db.Reaction.findAll({
                    where: {
                        [Op.and]: [{ video_code: req.session.code }, { user_name: req.session.email }]
                    }
                }).then(data => {
                    callback(null, data);
                })

            }

        }).then(results => {
            if (results) {
                res.status(200).json({
                    res: results
                })
            }
        }).catch(err => {
            res.status(500).json({ msg: err })
        })
    } else {
        res.status(404).json({ msg: 'not logged' })
    }
}


exports.updateSlider = (req, res) => {
    if (req.body.type == 'true') {
        db.Slider.update({ understanding: req.body.value }, { where: { sid: req.body.sid } }).then((data) => {
            res.status(200).json({ done: data });
        }).catch(err => {
            res.status(500).json({ msg: err })
        })
    } else {
        db.Slider.update({ appreciation: req.body.value }, { where: { sid: req.body.sid } }).then((data) => {
            res.status(200).json({ done: data });
        }).catch(err => {
            res.status(500).json({ msg: err })
        })
    }
}

exports.newReaction = (req, res) => {
    var reaction = {
        rid: uuid.v4().replace(/-/g, ""),
        type: req.body.type,
        at_second: req.body.second,
        video_code: req.session.code,
        user_name: req.session.email,
        visible: 0
    }
    db.Reaction.create(reaction).then(data => {
        res.status(200).json({ reaction: data });
    }).catch(err => {
        res.status(404).json({ msg: err })
    })

}

exports.deleteReaction = (req, res) => {
    db.Reaction.destroy({ where: { rid: req.body.rid } }).then(data => {
        res.status(200).json({ reaction: data });
    }).catch(err => {
        res.status(404).json({ msg: err })
    })
}

exports.updateComment = (req, res) => {
    db.Reaction.update({ type: req.body.comment }, { where: { rid: req.body.rid } }).then((data) => {
        res.status(200).json({ done: data });
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.updateVisibility = (req, res) => {
    async.parallel({
        slider: function(callback) {
            if (req.session.loggedin) {
                db.Slider.update({ visible: 1 }, { where: { sid: req.body.sid } }).then((data) => {
                    callback(null, data);
                })
            } else {
                var slider = {
                    appreciation: req.body.appreciation,
                    understanding: req.body.understanding,
                    video_code: req.session.code,
                    user_name: req.session.email,
                    visible: 1
                }
                db.Slider.create(slider).then(data => {
                    callback(null, data);
                })
            }

        },
        reaction: function(callback) {
            db.Reaction.update({ visible: 1 }, {
                where: {
                    rid: JSON.parse(req.body.rids)
                }
            }).then(data => {
                callback(null, data);
            })

        }

    }).then(results => {
        res.status(200).send('ok')
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}
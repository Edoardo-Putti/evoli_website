const { body, validationResult } = require('express-validator');
var db = require('../models/index')
const firebaseSecurity = require('firebase-scrypt');
const crypto = require('crypto');
const session = require('express-session');
const { Op } = require("sequelize");
var async = require('async')
var uuid = require("uuid");
var xl = require('excel4node');
fs = require('fs');

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
            db.Folder.findAll({ attributes: ['name'], where: { uid: req.session.teacherId } }).then(data => {
                if (data) {
                    callback(null, data);
                } else {
                    var folder = {
                        fid: uuid.v4().replace(/-/g, ""),
                        uid: req.session.teacherId,
                        name: 'untitled'
                    }
                    db.Folder.create(folder).then(data => {
                        callback(null, [{ name: data.name }]);
                    })
                }

            })


        },
        videos: function(callback) {
            db.Video.findAll({ attributes: ['title', 'duration', 'folder', 'url', 'video_code', 'comment', 'new'], where: { uid: req.session.teacherId } }).then(data => {
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

exports.modifyComment = (req, res) => {
    db.Video.update({ comment: req.body.note }, { where: { video_code: req.body.code } }).then(data => {
        res.status(200).send(data)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.modifyTitle = (req, res) => {
    db.Video.update({ title: req.body.title }, { where: { video_code: req.body.code } }).then(data => {
        res.status(200).send(data)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.renameFolder = (req, res) => {
    async.parallel({
        folders: function(callback) {
            db.Folder.update({ name: req.body.name }, {
                where: {
                    [Op.and]: [{ name: req.body.old }, { uid: req.session.teacherId }]
                }
            }).then(data => {
                callback(null, data);
            })


        },
        videos: function(callback) {
            db.Video.update({ folder: req.body.name }, {
                where: {
                    [Op.and]: [{ folder: req.body.old }, { uid: req.session.teacherId }]
                }
            }).then(data => {
                callback(null, data);
            })

        }

    }).then(results => {
        res.status(200).send(results)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.deleteFolder = (req, res) => {
    async.parallel({
        folders: function(callback) {
            db.Folder.destroy({
                where: {
                    [Op.and]: [{ name: req.body.folder }, { uid: req.session.teacherId }]
                }
            }).then(data => {
                callback(null, data);
            })


        },
        videos: function(callback) {
            db.Video.destroy({
                where: {
                    [Op.and]: [{ folder: req.body.folder }, { uid: req.session.teacherId }]
                }
            }).then(data => {
                callback(null, data);
            })

        },
        reactions: function(callback) {
            db.Reaction.destroy({
                where: {
                    video_code: JSON.parse(req.body.videoCodes)
                }
            }).then(data => {
                callback(null, data);
            })


        },
        sliders: function(callback) {
            db.Slider.destroy({
                where: {
                    video_code: JSON.parse(req.body.videoCodes)
                }
            }).then(data => {
                callback(null, data);
            })


        },

    }).then(results => {
        res.status(200).send(results)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.deleteVideo = (req, res) => {
    async.parallel({
        videos: function(callback) {
            db.Video.destroy({
                where: {
                    [Op.and]: [{ video_code: JSON.parse(req.body.codes) }, { uid: req.session.teacherId }]
                }
            }).then(data => {
                callback(null, data);
            })

        },
        reactions: function(callback) {
            db.Reaction.destroy({
                where: {
                    video_code: JSON.parse(req.body.codes)
                }
            }).then(data => {
                callback(null, data);
            })


        },
        sliders: function(callback) {
            db.Slider.destroy({
                where: {
                    video_code: JSON.parse(req.body.codes)
                }
            }).then(data => {
                callback(null, data);
            })


        },

    }).then(results => {
        res.status(200).send(results)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.moveVideo = (req, res) => {
    db.Video.update({ folder: req.body.folder }, { where: { video_code: JSON.parse(req.body.codes) } }).then(data => {
        res.status(200).send(data)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.removeFeedback = (req, res) => {
    async.parallel({
        videos: function(callback) {
            var res = []
            codes.forEach((codes, index) => {
                db.Video.update({ new: 0 }, {
                    where: {
                        [Op.and]: [{ video_code: codes[index] }, { uid: req.session.teacherId }]
                    }
                }).then(data => {
                    res.push(data)
                })
            })
            callback(null, res);
        },
        reactions: function(callback) {
            db.Reaction.destroy({
                where: {
                    video_code: JSON.parse(req.body.codes)
                }
            }).then(data => {
                callback(null, data);
            })


        },
        sliders: function(callback) {
            db.Slider.destroy({
                where: {
                    video_code: JSON.parse(req.body.codes)
                }
            }).then(data => {
                callback(null, data);
            })


        },

    }).then(results => {
        res.status(200).send(results)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.removeFeedbackCode = (req, res) => {
    var codes = JSON.parse(req.body.codes)
    async.parallel({
        videos: function(callback) {
            var res = {}
            codes.forEach((elem, index) => {
                var code = crypto.randomBytes(4).toString('base64').slice(0, -2);
                db.Video.update({ video_code: code, new: 0 }, {
                    where: {
                        [Op.and]: [{ video_code: elem }, { uid: req.session.teacherId }]
                    }
                }).then(data => {
                    res[codes[index]] = code
                })
            })
            callback(null, res);
        },
        reactions: function(callback) {
            db.Reaction.destroy({
                where: {
                    video_code: JSON.parse(req.body.codes)
                }
            }).then(data => {
                callback(null, data);
            })


        },
        sliders: function(callback) {
            db.Slider.destroy({
                where: {
                    video_code: JSON.parse(req.body.codes)
                }
            }).then(data => {
                callback(null, data);
            })


        },

    }).then(results => {
        res.status(200).send(results)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

exports.showStats = (req, res) => {
    db.Slider.findOne({
        where: {
            [Op.and]: [{ video_code: req.body.code }, { visible: 1 }]
        }
    }).then(data => {
        db.Video.update({ new: 0 }, {
            where: {
                [Op.and]: [{ video_code: req.body.code }, { uid: req.session.teacherId }]
            }
        })
        req.session.code = req.body.code
        res.status(200).send(data)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })

}

exports.retriveFeedbacks = (req, res) => {
    async.parallel({
        video: function(callback) {
            db.Video.findOne({
                attributes: ['title', 'duration', 'folder', 'url', 'video_code', 'comment', 'new'],
                where: {
                    [Op.and]: [{ video_code: req.session.code }, { uid: req.session.teacherId }]
                }
            }).then(data => {
                callback(null, data);
            })
        },
        reactions: function(callback) {
            db.Reaction.findAll({
                attributes: ['type', 'at_second', 'user_name'],
                where: {
                    [Op.and]: [{ video_code: req.session.code }, { visible: 1 }]
                }
            }).then(data => {
                callback(null, data);
            })


        },
        sliders: function(callback) {
            db.Slider.findAll({
                attributes: ['appreciation', 'understanding', 'user_name'],
                where: {
                    [Op.and]: [{ video_code: req.session.code }, { visible: 1 }]
                }
            }).then(data => {
                callback(null, data);
            })


        },

    }).then(results => {
        res.status(200).send(results)
    }).catch(err => {
        res.status(500).json({ msg: err })
    })
}

function secondsToMinutes(s) {
    var h = Math.floor(s / 3600); //Get whole hours
    s -= h * 3600;
    var m = Math.floor(s / 60); //Get remaining minutes
    s -= m * 60;
    if (h == 0) {
        return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
    } else {
        return h + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
    }
}

var Readable = require('stream').Readable

exports.saveImage = (req, res) => {
    var str = req.body.chart
    var img = str.substring(str.indexOf(",") + 1);
    console.log(img)
    const imgBuffer = Buffer.from(img, 'base64')
    var s = new Readable()
    s.push(imgBuffer)
    s.push(null)
    s.pipe(fs.createWriteStream('canvas/' + req.body.name + '.png'));
    res.status(200).send('ok')
}

exports.download = (req, res) => {
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('statistics');
    var ws2 = wb.addWorksheet('comments');


    var header1 = [
        '# students',
        'average understanding',
        'average appreciation',
        '# I get it',
        '# I don\'t get it',
        '# comments'
    ]
    var header2 = [
        'Comments',
        'Minute',
        'Student id'
    ]
    header1.forEach((h, i) => {
        ws.cell(1, i + 1).string(h)
    })
    header2.forEach((h, i) => {
        ws2.cell(1, i + 1).string(h)
    })

    var stat = JSON.parse(req.body.stat);
    var comments = JSON.parse(req.body.comments)
    stat.forEach((h, i) => {
        ws.cell(2, i + 1).number(h)
    })
    comments.forEach((c, i) => {
        ws2.cell(i + 2, 1).string(c.type)
        ws2.cell(i + 2, 2).string(secondsToMinutes(c.at_second))
        ws2.cell(i + 2, 3).string(c.user_name)
    })

    ws.addImage({
        path: 'canvas/' + req.body.name + '.png',
        type: 'picture',
        position: {
            type: 'oneCellAnchor',
            from: {
                col: 1,
                row: 5,
            },
        },
    });
    wb.write('EVOLI_' + req.body.name + '_data', res)
    setTimeout(() => { fs.unlinkSync('canvas/' + req.body.name + '.png'); }, 200)

}
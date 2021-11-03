var express = require('express');
var DataTypes = require("sequelize").DataTypes;
const { Op } = require("sequelize");
var db = require('../models/index')
const crypto = require('crypto');
const firebaseSecurity = require('firebase-scrypt');
const parameters = {
    memCost: 14,
    rounds: 8,
    saltSeparator: 'Bw==',
    signerKey: 'IbuhlHCi1htxQKG5bQlTBa8FgceAnnZCBGdkZeTQUKtKPmGcuQkhpqinJe+NIGrFuXeq5rNduMdU4wPdJxTZ4g==',
}
const scrypt = new firebaseSecurity.FirebaseScrypt(parameters)

var async = require('async')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Evoli' });
});

router.get('/about', function(req, res, next) {
    res.render('about', { title: 'About' });
});

router.get('/credits', function(req, res, next) {
    res.render('credits', { title: 'Credits' });
});

router.get('/reset-password', async function(req, res, next) {
    var exp = new Date();
    db.ResetToken.findOne({
        where: {
            [Op.and]: [{ email: req.query.email }, {
                expiration: {
                    [Op.gt]: exp
                }
            }, { token: req.query.token }]
        }
    }).then(data => {
        if (data) {
            return res.render('reset-password', {
                showForm: true,
                record: data,
                role: req.query.stud
            });
        } else {
            res.render('reset-password', {
                message: 'Token has expired. Please try password reset again.',
                showForm: false
            });
        }
    })
});

function isValidPassword(pwd) {

    if (pwd == pwd.toLowerCase()) {
        return false;
    } else if (!(/\d/.test(pwd))) {
        return false
    } else if (pwd.length < 6) {
        return false
    }
    return true
}

router.post('/reset-password', async function(req, res, next) {
    if (req.body.password1 !== req.body.password2) {
        return res.json({ status: 'error', message: 'Passwords do not match. Please try again.' });
    }

    if (!isValidPassword(req.body.password1)) {
        return res.json({ status: 'error', message: 'Password does not meet minimum requirements. Please try again.' });
    }
    exp = new Date()
    db.ResetToken.findOne({
        where: {
            [Op.and]: [{ email: req.body.email }, {
                expiration: {
                    [Op.gt]: exp
                }
            }, { token: req.body.token }, { used: 0 }]
        }
    }).then(data => {
        if (data) {
            async.parallel({
                updateToken: function(callback) {
                    db.ResetToken.update({ used: 1 }, { where: { token: req.body.token } }).then(data => {
                        callback(null, data);
                    })
                },
                updateHash: function(callback) {
                    var salt = crypto.randomBytes(16).toString('base64');
                    scrypt.hash(req.body.password1, salt).then(hash => {
                        if (JSON.parse(req.body.role)) {
                            db.Student.update({ hash: hash, salt: salt }, { where: { email: req.body.email } }).then((data) => { callback(null, data); })
                        } else {
                            db.Teacher.update({ hash: hash, salt: salt }, { where: { email: req.body.email } }).then((data) => { callback(null, data); })
                        }
                    })

                },
                function(err, result) {
                    if (err) {
                        err.status = 404;
                        return next(err);
                    } else {
                        res.json({ status: 'ok', message: 'Password reset. Please login with your new password.' });
                    }

                }
            })
        } else {
            return res.json({ status: 'error', message: 'Token not found or already used Please try the reset password process again.' });
        }
    })



});

module.exports = router;
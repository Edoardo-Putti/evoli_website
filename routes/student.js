var express = require('express');
var router = express.Router();
var resetTokenCon = require('../controllers/resetTokenController.js')
var studentController = require('../controllers/studentController');
/* GET users listing. */
router.get('/', function(req, res, next) {
    if (req.session.loggedin) {
        res.render('studLogHome', { title: 'Student Home', name: req.session.email })
    } else {
        res.render('studHome', { title: 'Student Home' });
    }

});

router.get('/resetPwd', function(req, res, next) {
    res.render('resetPwd', { title: 'Reset Password' });
});

router.get('/class', function(req, res, next) {
    res.render('studentClass', { title: 'Classroom', name: req.session.email, url: req.session.url, video: req.session.title, reactions: req.session.reaction, slider: req.session.slider })
})

router.post('/resetPwd', resetTokenCon.create);

router.post('/login', studentController.logIn);

router.post('/signup', studentController.signUp);

router.get('/logout', studentController.logOut);

router.post('/checkCodeAnonim', studentController.checkCodeAnonim)

router.post('/checkCode', studentController.checkCode)

module.exports = router;
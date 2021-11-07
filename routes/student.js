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

router.get('/videoOver', function(req, res, next) {
    delete req.session.code
    delete req.session.url
    delete req.session.title
    res.render('endVideo', { title: 'Video Over' });
})

router.get('/resetPwd', function(req, res, next) {
    res.render('resetPwd', { title: 'Reset Password' });
});

router.get('/class', function(req, res, next) {
    if (req.session.url) {
        res.render('studentClass', { title: 'Classroom', name: req.session.email, url: req.session.url, video: req.session.title })
    } else {
        res.redirect('/student')
    }

})

router.post('/resetPwd', resetTokenCon.create);

router.post('/login', studentController.logIn);

router.post('/signup', studentController.signUp);

router.get('/logout', studentController.logOut);

router.post('/checkCodeAnonim', studentController.checkCodeAnonim);

router.post('/checkCode', studentController.checkCode);

router.get('/getFeedbacks', studentController.retriveData);

router.post('/updateSlider', studentController.updateSlider)

router.post('/newReaction', studentController.newReaction)

router.post('/deleteReaction', studentController.deleteReaction);

router.post('/updateComment', studentController.updateComment)

router.post('/updateVisibility', studentController.updateVisibility)


module.exports = router;
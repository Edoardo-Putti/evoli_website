var express = require('express');
var router = express.Router();
var resetTokenCon = require('../controllers/resetTokenController.js')
var teacherController = require('../controllers/teacherController');
/* GET users listing. */
router.get('/', function(req, res, next) {
    if (req.session.teacher) {
        res.render('profHome', { title: 'Instructor Home', name: req.session.teacher })
    } else {
        res.render('teacherAuth', { title: 'Auth' })
    }
});

router.get('/resetPwd', function(req, res, next) {
    res.render('resetPwd', { title: 'Reset Password' });
});

router.get('/statistics', function(req, res, next) {
    if (req.session.teacher) {
        res.render('feedbacks', { title: 'View feedbacks', name: req.session.teacher });
    } else {
        res.render('teacherAuth', { title: 'Auth' })
    }

});

router.get('/aggStats', function(req, res, next) {
    if (req.session.teacher) {
        res.render('aggStat', { title: 'Aggregated Stats', name: req.session.teacher });
    } else {
        res.render('teacherAuth', { title: 'Auth' })
    }

});

router.get('/compare', function(req, res, next) {
    if (req.session.teacher) {
        res.render('compare', { title: 'Aggregated Stats', name: req.session.teacher });
    } else {
        res.render('teacherAuth', { title: 'Auth' })
    }

});

router.get('/studentStats', function(req, res, next) {
    if (req.session.teacher) {
        res.render('studentStats', { title: 'Aggregated Stats', name: req.session.teacher });
    } else {
        res.render('teacherAuth', { title: 'Auth' })
    }

});

router.post('/login', teacherController.logIn);

router.post('/signup', teacherController.signUp);

router.post('/resetPwd', resetTokenCon.create);

router.post('/retriveData', teacherController.retriveData);

router.post('/newVideo', teacherController.newVideo);

router.post('/newFolder', teacherController.newFolder);

router.post('/modifyComment', teacherController.modifyComment);

router.post('/modifyTitle', teacherController.modifyTitle);

router.post('/renameFolder', teacherController.renameFolder)

router.post('/deleteFolder', teacherController.deleteFolder)

router.post('/deleteVideo', teacherController.deleteVideo);

router.post('/moveVideo', teacherController.moveVideo);

router.post('/removeFeedback', teacherController.removeFeedback);

router.post('/removeFeedbackCode', teacherController.removeFeedbackCode);

router.post('/showStats', teacherController.showStats);

router.post('/retriveFeedbacks', teacherController.retriveFeedbacks)

router.post('/saveImage', teacherController.saveImage);

router.post('/download', teacherController.download);

router.post('/retriveAggStats', teacherController.aggStats);

router.post('/checkOne', teacherController.checkOne);

router.get('/logout', teacherController.logOut);


module.exports = router;
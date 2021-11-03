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


router.post('/login', teacherController.logIn);

router.post('/signup', teacherController.signUp);

router.post('/resetPwd', resetTokenCon.create);

router.post('/retriveData', teacherController.retriveData);

router.post('/newVideo', teacherController.newVideo);

router.post('/newFolder', teacherController.newFolder);


router.get('/logout', teacherController.logOut);

module.exports = router;
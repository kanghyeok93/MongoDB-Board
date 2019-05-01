var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'User - Login', message : req.flash('loginMessage') });
});

router.post('/login',passport.authenticate('login',{
  successRedirect : '/boards',
  failureRedirect :'/login',
  failureFlash : true
}));

router.get('/logout',function(req,res,nxet){
  req.logout();
  res.redirect('/boards');
});

router.get('/kakao', passport.authenticate('kakao-login'));
router.get('/oauth', passport.authenticate('kakao-login',{
  successRedirect : '/boards',
  failureRedirect : '/'
}));

module.exports = router;

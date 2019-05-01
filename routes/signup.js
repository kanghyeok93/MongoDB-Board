var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Sign - Up', message : req.flash('signMessage') });
});

router.post('/sign',passport.authenticate('sign',{
    successRedirect : '/boards',
    failureRedirect :'/signup',
    failureFlash : true
}));

router.get('/logout',function(req,res,nxet){
   req.logout();
   res.redirect('/boards');
});




module.exports = router;

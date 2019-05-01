var LocalStrategy = require('passport-local').Strategy;
var User = require('../modelset/Schema');
var KakaoStrategy = require('passport-kakao').Strategy;

module.exports = function(passport){

    passport.serializeUser(function(user,done){
            done(null,user.id);
    });
    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user);
        });
        console.log(id);
    });

    passport.use('sign',new LocalStrategy({
        usernameField : 'id',
        passwordField : 'password',
        passReqToCallback : true
    }, function(req,id,password,done){
        User.findOne({'id' : id }, function(err,user){
            if(err) return done(err);
            if(user){
                return done(null,false,req.flash('signMessage','아이디가 존재합니다.'))
            }else{
                var newUser = new User();
                newUser.id = req.body.id;
                newUser.nickname = req.body.nickname;
                newUser.email = req.body.email;
                newUser.password = newUser.createHash(password);
                newUser.deleted  = true;
                console.log('haha',newUser.deleted);
                newUser.save(function(err){
                    if(err) throw err;
                    return done(null,newUser);
                })
            }
        })
    }));

    passport.use('login',new LocalStrategy({
        usernameField : 'id',
        passwordField : 'password',
        passReqToCallback : true
    },function(req,id,password,done){
        User.findOne({'id' : id},function(err,user){
            if(err) return done(err);
            if(!user){
                return done(null,false,req.flash('loginMessage','사용자를 찾을 수 없습니다.'));
            }
            if(!user.comPassword(password)){
                return done(null,false,req.flash('loginMessage','비밀번호가 다릅니다.'));
            }
            user.deleted = true;
            return done(null,user);
        })
    }));

    passport.use('kakao-login', new KakaoStrategy({
            clientID: '02f2dce1bb267a24a17a3b8c4e1a85a6',
            callbackURL: 'http://localhost:3000/login/oauth'
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(profile);
            return done(null, profile);
        }));
};
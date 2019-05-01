var createError = require('http-errors');
var http = require('http');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/login');
var signUpRouter = require('./routes/signup');
var boards = require('./routes/contents');

var app = express();

// 포트 설정
app.set('port',process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(session({
  secret : 'kanghyeok93',
  resave :false,
  saveUninitialized : true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

require('./config/passport')(passport);

app.use('/', indexRouter);
app.use('/login', usersRouter);
app.use('/signup',signUpRouter);
app.use('/boards',boards);

// db 연결
mongoose.connect('mongodb://localhost:27017/local');
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error ! '));
db.once('open',function(){
  console.log('connected');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.createServer(app).listen(app.get('port'),function(){
  console.log('서버가 연결되었습니다.' + app.get('port'));
});

module.exports = app;

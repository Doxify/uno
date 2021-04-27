if(process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('./config/passport');
var session = require('express-session');
var db = require('./database/connection');

// Routes
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var gameUserRouter = require('./routes/gameUser');
var testsRouter = require('./routes/tests');
var gameRoomRouter = require('./routes/game_room')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// initializing sessions store
app.use(session({
  store: new (require('connect-pg-simple')(session))(),
  pgPromise: db,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sid',
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// initialize passport and restore authentication state.
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/gameUser', gameUserRouter);
app.use('/tests', testsRouter);
app.use('/gameroom', gameRoomRouter)


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

module.exports = app;

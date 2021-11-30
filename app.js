var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Sequelize = require('sequelize');
const config = require('./config/config.js');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var compression = require('compression');
require('dotenv').config();


let sequelize = new Sequelize(config.database, config.username, config.password, config);


var indexRouter = require('./routes/index');
var studentRouter = require('./routes/student');
var teacherRouter = require('./routes/teacher');

var app = express();
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

var sessionStore = new MySQLStore({
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
});

app.use(session({
    key: 'SpccvApK3KgSwWR5JQL8GEFixrVNxutGJju1PiGuZzIUOYc5YlkyqhoDyBEYnLRq1479gj2DCj5poBmI49oZQ',
    secret: 'rLE1ZqiyH6hv4RqQDcMdBjqAR1qTHqxwXjmPXuDEekjn96b5yk96GTpoUcBTfahptfvICpxp7C4eC0n8un3w',
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2628000000 },
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
})

app.use('/', indexRouter);
app.use('/student/', studentRouter);
app.use('/teacher', teacherRouter);

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
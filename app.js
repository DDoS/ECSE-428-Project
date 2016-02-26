var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var dotenv = require('dotenv');
var csurf = require('csurf');
var moment = require('moment');

var db = require('./data/db');

var routes = require('./routes/index');
var users = require('./routes/users');
var questions = require('./routes/questions');

dotenv.load({ path: __dirname + '/.env' });

var app = express();

app.locals.moment = moment;

// Enable Jade template view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon('./public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));
app.use(flash());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication support (passport.js)
require('./config/passport')(app);
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

// CSRF protection (only enabled in non-testing environments)
if (app.get('env') !== 'test') {
    app.use(csurf());
    app.use(function(req, res, next) {
        res.locals.csrfToken = req.csrfToken();
        next();
    });
}

// Routes
app.use('/', routes);
app.use('/users', users);
app.use('/questions',questions);

// 404 error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    // Other error handler (development, show stacktraces)
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
} else {
    // Other error handler (production, do not show stacktraces)
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

// Create database initialization function
app.set('initDb', function(done) {
    var dbName;
    if (app.get('env') === 'test') {
        dbName = process.env.DBNAME_TEST;
    } else {
        dbName = process.env.DBNAME_PROD;
    }

    app.database = new db.Database(dbName);

    if (app.get('env') === 'test') {
        app.database.clear(function() {
            app.database.initialize(function() {
                end();
            });
        })
    } else {
        app.database.initialize(function() {
            console.log('Production database initialized');
            end();
        });
    }

    function end() {
        app.set('db', app.database);
        done();
    }
});

module.exports = app;

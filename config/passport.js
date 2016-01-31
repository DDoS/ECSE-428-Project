var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const dbName = 'mayhem';
var db = require('../data/db');
var database = new db.Database(dbName);

passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser(function(username, done) {
    database.getUser(username, function(user) {
        done(null, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        database.getUser(username, function(user) {
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.authenticate(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));
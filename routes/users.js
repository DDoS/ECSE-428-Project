var async = require('async');

var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/login', function(req, res) {
    res.render('users/login', {
        title: 'Login'
    });
});

router.post('/login', function(req, res, next) {
    req.assert('username', 'Username cannot be empty.').notEmpty();
    req.assert('password', 'Password cannot be empty.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/users/login');
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('errors', {msg: info.message});
            return res.redirect('/users/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            req.flash('success', {msg: 'You are now logged in.'});
            res.redirect('/questions/find');
        });
    })(req, res, next);
});

router.get('/create', function(req, res) {
    res.render('users/signup', {
        title: 'Create Account'
    });
});

router.post('/create', function(req, res, next) {
    req.assert('username', 'Username is empty.').notEmpty();
    req.assert('email', 'Email is invalid.').isEmail();
    req.assert('password', 'Password must be at least 4 characters in length.').len(4);
    req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/users/create');
    }

    req.app.get('db').getUser(req.body.username, function(user) {
        if (user === undefined) { //if username is not already taken
            req.app.get('db').createUser(req.body.username, req.body.password, req.body.email, function(user) {
                //console.log(user);
                req.flash('success', {msg: 'Account successfully created.'});
                res.redirect('/users/login');
            });
        } else { //username already taken
            req.flash('errors', {msg: 'Account with that username already exists.'});
            return res.redirect('/users/create');
        }
    });
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/account', isAuthenticated, function(req, res) {
    var database = req.app.get('db');

    async.waterfall([
        function(done) {
            // Retrieve account information from database
            try {
                database.getUser(req.user.username, function(user) {
                    done(undefined, user);
                });
            } catch (err) {
                done(err);
            }
        },
        function(user, done) {
            // Display account information
            res.render('users/account', {
                title: 'Manage Account',
                email: user.email
            });
            done();
        }
    ]);
});

router.post('/account', isAuthenticated, function(req, res) {
    var database = req.app.get('db');
    var updateFail = 'Failed to update account information. Please try again.';
    var deleteFail = 'Failed to delete your account. Please try again.';

    // Client input validation
    if (req.body.type === 'update') {
        if (req.body.email !== '') {
            req.assert('email', 'Email is invalid.').isEmail();
        }
        if (req.body.password !== '' || req.body.confirmPassword !== '') {
            req.assert('password', 'Password must be at least 4 characters' +
                ' in length.').len(4);
            req.assert('confirmPassword', 'Passwords do not' +
                ' match.').equals(req.body.password);
        }
    } else if (req.body.type !== 'delete') {
        return error(updateFail);
    }

    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/users/account');
    }

    if (req.body.type === 'update') {
        async.series([
            function(done) {
                if (req.body.email) {
                    try {
                        database.editUserEmail(req.user.username,
                            req.body.email,
                            function() {
                                done();
                            }
                        );
                    } catch (err) {
                        done(err);
                    }
                } else {
                    done();
                }
            },
            function(done) {
                if (req.body.password) {
                    try {
                        database.editUserPassword(req.user.username,
                            req.body.password,
                            function() {
                                done();
                            }
                        );
                    } catch (err) {
                        done(err);
                    }
                } else {
                    done();
                }
            },
            function(done) {
                req.flash('success', {
                    msg: 'Account information updated.'
                });
                res.redirect(req.get('referer'));
                done();
            }
        ], function(err) {
            if (err) {
                error(updateFail);
            }
        });
    } else { //req.body.type ==='delete'
        try {
            database.deleteUser(req.user.username, function() {
                req.flash('success', {
                    msg: 'Account deleted.'
                });
                //user will be prevented from logging back in with a deactivated account
                req.logout(); 
                res.redirect('/');
            });
        } catch (err) {
            error(deleteFail)
        }
    }

    function error(msg) {
        req.flash('errors', {
            msg: msg
        });
        res.redirect(req.get('referer'));
    }
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('errors', {msg: 'Please login before performing that action.'});
    res.redirect('/users/login');
}

module.exports = router;

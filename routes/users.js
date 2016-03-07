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
      req.flash('errors', { msg: info.message });
      return res.redirect('/users/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'You are now logged in.' });
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

  req.app.get('db').getUser(req.body.username, function(user){
    if (user === undefined) { //if username is not already taken
      req.app.get('db').createUser(req.body.username, req.body.password, req.body.email, function(user) {
        //console.log(user);
        req.flash('success', { msg: 'Account successfully created.' });
        res.redirect('/users/login');
      });
    } else { //username already taken
      req.flash('errors', { msg: 'Account with that username already exists.' });
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
      } catch(err) {
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

  // Client input validation
  if (req.body.type === 'update') {
    req.assert('email', 'Email is invalid.').isEmail();
    req.assert('password', 'Password must be at least 4 characters in length.').len(4);
    req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);
  } else if (req.body.type === 'delete') {
    // TODO: Input validation for account deletion
  } else {
    return error();
  }
  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/users/account');
  }

  if (req.body.type === 'update') {
    async.series([
      function(done) {
        try {
          database.setUser(req.user.username, {
            email: req.body.email,
            password: req.body.password
          }, function() {
            done();
          });
        } catch (err) {
          done(err);
        }
      },
      function(done){
        req.flash('success', {
          msg: 'Account information updated.'
        });
        res.redirect(req.get('referer'));
      }
    ], function(err) {
      if (err) {
        error();
      }
    });
  } else {
    // TODO: Account deletion
  }

  function error() {
    req.flash('errors', {
      msg: 'Failed to update account information. Please try again.'
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

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
  req.assert('password', 'Password cannot be blank.').notEmpty();

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
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect('/');
    });
  })(req, res, next);
});

router.get('/create', function(req, res) {
  res.render('users/signup', {
    title: 'Create Account'
  });
});

router.post('/create', function(req, res, next) {
  req.assert('username', 'User name is empty.').notEmpty();
  req.assert('email', 'Email is not valid.').isEmail();
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
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
        req.flash('success', { msg: 'Account created successfully, please login.' });
        res.redirect('/users/login');
      });
    } else { //username already taken
      req.flash('errors', { msg: 'Account with that user name already exists.' });
      return res.redirect('/users/create');
    }
  });
});

module.exports = router;

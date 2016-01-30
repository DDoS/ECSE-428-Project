var express = require('express');
var router = express.Router();
var db = require('../data/db');

router.get('/login', function(req, res) {
  res.render('users/login', {
    title: 'Login'
  });
});

router.get('/create', function(req, res) {
  res.render('users/signup', {
    title: 'Create Account'
  });
});

router.post('/create', function(req, res, next) {
  req.assert('username', 'User name is empty').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/users/create');
  }

  //@todo add verification to make sure username and email is not already taken

  req.app.get('db').createUser(req.body.username, req.body.password, req.body.email, function(user) {
    //console.log(user);
    res.redirect('/users/login');
  });
});

module.exports = router;

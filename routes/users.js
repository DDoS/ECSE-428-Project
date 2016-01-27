var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
  res.render('users/signup', {
    title: 'Create Account'
  });
});

router.get('/login', function(req, res) {
  res.render('users/login', {
    title: 'Login'
  });
});

module.exports = router;

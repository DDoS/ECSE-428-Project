var express = require('express');
var router = express.Router();
var database = require('././data/db');

router.get('/create', function(req, res) {
    res.render('questions/create', {
        title: 'New Question'
    });
});

module.exports = router;


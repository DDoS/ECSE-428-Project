var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
    res.render('questions/create', {
        title: 'New Question'
    });
});



router.post('');
module.exports = router;


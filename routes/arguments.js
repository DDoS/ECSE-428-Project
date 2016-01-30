var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
    res.render('arguments/create', {
        title: 'Create Argument'
    });
});


module.exports = router;


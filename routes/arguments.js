var express = require('express');
var router = express.Router();

router.get('/edit', function(req, res) {
    var database = req.app.get('db');
    console.log(req.query.q);
    console.log(req.query.a);

    database.getArgument(req.query.q, req.query.a, function(argument) {
        console.log(argument);
        res.render('arguments/edit', {
            title: 'Edit Argument',
            questionID: req.query.q,
            argument: argument
        });
    });
});

module.exports = router;
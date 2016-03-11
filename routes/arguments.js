var express = require('express');
var router = express.Router();

router.get('/edit', function(req, res) {
    var database = req.app.get('db');

    database.getArgument(req.query.q, req.query.a, function(argument) {
        res.render('arguments/edit', {
            title: 'Edit Argument',
            questionID: req.query.q,
            argument: argument
        });
    });
});

router.post('/edit', function(req, res) {
    var database = req.app.get('db');

    database.getArgument(req.query.q, req.query.a, function(argument) {
        if (req.user === undefined || req.user.username !== argument.submitter) { //make sure user can only edit their own arguments
            req.flash('errors', {
                msg: "You cannot edit other people's arguments."
            });
            return res.redirect(req.get('referer'));
        }

        if (req.body.action === 'delete') {
            database.deleteArgument(req.query.q, req.query.a, function() {
                req.flash('success', {
                    msg: 'Argument deleted.'
                });
                res.redirect('/questions/view?q=' + req.query.q);
            });
        } else { //edit
            database.editArgument(req.query.q, req.query.a, req.body.argument, function() {
                req.flash('success', {
                    msg: 'Argument edited.'
                });
                res.redirect('/questions/view?q=' + req.query.q);
            });
        }
    });
});

module.exports = router;
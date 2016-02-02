var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
    res.render('questions/create', {
        title: 'New Question'
    });
});


router.post('/create', function(req, res){
    if (req.user === undefined) {
        req.flash('errors', { msg: 'Please login before posting new question.' });
        return res.redirect('/users/login');

    }else{
        req.assert('title', 'Title is empty.').notEmpty();
        req.assert('text', 'Description is empty.').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/questions/create');
        }else {
            req.app.get('db').createQuestion(req.body.title, req.body.text, req.user.username, function (question) {
                //console.log(question);
                req.flash('success', {msg: 'New question posted!'});
                res.redirect('/');
            });
        }
    }

});

router.get('/find', function(req, res) {
    res.render('questions/find', {
        title: 'View Questions'
    });
});

router.post('/find', function(req, res){
    if (req.body.number == "") {
        req.flash('errors', { msg: 'Please enter a valid number.' });
        return res.redirect('/questions/find');
    }else {
        req.app.get('db').getNewQuestions(undefined, req.body.number, function (questions) {
            console.log(questions);
            res.render('questions/find', {
                "questions": questions
            });
        });
    }
});


module.exports = router;

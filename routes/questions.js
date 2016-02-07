var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
    res.render('questions/create', {
        title: 'New Question'
    });
});


router.post('/create', function(req, res) {
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

    var page;

    if(req.query.page)
        page = req.query.page - 1;
    else
       page = 0;


    req.app.get('db').getNewQuestions(undefined,undefined, page * 10, function (questions) {
        console.log(questions);
        res.render('questions/find', {
            title: 'View Questions',
            questions: questions,
            currPage: page + 1,
            hasNextPage: questions.length == 10

        });
    });
});

router.post('/pa', function(req, res) {
    if (req.user === undefined) {
        req.flash('errors', { msg: 'Please login before posting new argument.' });
        return res.redirect('/users/login');

    }else {
        if (req.body.argument == "") {
            req.flash('errors', { msg: 'Argument is empty.' });
            return res.redirect(req.get('referer'));

        }else {
            var argType = (req.body.post_arg === 'pro');

            req.app.get('db').createArgument(req.query.q, argType, req.body.argument, req.user.username, function (argument) {
                console.log(argument);
                argType ? req.flash('success', {msg: 'New agree argument posted!'}) : req.flash('success', {msg: 'New disagree argument posted!'});
                res.redirect(req.get('referer'));

            });
        }
    }
});

router.get('/view', function(req, res) {
    req.app.get('db').getQuestion(req.query.q, function (question) {
        req.app.get('db').getNewArguments(question.id, true, undefined, undefined, undefined, function (proArgs) {
            req.app.get('db').getNewArguments(question.id, false, undefined, undefined, undefined, function (conArgs) {

                var allArgs = proArgs.concat(conArgs);
                allArgs.sort(function(a,b) {
                    return new Date(b.date) - new Date(a.date);
                });

                res.render('questions/view', {
                    arguments: allArgs,
                    title: 'View An Question',
                    question: question
                });
            });

        });
    });
});


module.exports = router;

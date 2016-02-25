var async = require('async');

var db = require('../data/db');

var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
    res.render('questions/create', {
        title: 'Create New Question'
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
    var dbInst = req.app.get('db');

    var page;
    if (req.query.page) {
        page = req.query.page - 1;
    } else {
        page = 0;
    }

    dbInst.getNewQuestions(undefined, undefined, page * 10, function(questions) {
        async.each(questions, function(question, callback) {
            dbInst.getQuestionVoteScore(question.id, function(questionVoteScore) {
                question.voteScore = questionVoteScore;
                if (req.user) {
                    dbInst.getQuestionVote(question.id, req.user.username, function(questionVote) {
                        question.upVoted = questionVote === db.VoteType.UP;
                        question.downVoted = questionVote === db.VoteType.DOWN;

                        callback();
                    });
                } else {
                    question.upVoted = false;
                    question.downVoted = false;

                    callback();
                }
            });
        }, function() {
            res.render('questions/find', {
                title: 'All Questions',
                questions: questions,
                currPage: page + 1,
                hasNextPage: questions.length == 10
            });
        });
    });
});

router.post('/search', function(req, res) {

    var filter = req.body.search;

    if (filter.length == 0){
        res.redirect('find');
    }
    else {
        res.render('questions/find', {
            title: 'Results for "'+filter+'"',
            filter: filter,
            questions: '',
            currPage: 1,
            hasNextPage: false
        });
    }
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
    function error() {
        req.flash('errors', {
            msg: 'Failed to load question. Please try again.'
        });
        res.redirect('/questions/find');
    }

    var dbInst = req.app.get('db');

    var page;
    if (req.query.page) {
        page = req.query.page - 1;
    } else {
        page = 0;
    }

    try {
        dbInst.getQuestion(req.query.q, function(question) {
            if (!question) {
                error();
                return;
            }

            dbInst.getQuestionVoteScore(question.id, function(questionVoteScore) {
                question.voteScore = questionVoteScore;

                dbInst.getNewArguments(question.id, undefined, undefined, undefined, page * 10, function(args) {
                    // Sort arguments into separate arrays for "for" and "against"
                    var argsFor = [];
                    var argsAgainst = [];
                    for (var i = 0; i < args.length; i++) {
                        if (args[i].type === db.ArgumentType.PRO) {
                            argsFor.push(args[i]);
                        } else {
                            argsAgainst.push(args[i]);
                        }
                    }

                    async.each(args, function(argument, callback) {
                        dbInst.getArgumentVoteScore(question.id, argument.id, function(argumentVoteScore) {
                            argument.voteScore = argumentVoteScore;
                            callback();
                        });
                    }, function() {
                        if (req.user) {
                            dbInst.getQuestionVote(question.id, req.user.username, function(questionVote) {
                                question.upVoted = questionVote === db.VoteType.UP;
                                question.downVoted = questionVote === db.VoteType.DOWN;

                                async.each(args, function(argument, callback) {
                                    dbInst.getArgumentVote(question.id, argument.id, req.user.username, function(argumentVote) {
                                        argument.upVoted = argumentVote === db.VoteType.UP;
                                        argument.downVoted = argumentVote === db.VoteType.DOWN;
                                        callback();
                                    });
                                }, function() {
                                    render();
                                });
                            });
                        } else {
                            question.upVoted = false;
                            question.downVoted = false;

                            for (var i = 0; i < args.length; i++) {
                                args[i].upVoted = false;
                                args[i].downVoted = false;
                            }

                            render();
                        }
                    });

                    function render() {
                        res.render('questions/view', {
                            title: "Question: " + question.title,
                            question: question,
                            argsFor: argsFor,
                            argsAgainst: argsAgainst,
                            currArgs: page + 1,
                            hasNextArgs: argsFor.length == 10 || argsAgainst.length == 10
                        });
                    }
                });
            });
        });
    } catch (err) {
        error();
    }
});

router.post('/vote', function(req, res) {
    if (!req.query.q) {
        req.flash('errors', {
            msg: 'No question ID specified. Please try voting again.'
        });
        res.redirect(req.get('referer'));
        return;
    } else if (!req.user) {
        req.flash('errors', {
            msg: 'Please login before voting on a question or argument.'
        });
        res.redirect('/users/login');
        return;
    } else if (req.body.vote !== "up" && req.body.vote !== "down" && req.body.vote !== "none") {
        req.flash('errors', {
            msg: 'No vote specified. Please try voting again.'
        });
        res.redirect(req.get('referer'));
        return;
    }

    var dbInst = req.app.get('db');
    try {
        function upVote() {
            req.flash('success', {
                msg: 'Upvote recorded!'
            });
            res.redirect(req.get('referer'));
        }

        function downVote() {
            req.flash('success', {
                msg: 'Downvote recorded!'
            });
            res.redirect(req.get('referer'));
        }

        function noVote() {
            req.flash('success', {
                msg: 'Vote removal recorded!'
            });
            res.redirect(req.get('referer'));
        }

        if (req.query.a) {
            if (req.body.vote === "up") {
                dbInst.setArgumentVote(req.query.q, req.query.a,
                                       req.user.username, db.VoteType.UP,
                                       upVote);
            } else if (req.body.vote === "down") {
                dbInst.setArgumentVote(req.query.q, req.query.a,
                                       req.user.username, db.VoteType.DOWN,
                                       downVote);
            } else {
                dbInst.setArgumentVote(req.query.q, req.query.a,
                                       req.user.username, db.VoteType.NONE,
                                       noVote);
            }
        } else {
            if (req.body.vote === "up") {
                dbInst.setQuestionVote(req.query.q, req.user.username,
                                       db.VoteType.UP, upVote);
            } else if (req.body.vote === "down") {
                dbInst.setQuestionVote(req.query.q, req.user.username,
                                       db.VoteType.DOWN, downVote);
            } else {
                dbInst.setQuestionVote(req.query.q, req.user.username,
                                       db.VoteType.NONE, noVote);
            }
        }
    } catch (err) {
        req.flash('errors', {
            msg: 'Error recording vote. Please try voting again.'
        });
        res.redirect(req.get('referer'));
    }
});

module.exports = router;

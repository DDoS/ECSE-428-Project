var async = require('async');

var db = require('../data/db');

var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
    res.render('questions/create', {
        title: 'Create New Question'
    });
});

router.post('/create', isAuthenticated, function(req, res) {
    var database = req.app.get('db');

    req.assert('question', 'Question field is empty.').notEmpty();
    req.assert('details', 'Details field is empty.').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('create');
    }

    database.createQuestion(req.body.question, req.body.details,
        req.user.username, function(question) {
            req.flash('success', {msg: 'New question created.'});
            res.redirect('view?q=' + question.id);
        });
});

router.get('/find', function(req, res) {
    var database = req.app.get('db');

    var page;
    if (req.query.page) {
        page = req.query.page - 1;
    } else {
        page = 0;
    }

    database.getNewQuestions(undefined, undefined, page * 10, function(questions) {
        getQuestionVoteScores(req, questions, database, function() {
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

    // TODO: Implement database access for search
    if (filter.length === 0) {
        res.redirect('find');
    } else {
        res.render('questions/find', {
            title: 'Results for "' + filter + '"',
            filter: filter,
            questions: '',
            currPage: 1,
            hasNextPage: false
        });
    }
});

router.post('/pa', isAuthenticated, function(req, res) {
    var database = req.app.get('db');

    req.assert('argument', 'Argument field is empty.').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect(req.get('referer'));
    }

    var proArg = (req.body.post_arg === 'pro');
    try {
        database.createArgument(req.query.q, proArg, req.body.argument,
            req.user.username, function (argument) {
            if (!argument) {
                error();
                return;
            }

            if (proArg) {
                req.flash('success', {msg: 'Argument in favour posted.'});
            } else {
                req.flash('success', {msg: 'Argument against posted.'});
            }
            res.redirect(req.get('referer'));
        });
    } catch (err) {
        error();
    }

    function error() {
        req.flash('errors', {
            msg: 'Failed to create argument. Please try again.'
        });
        res.redirect(req.get('referer'));
    }
});

router.get('/view', function(req, res) {
    var database = req.app.get('db');

    var page;
    if (req.query.page) {
        page = req.query.page - 1;
    } else {
        page = 0;
    }

    try {
        database.getQuestion(req.query.q, function(question) {
            if (!question) {
                error();
                return;
            }

            getQuestionVoteScores(req, [question], database, function() {
                getArguments(question, function(argsFor, argsAgainst, args) {
                    getArgumentVoteScores(question, args, function() {
                        getQuestionArgumentVoteStatuses(question, args, function() {
                            res.render('questions/view', {
                                title: "Question: " + question.title,
                                question: question,
                                argsFor: argsFor,
                                argsAgainst: argsAgainst,
                                currArgs: page + 1,
                                hasNextArgs: argsFor.length == 10 ||
                                             argsAgainst.length == 10
                            });
                        })
                    });
                })
            });
        });
    } catch (err) {
        error();
    }

    function getArguments(question, done) {
        database.getNewArguments(question.id, db.ArgumentType.PRO, undefined,
            undefined, page * 10, function(argsFor) {
                database.getNewArguments(question.id, db.ArgumentType.CON,
                    undefined, undefined, page * 10, function(argsAgainst) {
                        var args = argsFor.concat(argsAgainst);
                        done(argsFor, argsAgainst, args);
                });
        });
    }

    function getArgumentVoteScores(question, args, done) {
        async.each(args, function(argument, done) {
            database.getArgumentVoteScore(question.id, argument.id,
                function(argumentVoteScore) {
                    argument.voteScore = argumentVoteScore;
                    done();
                });
        }, done);
    }

    function getQuestionArgumentVoteStatuses(question, args, done) {
        if (req.user) {
            database.getQuestionVote(question.id, req.user.username,
                function(questionVote) {
                    question.upVoted = questionVote === db.VoteType.UP;
                    question.downVoted = questionVote === db.VoteType.DOWN;

                    async.each(args, function(argument, done) {
                        database.getArgumentVote(question.id, argument.id,
                            req.user.username, function(argumentVote) {
                                argument.upVoted = argumentVote ===
                                    db.VoteType.UP;
                                argument.downVoted = argumentVote ===
                                    db.VoteType.DOWN;
                                done();
                            });
                    }, function() {
                        done();
                    });
                });
        } else {
            question.upVoted = false;
            question.downVoted = false;

            for (var i = 0; i < args.length; i++) {
                args[i].upVoted = false;
                args[i].downVoted = false;
            }

            done();
        }
    }

    function error() {
        req.flash('errors', {
            msg: 'Failed to load question. Please try again.'
        });
        res.redirect('/questions/find');
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

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('errors', {msg: 'Please login before performing that action.'});
    res.redirect('/users/login');
}

function getQuestionVoteScores(req, questions, database, done) {
    async.each(questions, function(question, done) {
        database.getQuestionVoteScore(question.id, function(questionVoteScore) {
            question.voteScore = questionVoteScore;
            if (req.isAuthenticated()) {
                database.getQuestionVote(question.id, req.user.username, function(questionVote) {
                    question.upVoted = questionVote === db.VoteType.UP;
                    question.downVoted = questionVote === db.VoteType.DOWN;

                    done();
                });
            } else {
                question.upVoted = false;
                question.downVoted = false;

                done();
            }
        });
    }, done);
}

module.exports = router;

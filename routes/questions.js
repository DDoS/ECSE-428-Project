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

    // Client input validation
    req.assert('question', 'Question field is empty.').notEmpty();
    req.assert('details', 'Details field is empty.').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('create');
    }

    // Create new question in database, inform user that question creation
    // was successful, then redirect user to the new question
    createQuestion(function(question) {
        req.flash('success', {
            msg: 'New question created.'
        });
        res.redirect('view?q=' + question.id);
    // On database error, redirect back to question creation page
    }, function() {
        req.flash('errors', {
            msg: 'Failed to create argument. Please try again.'
        });
        res.redirect('create');
    });

    function createQuestion(done, error) {
        try {
            database.createQuestion(req.body.question, req.body.details,
                req.user.username,
                function(question) {
                    if (!question) {
                        return error();
                    }
                    done(question);
                });
        } catch (err) {
            error();
        }
    }
});

router.get('/find', function(req, res) {
    var database = req.app.get('db');

    // Pagination
    var page = req.query.page ? req.query.page - 1 : 0;

    // Retrieve latest questions from database and display them
    getNewQuestions(function(questions) {
        res.render('questions/find', {
            title: 'All Questions',
            questions: questions,
            currPage: page + 1,
            hasNextPage: questions.length == 10
        });
    // On database error, redirect back to home page
    }, function() {
        req.flash('errors', {
            msg: 'Failed to show questions. Please try again.'
        });
        res.redirect('/');
    });

    function getNewQuestions(done, error) {
        try {
            database.getNewQuestions(undefined, undefined, page * 10,
                function(questions) {
                    async.each(questions, function(question, done) {
                        getQuestionVoteScoreAndStatus(req, database, question,
                            done,
                            function() {
                                throw new Error();
                            });
                    }, function(err) {
                        if (!err) {
                            done(questions);
                        } else {
                            error();
                        }
                    });
            });
        } catch (err) {
            error();
        }
    }
});

router.get('/search', function(req, res) {

    // Client input validation
    req.assert('search', 'Search field is empty.').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('find');
    }
    // Search is not empty
    else {
        var searchString = req.body.search;
        var keywords = searchString.split(" ");
        
        var database = req.app.get('db');

        // Pagination
        var page = req.query.page ? req.query.page - 1 : 0;

        // Retrieve questions mathching keyword from database and display them
        getQuestionsByKeywords(function(questions) {
            res.render('questions/find', {
                title: 'Results for "' + searchString + '"',
                searchString: searchString,
                questions: questions,
                currPage: page + 1,
                hasNextPage: questions.length == 10
            });
        // On database error, redirect back to home page
        }, function() {
            req.flash('errors', {
                msg: 'Failed to show search results. Please try again.'
            });
            res.redirect('/questions/find');
        });

        function getQuestionsByKeywords(done, error) {
            try {
                database.getQuestionsByKeywords(undefined, undefined, page * 10, keywords,
                    function(questions) {
                        async.each(questions, function(question, done) {
                            getQuestionVoteScoreAndStatus(req, database, question,
                                done,
                                function() {
                                    throw new Error();
                                });
                        }, function(err) {
                            if (!err) {
                                done(questions);
                            } else {
                                error();
                            }
                        });
                });
            } catch (err) {
                error();
            }
        }
    }
});

router.post('/search', function(req, res) {

    // Client input validation
    req.assert('search', 'Search field is empty.').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('find');
    }
    // Search is not empty
    else {
        var searchString = req.body.search;
        var keywords = searchString.split(" ");
        
        var database = req.app.get('db');

        // Pagination
        var page = req.query.page ? req.query.page - 1 : 0;

        // Retrieve questions mathching keyword from database and display them
        getQuestionsByKeywords(function(questions) {
            res.render('questions/find', {
                title: 'Results for "' + searchString + '"',
                searchString: searchString,
                questions: questions,
                currPage: page + 1,
                hasNextPage: questions.length == 10
            });
        // On database error, redirect back to home page
        }, function() {
            req.flash('errors', {
                msg: 'Failed to show search results. Please try again.'
            });
            res.redirect('/questions/find');
        });

        function getQuestionsByKeywords(done, error) {
            try {
                database.getQuestionsByKeywords(undefined, undefined, page * 10, keywords,
                    function(questions) {
                        async.each(questions, function(question, done) {
                            getQuestionVoteScoreAndStatus(req, database, question,
                                done,
                                function() {
                                    throw new Error();
                                });
                        }, function(err) {
                            if (!err) {
                                done(questions);
                            } else {
                                error();
                            }
                        });
                });
            } catch (err) {
                error();
            }
        }
    }
});

router.post('/pa', isAuthenticated, function(req, res) {
    var database = req.app.get('db');

    // Client input validation
    req.assert('argument', 'Argument field is empty.').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect(req.get('referer'));
    }

    // Create new argument in database, inform user that argument creation
    // was successful, then redirect user to the new argument on the relevant
    // question page
    createArgument(function(type) {
        if (type === db.ArgumentType.PRO) {
            req.flash('success', {msg: 'Argument in favour posted.'});
        } else {
            req.flash('success', {msg: 'Argument against posted.'});
        }
        res.redirect(req.get('referer'));
    // On database error, redirect back to referrer
    }, function() {
        req.flash('errors', {
            msg: 'Failed to create argument. Please try again.'
        });
        res.redirect(req.get('referer'));
    });

    function createArgument(done, error) {
        var type;
        if (req.body.type === 'pro') {
            type = db.ArgumentType.PRO;
        } else if (req.body.type === 'con') {
            type = db.ArgumentType.CON;
        } else {
            return error();
        }

        try {
            database.createArgument(req.query.q, type, req.body.argument,
                req.user.username,
                function() {
                    done(type);
                });
        } catch (err) {
            error();
        }
    }
});

router.get('/view', function(req, res) {
    var database = req.app.get('db');

    if (req.query.search === '') {
        req.query.search = undefined;
    }

    // Pagination
    var page = req.query.page ? req.query.page - 1 : 0;

    // Get specified question and display to user
    getQuestion(function(question, argsFor, argsAgainst) {
        res.render('questions/view', {
            title: "Question: " + question.title,
            question: question,
            argsFor: argsFor,
            argsAgainst: argsAgainst,
            currArgs: page + 1,
            hasNextArgs: argsFor.length == 10 || argsAgainst.length == 10,
            searchQuery: req.query.search
        });
    // On database error, redirect to find page
    }, function() {
        req.flash('errors', {
            msg: 'Failed to load question. Please try again.'
        });
        res.redirect('/questions/find');
    });

    function getQuestion(done, error) {
        try {
            database.getQuestion(req.query.q, function(question) {
                getQuestionVoteScoreAndStatus(req, database, question,
                    function() {
                        getArguments(question, function(argsFor, argsAgainst) {
                            done(question, argsFor, argsAgainst);
                        })
                    }, error);
            });
        } catch(err) {
            error();
        }
    }

    function getArguments(question, done) {
        database.getNewArguments(question.id, db.ArgumentType.PRO, undefined, undefined, page * 10, req.query.search, function (argsFor) {
            database.getNewArguments(question.id, db.ArgumentType.CON, undefined, undefined, page * 10, req.query.search, function (argsAgainst) {
                var arguments = argsFor.concat(argsAgainst);
                async.each(arguments,
                    function (argument, done) {
                        getArgumentVoteScoreAndStatus(question, argument,
                            done,
                            function () {
                                throw new Error();
                            });
                    }, function (err) {
                        if (!err) {
                            done(argsFor, argsAgainst);
                        } else {
                            error();
                        }
                    });
            });
        });
    }

    function getArgumentVoteScoreAndStatus(question, argument, done, error) {
        try {
            database.getArgumentVoteScore(question.id, argument.id,
                function (argumentVoteScore) {
                    argument.voteScore = argumentVoteScore;
                    getArgumentUserVoteStatus(question, argument, done, error);
                });
        } catch(err) {
            error();
        }
    }

    function getArgumentUserVoteStatus(question, argument, done, error) {
        try {
            if (req.isAuthenticated()) {
                database.getArgumentVote(question.id, argument.id,
                    req.user.username, function(argumentVote) {
                        argument.upVoted = argumentVote ===
                            db.VoteType.UP;
                        argument.downVoted = argumentVote ===
                            db.VoteType.DOWN;
                        done();
                    });
            } else {
                argument.upVoted = false;
                argument.downVoted = false;
                done();
            }
        } catch(err) {
            error();
        }
    }
});

router.post('/vote', isAuthenticated, function(req, res) {
    var database = req.app.get('db');

    // Upvote, downvote or novote question or argument, as requested
    if (req.query.a) {
        argumentVote(upVote, downVote, noVote, error);
    } else {
        questionVote(upVote, downVote, noVote, error);
    }

    function argumentVote(upVote, downVote, noVote, error) {
        try {
            if (req.body.vote === "up") {
                database.setArgumentVote(req.query.q, req.query.a,
                    req.user.username, db.VoteType.UP, upVote);
            } else if (req.body.vote === "down") {
                database.setArgumentVote(req.query.q, req.query.a,
                    req.user.username, db.VoteType.DOWN, downVote);
            } else {
                database.setArgumentVote(req.query.q, req.query.a,
                    req.user.username, db.VoteType.NONE, noVote);
            }
        } catch (err) {
            error();
        }
    }

    function questionVote(upVote, downVote, noVote, error) {
        try {
            if (req.body.vote === "up") {
                database.setQuestionVote(req.query.q, req.user.username,
                    db.VoteType.UP, upVote);
            } else if (req.body.vote === "down") {
                database.setQuestionVote(req.query.q, req.user.username,
                    db.VoteType.DOWN, downVote);
            } else {
                database.setQuestionVote(req.query.q, req.user.username,
                    db.VoteType.NONE, noVote);
            }
        } catch (err) {
            error();
        }
    }

    function upVote() {
        req.flash('success', {
            msg: 'Upvote recorded.'
        });
        res.redirect(req.get('referer'));
    }

    function downVote() {
        req.flash('success', {
            msg: 'Downvote recorded.'
        });
        res.redirect(req.get('referer'));
    }

    function noVote() {
        req.flash('success', {
            msg: 'Vote removal recorded.'
        });
        res.redirect(req.get('referer'));
    }

    // On database error, redirect to referrer
    function error() {
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

function getQuestionVoteScoreAndStatus(req, database, question, done, error) {
    try {
        database.getQuestionVoteScore(question.id,
            function (questionVoteScore) {
                question.voteScore = questionVoteScore;
                getQuestionUserVoteStatus(req, database, question, done, error);
            });
    } catch(err) {
        error();
    }
}

function getQuestionUserVoteStatus(req, database, question, done, error) {
    try {
        if (req.isAuthenticated()) {
            database.getQuestionVote(question.id, req.user.username,
                function(questionVote) {
                    question.upVoted = questionVote === db.VoteType.UP;
                    question.downVoted = questionVote === db.VoteType.DOWN;

                    done();
                });
        } else {
            question.upVoted = false;
            question.downVoted = false;

            done();
        }
    } catch(err) {
        error();
    }
}

module.exports = router;

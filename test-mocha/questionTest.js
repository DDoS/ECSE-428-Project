var assert = require('assert');

var async = require('async');
var dotenv = require('dotenv');
var session = require('supertest-session');

var db = require("../data/db");

describe('/questions', function() {
    var app;
    var database;
    var server;
    var request;
    var qid;

    var username = "test";
    var password = "testpass123";
    var email = "test@test.com";

    before(function(done) {
        dotenv.load({path: __dirname + '/../.env'});
        process.env.NODE_ENV = 'test';

        app = require('../app');

        app.set('port', 8080);
        app.set('ipaddress', '127.0.0.1');

        app.get('initDb')(function() {
            server = app.listen(app.get('port'), app.get('ipaddress'), function() {
                database = app.get('db');
                request = session(server);
                done();
            });
        });
    });

    before(function(done) {
        app.get('db').createUser(username, password, email, function() {
            request.post('/users/login')
                .send({username: 'test', password: 'testpass123'})
                .end(function() {
                    done();
                });
        });
    });

    describe('/questions/create', function() {
        it('should show the "Create New Question" page', function(done) {
            request.get('/questions/create')
                .end(function(err, res) {
                    assert.ok(res.text.indexOf('Create New Question') !== -1,
                        'response should contain "Create New Question"');
                    done();
                });
        });

        it('should fail to create a question with no question', function(done) {
            request.post('/questions/create')
                .send({question: '', details: 'details'})
                .end(function(err, res) {
                    assert.equal(res.header.location, 'create',
                                 'redirect to "create" expected');
                    request.get('/questions/create').end(function(err, res) {
                        assert.ok(res.text.indexOf('Question field is empty.') !== -1,
                                  'response should contain "Question field is empty."');
                        done();
                    });
                });
        });

        it('should fail to create a question with no details', function(done) {
            request.post('/questions/create')
                .send({question: 'question', details: ''})
                .end(function(err, res) {
                    assert.equal(res.header.location, 'create',
                        'redirect to "create" expected');
                    request.get('/questions/create').end(function(err, res) {
                        assert.ok(res.text.indexOf('Details field is empty.') !== -1,
                            'response should contain "Details field is empty."');
                        done();
                    });
                });
        });

        it('should fail to create a question with neither question nor details', function(done) {
            request.post('/questions/create')
                .send({question: '', details: ''})
                .end(function(err, res) {
                    assert.equal(res.header.location, 'create',
                        'redirect to "create" expected');
                    request.get('/questions/create').end(function(err, res) {
                        assert.ok(res.text.indexOf('Question field is empty.') !== -1,
                            'response should contain "Question field is empty."');
                        assert.ok(res.text.indexOf('Details field is empty.') !== -1,
                            'response should contain "Details field is empty."');
                        done();
                    });
                });
        });

        it('should successfully create a question with question and details', function(done) {
            request.post('/questions/create')
                .send({question: 'question_test', details: 'details_test'})
                .end(function(err, res) {
                    var matches = res.header.location.match(/^view\?q=([0-9]+)$/);
                    assert.ok(matches !== null, 'redirect to "view?q={qid}" expected');
                    qid = matches[1];

                    dbValidation();

                    function dbValidation() {
                        database.getQuestion(qid, function(question) {
                            assert.equal(question.title, 'question_test');
                            assert.equal(question.text, 'details_test');
                            pageValidation();
                        });
                    }

                    function pageValidation() {
                        request.get('/questions/' + res.header.location)
                            .end(function(err, res) {
                                assert.ok(res.text.indexOf('question_test') !== -1,
                                    'response should contain "question_test"');
                                assert.ok(res.text.indexOf('details_test') !== -1,
                                    'response should contain "details_test"');
                                assert.ok(res.text.indexOf('Submitted by test') !== -1,
                                    'response should contain "Submitted by test"');
                                done();
                            });
                    }
                });
        });
    });

    describe('/questions/find', function() {
        it('should show the "All Questions" page', function(done) {
            request.get('/questions/find')
                .end(function(err, res) {
                    assert.ok(res.text.indexOf('question_test') !== -1,
                        'response should contain "question_test"');
                    assert.ok(res.text.indexOf('details_test') !== -1,
                        'response should contain "details_test"');
                    done();
                });
        });

        it('should display questions on the correct pages', function(done) {
            var questionData = [];
            for (var i = 1; i <= 30; i++) {
                questionData.push({
                    question: "question" + i,
                    details: "details" + i
                })
            }

            async.eachSeries(questionData, function(questionData, callback) {
                database.createQuestion(questionData.question, questionData.details, "test", function() {
                    callback();
                })
            }, function() {
                request.get('/questions/find?page=1')
                    .end(function(err, res) {
                        assert.ok(res.text.indexOf('question25') !== -1,
                            'response should contain "question25"');
                        request.get('/questions/find?page=2')
                            .end(function(err, res) {
                                assert.ok(res.text.indexOf('question15') !== -1,
                                    'response should contain "question15"');
                                request.get('/questions/find?page=3')
                                    .end(function(err, res) {
                                        assert.ok(res.text.indexOf('question5') !== -1,
                                            'response should contain "question5"');
                                        done();
                                    });
                            });
                    });
            });
        });
    });

    describe('/questions/pa', function() {
        it('should fail to post an argument with no text', function(done) {
            database.getQuestion(qid, function(question) {
                assert.ok(question, 'question with ID ' + qid + ' should exist');
                request.post('/questions/pa?q=' + qid)
                    .set('Referer', 'referer_test')
                    .send({'argument': '', type: 'pro'})
                    .end(function(err, res) {
                        assert.ok(res.header.location.indexOf('referer_test') !== -1,
                            'redirect to referer expected');
                        request.get('/questions/view?q=1').end(function(err, res) {
                            assert.ok(res.text.indexOf('Argument field is empty.') !== -1,
                                'response should contain "Argument field is empty."');
                            done();
                        });
                    });
            });
        });

        it('should successfully post an argument in favour', function(done) {
            database.getQuestion(qid, function(question) {
                assert.ok(question, 'question with ID ' + qid + ' should exist');
                request.post('/questions/pa?q=' + qid)
                    .set('Referer', 'referer_test')
                    .send({argument: 'test_argument_for', type: 'pro'})
                    .end(function(err, res) {
                        assert.ok(res.header.location.indexOf('referer_test') !== -1,
                            'redirect to referer expected');
                        request.get('/questions/view?q=1').end(function(err, res) {
                            assert.ok(res.text.indexOf('test_argument_for') !== -1,
                                'response should contain "test_argument_for"');
                            done();
                        });
                    });
            });
        });

        it('should successfully post an argument against', function(done) {
            database.getQuestion(qid, function(question) {
                assert.ok(question, 'question with ID ' + qid + ' should exist');
                request.post('/questions/pa?q=' + qid)
                    .set('Referer', 'referer_test')
                    .send({argument: 'test_argument_against', type: 'con'})
                    .end(function(err, res) {
                        assert.ok(res.header.location.indexOf('referer_test') !== -1,
                            'redirect to referer expected');
                        request.get('/questions/view?q=1').end(function(err, res) {
                            assert.ok(res.text.indexOf('test_argument_against') !== -1,
                                'response should contain "test_argument_against"');
                            done();
                        });
                    });
            });
        });
    });

    describe('/questions/view', function() {
        it('should successfully load a question with arguments', function(done) {
            database.getQuestion(qid, function(question) {
                assert.ok(question, 'question with ID ' + qid + ' should exist');
                request.get('/questions/view?q=' + qid)
                    .end(function(err, res) {
                        assert.ok(res.text.indexOf('question_test') !== -1,
                            'response should contain "question_test"');
                        assert.ok(res.text.indexOf('details_test') !== -1,
                            'response should contain "details_test"');
                        assert.ok(res.text.indexOf('Submitted by test') !== -1,
                            'response should contain "Submitted by test"');
                        assert.ok(res.text.indexOf('test_argument_for') !== -1,
                            'response should contain "test_argument_for"');
                        assert.ok(res.text.indexOf('test_argument_against') !== -1,
                            'response should contain "test_argument_for"');
                        done();
                    });
            });
        });

        it('should display arguments on the correct pages', function(done) {
            var argumentData = [];
            for (var i = 1; i <= 30; i++) {
                argumentData.push({
                    type: db.ArgumentType.PRO,
                    text: "for_argument" + i
                });
            }
            for (var i = 1; i <= 30; i++) {
                argumentData.push({
                    type: db.ArgumentType.CON,
                    text: "against_argument" + i
                });
            }
            database.getQuestion(qid, function(question) {
                assert.ok(question, 'question with ID ' + qid + ' should exist');
                async.eachSeries(argumentData, function(argumentData, callback) {
                    database.createArgument(qid, argumentData.type, argumentData.text, "test", function() {
                        callback();
                    })
                }, function() {
                    request.get('/questions/view?q=' + qid + '&page=1')
                        .end(function(err, res) {
                            assert.ok(res.text.indexOf('for_argument25') !== -1,
                                'response should contain "for_argument25"');
                            assert.ok(res.text.indexOf('against_argument25') !== -1,
                                'response should contain "against_argument25"');
                            request.get('/questions/view?q=' + qid + '&page=2')
                                .end(function(err, res) {
                                    assert.ok(res.text.indexOf('for_argument15') !== -1,
                                        'response should contain "for_argument15"');
                                    assert.ok(res.text.indexOf('against_argument15') !== -1,
                                        'response should contain "against_argument15"');
                                    request.get('/questions/view?q=' + qid + '&page=3')
                                        .end(function(err, res) {
                                            assert.ok(res.text.indexOf('for_argument5') !== -1,
                                                'response should contain "for_argument5"');
                                            assert.ok(res.text.indexOf('against_argument5') !== -1,
                                                'response should contain "against_argument5"');
                                            done();
                                        });
                                });
                        });
                });
            });
        });
    });

    describe('/questions/vote', function() {
        it('should successfully upvote a question', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('upvote question test question',
                        'upvote question test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to upvote the question
                    request.post('/questions/vote?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'up'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Upvote recorded.') !== -1,
                        'response should contain "Upvote recorded."');

                    database.getQuestionVoteScore(question.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 1
                    assert.equal(score, 1, 'vote score should equal 1');
                    done();
                }
            ], done);
        });

        it('should successfully downvote a question', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('downvote question test question',
                        'downvote question test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to downvote the question
                    request.post('/questions/vote?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'down'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Downvote recorded.') !== -1,
                        'response should contain "Downvote recorded."');

                    database.getQuestionVoteScore(question.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is -1
                    assert.equal(score, -1, 'vote score should equal -1');
                    done();
                }
            ], done);
        });

        it('should successfully novote an upvoted question', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'novote upvoted question test question',
                        'novote upvoted question test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Upvote the question
                    database.setQuestionVote(question.id, username,
                        db.VoteType.UP,
                        function() {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to novote the question
                    request.post('/questions/vote?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'none'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Vote removal recorded.') !== -1,
                        'response should contain "Vote removal recorded."');

                    database.getQuestionVoteScore(question.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 0
                    assert.equal(score, 0, 'vote score should equal 0');
                    done();
                }
            ], done);
        });

        it('should successfully novote a downvoted question', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'novote downvoted question test question',
                        'novote downvoted question test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Downvote the question
                    database.setQuestionVote(question.id, username,
                        db.VoteType.DOWN,
                        function() {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to novote the question
                    request.post('/questions/vote?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'none'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Vote removal recorded.') !== -1,
                        'response should contain "Vote removal recorded."');

                    database.getQuestionVoteScore(question.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 0
                    assert.equal(score, 0, 'vote score should equal 0');
                    done();
                }
            ], done);
        });

        it('should successfully upvote a downvoted question', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'upvote downvoted question test question',
                        'upvote downvoted question test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Downvote the question
                    database.setQuestionVote(question.id, username,
                        db.VoteType.DOWN,
                        function() {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to upvote the question
                    request.post('/questions/vote?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'up'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Upvote recorded.') !== -1,
                        'response should contain "Upvote recorded."');

                    database.getQuestionVoteScore(question.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 1
                    assert.equal(score, 1, 'vote score should equal 1');
                    done();
                }
            ], done);
        });

        it('should successfully downvote an upvoted question', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'downvote upvoted question test question',
                        'downvote upvoted question test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Upvote the question
                    database.setQuestionVote(question.id, username,
                        db.VoteType.UP,
                        function() {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to downvote the question
                    request.post('/questions/vote?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'down'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Downvote recorded.') !== -1,
                        'response should contain "Downvote recorded."');

                    database.getQuestionVoteScore(question.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is -1
                    assert.equal(score, -1, 'vote score should equal -1');
                    done();
                }
            ], done);
        });

        it('should successfully upvote an argument', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('upvote argument test question',
                        'upvote argument test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument
                    database.createArgument(question.id, db.ArgumentType.PRO,
                        'upvote argument test argument', username,
                        function(argument) {
                            done(undefined, question, argument);
                        })
                },
                function(question, argument, done) {
                    // Try to upvote the argument
                    request.post('/questions/vote?q=' + question.id + '&a=' +
                        argument.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'up'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res);
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res)
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Upvote recorded.') !== -1,
                        'response should contain "Upvote recorded."');

                    database.getArgumentVoteScore(question.id, argument.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 1
                    assert.equal(score, 1, 'vote score should equal 1');
                    done();
                }
            ], done);
        });

        it('should successfully downvote an argument', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('downvote argument test question',
                        'downvote argument test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument
                    database.createArgument(question.id, db.ArgumentType.PRO,
                        'downvote argument test argument', username,
                        function(argument) {
                            done(undefined, question, argument);
                        })
                },
                function(question, argument, done) {
                    // Try to upvote the argument
                    request.post('/questions/vote?q=' + question.id + '&a=' +
                            argument.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'down'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res);
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res)
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Downvote recorded.') !== -1,
                        'response should contain "Downvote recorded."');

                    database.getArgumentVoteScore(question.id, argument.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is -1
                    assert.equal(score, -1, 'vote score should equal -1');
                    done();
                }
            ], done);
        });

        it('should successfully novote an upvoted argument', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'novote upvoted argument test question',
                        'novote upvoted argument test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument
                    database.createArgument(question.id, db.ArgumentType.PRO,
                        'novote upvoted argument test argument', username,
                        function(argument) {
                            done(undefined, question, argument);
                        })
                },
                function(question, argument, done) {
                    // Upvote the argument
                    database.setArgumentVote(question.id, argument.id, username,
                        db.VoteType.UP,
                        function() {
                            done(undefined, question, argument);
                        }
                    );
                },
                function(question, argument, done) {
                    // Try to novote the argument
                    request.post('/questions/vote?q=' + question.id + '&a=' +
                            argument.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'none'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res);
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res)
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Vote removal recorded.') !== -1,
                        'response should contain "Vote removal recorded."');

                    database.getArgumentVoteScore(question.id, argument.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 0
                    assert.equal(score, 0, 'vote score should equal 0');
                    done();
                }
            ], done);
        });

        it('should successfully novote a downvoted argument', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('novote downvoted argument test question',
                        'novote downvoted argument test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument
                    database.createArgument(question.id, db.ArgumentType.PRO,
                        'novote downvoted argument test argument', username,
                        function(argument) {
                            done(undefined, question, argument);
                        })
                },
                function(question, argument, done) {
                    // Downvote the argument
                    database.setArgumentVote(question.id, argument.id, username,
                        db.VoteType.DOWN,
                        function() {
                            done(undefined, question, argument);
                        }
                    );
                },
                function(question, argument, done) {
                    // Try to novote the argument
                    request.post('/questions/vote?q=' + question.id + '&a=' +
                            argument.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'none'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res);
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res)
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Vote removal recorded.') !== -1,
                        'response should contain "Vote removal recorded."');

                    database.getArgumentVoteScore(question.id, argument.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 0
                    assert.equal(score, 0, 'vote score should equal 0');
                    done();
                }
            ], done);
        });

        it('should successfully upvote a downvoted argument', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'upvote downvoted argument test question',
                        'upvote downvoted argument test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument
                    database.createArgument(question.id, db.ArgumentType.PRO,
                        'upvote downvoted argument test argument', username,
                        function(argument) {
                            done(undefined, question, argument);
                        })
                },
                function(question, argument, done) {
                    // Downvote the argument
                    database.setArgumentVote(question.id, argument.id, username,
                        db.VoteType.DOWN,
                        function() {
                            done(undefined, question, argument);
                        }
                    );
                },
                function(question, argument, done) {
                    // Try to upvote the argument
                    request.post('/questions/vote?q=' + question.id + '&a=' +
                            argument.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'up'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res);
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res)
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Upvote recorded.') !== -1,
                        'response should contain "Upvote recorded."');

                    database.getArgumentVoteScore(question.id, argument.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is 1
                    assert.equal(score, 1, 'vote score should equal 1');
                    done();
                }
            ], done);
        });


        it('should successfully downvote an upvoted argument', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'downvote upvoted argument test question',
                        'downvote upvoted argument test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument
                    database.createArgument(question.id, db.ArgumentType.PRO,
                        'downvote upvoted argument test argument', username,
                        function(argument) {
                            done(undefined, question, argument);
                        })
                },
                function(question, argument, done) {
                    // Upvote the argument
                    database.setArgumentVote(question.id, argument.id, username,
                        db.VoteType.UP,
                        function() {
                            done(undefined, question, argument);
                        }
                    );
                },
                function(question, argument, done) {
                    // Try to downvote the argument
                    request.post('/questions/vote?q=' + question.id + '&a=' +
                            argument.id)
                        .set('Referer', 'referer_test')
                        .send({
                            vote: 'down'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res);
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the user was redirected to referrer
                    var location = res.header.location;
                    assert.ok(location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argument, err, res)
                        });
                },
                function(question, argument, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Downvote recorded.') !== -1,
                        'response should contain "Downvote recorded."');

                    database.getArgumentVoteScore(question.id, argument.id,
                        function(score) {
                            done(undefined, score);
                        }
                    );
                },
                function(score, done) {
                    // Verify that the score is -1
                    assert.equal(score, -1, 'vote score should equal -1');
                    done();
                }
            ], done);
        });
    });

    after(function(done) {
        app.get('db').clear(function() {
            server.close();
            done();
        });
    });
});
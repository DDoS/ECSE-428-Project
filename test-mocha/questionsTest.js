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

    // Test credentials used to create account
    var username = "test";
    var password = "testpass123";
    var email = "test@test.com";

    before(function(done) {
        // Load environment variables, include testing environment variables
        dotenv.load({path: __dirname + '/../.env'});
        process.env.NODE_ENV = 'test';

        // Initialize app
        app = require('../app');
        app.set('port', 8080);
        app.set('ipaddress', '127.0.0.1');

        async.series([
            function(done) {
                // Initialize database
                app.get('initDb')(done);
            },
            function(done) {
                // Launch app server
                server = app.listen(app.get('port'), app.get('ipaddress'),
                    done);
            },
            function(done) {
                // Create local variables for database and HTTP request object
                database = app.get('db');
                request = session(server);
                done();
            },
            function(done) {
                // Create test user
                database.createUser(username, password, email, function() {
                    done();
                });
            },
            function(done) {
                // Log into test user account
                request.post('/users/login')
                    .send({
                        username: 'test',
                        password: 'testpass123'
                    })
                    .end(function() {
                        done();
                    });
            }
        ], done);
    });

    /**
     * /questions/find
     */

    describe('/questions/find', function() {
        it('should successfully load the "All Questions" page', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('all questions test question',
                        'all questions test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Load find page
                    request.get('/questions/find')
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that all information is displayed
                    assert.ok(
                        res.text.indexOf(question.title) !== -1,
                        'response should contain "' + question.title + '"');
                    assert.ok(
                        res.text.indexOf(question.text) !== -1,
                        'response should contain "' + question.text + '"');
                    done();
                }
            ], done);
        });

        it('should display questions on the correct pages', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test questions in favour
                    var i = 1;
                    var questions = [];
                    async.whilst(function() {
                        return i <= 30;
                    }, function(done) {
                        database.createQuestion(
                            'view questions test question title ' + i,
                            'view questions test question text ' + i,
                            username,
                            function(question) {
                                questions.push(question);
                                i++;
                                done();
                            })
                    }, function() {
                        done(undefined, questions);
                    });
                },
                function(questions, done) {
                    // Get page 1
                    request.get('/questions/find?page=1')
                        .end(function(err, res) {
                            done(undefined, questions, err, res);
                        });
                },
                function(questions, err, res, done) {
                    // Verify that all appropriate questions are displayed on
                    // page 1
                    for (var i = 29; i >= 20; i--) {
                        assert.ok(
                            res.text.indexOf(questions[i].text) !== -1,
                            'response should contain "' +
                            questions[i].text + '"');
                    }
                    done(undefined, questions);
                },
                function(questions, done) {
                    // Get page 2
                    request.get('/questions/find?page=2')
                        .end(function(err, res) {
                            done(undefined, questions, err, res);
                        });
                },
                function(questions, err, res, done) {
                    // Verify that all appropriate questions are displayed on
                    // page 2
                    for (var i = 19; i >= 10; i--) {
                        assert.ok(
                            res.text.indexOf(questions[i].text) !== -1,
                            'response should contain "' +
                            questions[i].text + '"');
                    }
                    done(undefined, questions);
                },
                function(questions, done) {
                    // Get page 3
                    request.get('/questions/find?page=3')
                        .end(function(err, res) {
                            done(undefined, questions, err, res);
                        });
                },
                function(questions, err, res, done) {
                    // Verify that all appropriate questions are displayed on
                    // page 3
                    for (var i = 9; i >= 0; i--) {
                        assert.ok(
                            res.text.indexOf(questions[i].text) !== -1,
                            'response should contain "' +
                            questions[i].text + '"');
                    }
                    done(undefined, questions);
                }
            ], done);
        });
    });

    /**
     * /questions/create
     */

    describe('/questions/create', function() {
        it('should show the "Create New Question" page', function(done) {
            async.waterfall([
                function(done) {
                    // Try to load the page
                    request.get('/questions/create')
                        .end(function(err, res) {
                             done(undefined, err, res);
                        });
                },
                function(err, res, done) {
                    // Verify that the page contains "Create New Question"
                    assert.ok(res.text.indexOf('Create New Question') !== -1,
                        'response should contain "Create New Question"');
                    done();
                }
            ], done);
        });

        it('should fail to create a question with no question', function(done) {
            async.waterfall([
                function(done) {
                    // Try to post argument
                    request.post('/questions/create')
                        .send({
                            question: '',
                            details: 'details'
                        })
                        .end(function(err, res) {
                            done(undefined, err, res);
                        })
                },
                function(err, res, done) {
                    // Verify that user is redirected to "create"
                    assert.equal(res.header.location, 'create',
                        'redirect to "create" expected');

                    request.get('/questions/create')
                        .end(function(err, res) {
                            done(undefined, err, res);
                        });
                },
                function(err, res, done) {
                    // Verify that proper flash is shown
                    assert.ok(
                        res.text.indexOf('Question field is empty.') !== -1,
                        'response should contain "Question field is empty."');
                    done();
                }
            ], done);
        });

        it('should fail to create a question with no details', function(done) {
            async.waterfall([
                function(done) {
                    // Try to post argument
                    request.post('/questions/create')
                        .send({
                            question: 'question',
                            details: ''
                        })
                        .end(function(err, res) {
                            done(undefined, err, res);
                        })
                },
                function(err, res, done) {
                    // Verify that user is redirected to "create"
                    assert.equal(res.header.location, 'create',
                        'redirect to "create" expected');

                    request.get('/questions/create')
                        .end(function(err, res) {
                            done(undefined, err, res);
                        });
                },
                function(err, res, done) {
                    // Verify that proper flash is shown
                    assert.ok(
                        res.text.indexOf('Details field is empty.') !== -1,
                        'response should contain "Details field is empty."');
                    done();
                }
            ], done);
        });

        it('should fail to create a question with no question or details',
            function(done) {
                async.waterfall([
                    function(done) {
                        // Try to post question
                        request.post('/questions/create')
                            .send({
                                question: '',
                                details: ''
                            })
                            .end(function(err, res) {
                                done(undefined, err, res);
                            })
                    },
                    function(err, res, done) {
                        // Verify that user is redirected to "create"
                        assert.equal(res.header.location, 'create',
                            'redirect to "create" expected');

                        request.get('/questions/create')
                            .end(function(err, res) {
                                done(undefined, err, res);
                            });
                    },
                    function(err, res, done) {
                        // Verify that proper flash is shown
                        assert.ok(
                            res.text.indexOf('Question field is empty.') !== -1,
                            'response should contain "Question field is' +
                            ' empty."');
                        assert.ok(
                            res.text.indexOf('Details field is empty.') !== -1,
                            'response should contain "Details field is' +
                            ' empty."');
                        done();
                    }
                ], done);
            }
        );

        it('should successfully create a question with question and details', function(done) {
            async.waterfall([
                function(done) {
                    // Try to post question
                    var question = 'post question test question';
                    var details = 'post question test details';
                    request.post('/questions/create')
                        .send({
                            question: question,
                            details: details
                        })
                        .end(function(err, res) {
                            done(undefined, question, details, err, res);
                        })
                },
                function(question, details, err, res, done) {
                    // Verify that user is redirected to "view?q={qid}"
                    var matches = res.header.location.match(
                        /^view\?q=([0-9]+)$/);
                    assert.ok(matches !== null,
                        'redirect to "view?q={qid}" expected');

                    database.getQuestion(matches[1], function(questionObj) {
                        done(undefined, questionObj, question, details, res);
                    });
                },
                function(questionObj, question, details, res, done) {
                    // Database validation
                    assert.equal(questionObj.title, question);
                    assert.equal(questionObj.text, details);

                    request.get('/questions/' + res.header.location)
                        .end(function(err, res) {
                            done(undefined, question, details, err, res);
                        });
                },
                function(question, details, err, res, done) {
                    // Verify that proper information is shown
                    assert.ok(res.text.indexOf(question) !== -1,
                        'response should contain "' + question + '"');
                    assert.ok(res.text.indexOf(details) !== -1,
                        'response should contain "' + details + '"');
                    done();
                }
            ], done);
        });
    });

    /**
     * /questions/pa
     */

    describe('/questions/pa', function() {
        it('should fail to post an argument when logged out', function(done) {
            async.waterfall([
                function(done) {
                    // Log out
                    request.get('/users/logout')
                        .end(function() {
                            done();
                        });
                },
                function(done) {
                    // Initialize database with test question
                    database.createQuestion(
                        'fail post argument logged out test question',
                        'fail post argument logged out test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to post argument
                    request.post('/questions/pa?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            argument: 'fail post argument logged out test arg',
                            type: 'pro'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        })
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to /users/login
                    var location = res.header.location;
                    assert.ok(location.indexOf('/users/login') !== -1,
                        'redirect to /users/login expected');

                    request.get(location)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Please login before' +
                            ' performing that action.') !== -1,
                        'response should contain "Please login before' +
                        ' performing that action."');
                    done();
                }, function(done) {
                    // Log back in
                    request.post('/users/login')
                        .send({
                            username: 'test',
                            password: 'testpass123'
                        })
                        .end(function() {
                            done();
                        });
                }
            ], done)
        });

        it('should fail to post an argument with no text', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('fail post argument test question',
                        'fail post argument test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to post argument
                    request.post('/questions/pa?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            argument: '',
                            type: 'pro'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        })
                },
                function(question, err, res, done) {
                    // Verify that user is redirected to referrer
                    assert.ok(
                        res.header.location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res) {
                    // Verify that argument was created and proper flash is
                    // shown
                    assert.ok(
                        res.text.indexOf('Argument field is empty.') !== -1,
                        'response should contain "Argument field is empty."');
                    done();
                }
            ], done);
        });

        it('should successfully post an argument in favour', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('post argument pro test question',
                        'post argument pro test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to post argument
                    var argumentText = 'post argument pro test argument';
                    request.post('/questions/pa?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            argument: argumentText,
                            type: 'pro'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argumentText, err, res);
                        })
                },
                function(question, argumentText, err, res, done) {
                    // Verify that user is redirected to referrer
                    assert.ok(
                        res.header.location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');

                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argumentText, err, res);
                        });
                },
                function(question, argumentText, err, res) {
                    // Verify that argument was created and proper flash is
                    // shown
                    assert.ok(res.text.indexOf(argumentText) !== -1,
                        'response should contain "' + argumentText + '"');
                    assert.ok(
                        res.text.indexOf('Argument in favour posted.') !== -1,
                        'response should contain "Argument in favour posted."');
                    done();
                }
            ], done);
        });

        it('should successfully post an argument against', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('post argument con test question',
                        'post argument con test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to post argument
                    var argumentText = 'post argument con test argument';
                    request.post('/questions/pa?q=' + question.id)
                        .set('Referer', 'referer_test')
                        .send({
                            argument: argumentText,
                            type: 'con'
                        })
                        .end(function(err, res) {
                            done(undefined, question, argumentText, err, res);
                        })
                },
                function(question, argumentText, err, res, done) {
                    // Verify that user is redirected to referrer
                    assert.ok(
                        res.header.location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');
                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argumentText, err, res);
                        });
                },
                function(question, argumentText, err, res) {
                    // Verify that proper flash is shown
                    assert.ok(res.text.indexOf(argumentText) !== -1,
                        'response should contain "' + argumentText + '"');
                    assert.ok(
                        res.text.indexOf('Argument against posted.') !== -1,
                        'response should contain "Argument against posted."');
                    done();
                }
            ], done);
        });
    });

    /**
     * /questions/view
     */

    describe('/questions/view', function() {
        it('should successfully load a question with arguments', function(done) {
            this.timeout(5000);
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('view question test question',
                        'view question test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument in favour
                    database.createArgument(question.id, db.ArgumentType.PRO,
                        'view question test argument pro', username,
                        function(argumentFor) {
                            done(undefined, question, argumentFor);
                        })
                },
                function(question, argumentFor, done) {
                    // Initialize database with test argument against
                    database.createArgument(question.id, db.ArgumentType.CON,
                        'view question test argument con', username,
                        function(argumentAgainst) {
                            done(undefined, question, argumentFor,
                                argumentAgainst);
                        })
                },
                function(question, argumentFor, argumentAgainst, done) {
                    // Load question page
                    request.get('/questions/view?q=' + question.id)
                        .end(function(err, res) {
                            done(undefined, question, argumentFor,
                                argumentAgainst, err, res);
                        });
                },
                function(question, argumentFor, argumentAgainst, err, res,
                         done) {
                    // Verify that all information is displayed
                    assert.ok(
                        res.text.indexOf(question.title) !== -1,
                        'response should contain "' + question.title + '"');
                    assert.ok(
                        res.text.indexOf(question.text) !== -1,
                        'response should contain "' + question.text + '"');
                    assert.ok(
                        res.text.indexOf(argumentFor.text) !== -1,
                        'response should contain "' + argumentFor.text + '"');
                    assert.ok(
                        res.text.indexOf(argumentAgainst.text) !== -1,
                        'response should contain "' + argumentAgainst.text +
                        '"');
                    done();
                }
            ], done);
        });

        it('should display arguments on the correct pages', function(done) {
            async.waterfall([
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('view arguments test question',
                        'view arguments test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Initialize database with test argument in favour
                    var i = 1;
                    var argumentsFor = [];
                    async.whilst(function() {
                        return i <= 30;
                    }, function(done) {
                        database.createArgument(question.id,
                            db.ArgumentType.PRO,
                            'view arguments test argument pro ' + i, username,
                            function(argumentFor) {
                                argumentsFor.push(argumentFor);
                                i++;
                                done();
                            })
                    }, function() {
                       done(undefined, question, argumentsFor);
                    });
                },
                function(question, argumentsFor, done) {
                    // Initialize database with test argument against
                    var i = 1;
                    var argumentsAgainst = [];
                    async.whilst(function() {
                        return i <= 30;
                    }, function(done) {
                        database.createArgument(question.id,
                            db.ArgumentType.CON,
                            'view arguments test argument con ' + i, username,
                            function(argumentAgainst) {
                                argumentsAgainst.push(argumentAgainst);
                                i++;
                                done();
                            })
                    }, function() {
                        done(undefined, question, argumentsFor,
                            argumentsAgainst);
                    });
                },
                function(question, argumentsFor, argumentsAgainst, done) {
                    // Get page 1
                    request.get('/questions/view?q=' + question.id + "&page=1")
                        .end(function(err, res) {
                            done(undefined, question, argumentsFor,
                                argumentsAgainst, err, res);
                        });
                },
                function(question, argumentsFor, argumentsAgainst, err, res,
                         done) {
                    // Verify that all appropriate arguments are displayed on
                    // page 1
                    for (var i = 29; i >= 20; i--) {
                        assert.ok(
                            res.text.indexOf(argumentsFor[i].text) !== -1,
                            'response should contain "' +
                            argumentsFor[i].text + '"');
                        assert.ok(
                            res.text.indexOf(argumentsAgainst[i].text) !== -1,
                            'response should contain "' +
                            argumentsAgainst[i].text + '"');
                    }
                    done(undefined, question, argumentsFor, argumentsAgainst);
                },
                function(question, argumentsFor, argumentsAgainst, done) {
                    // Get page 2
                    request.get('/questions/view?q=' + question.id + "&page=2")
                        .end(function(err, res) {
                            done(undefined, question, argumentsFor,
                                argumentsAgainst, err, res);
                        });
                },
                function(question, argumentsFor, argumentsAgainst, err, res,
                         done) {
                    // Verify that all appropriate arguments are displayed on
                    // page 2
                    for (var i = 19; i >= 10; i--) {
                        assert.ok(
                            res.text.indexOf(argumentsFor[i].text) !== -1,
                            'response should contain "' +
                            argumentsFor[i].text + '"');
                        assert.ok(
                            res.text.indexOf(argumentsAgainst[i].text) !== -1,
                            'response should contain "' +
                            argumentsAgainst[i].text + '"');
                    }
                    done(undefined, question, argumentsFor, argumentsAgainst);
                },
                function(question, argumentsFor, argumentsAgainst, done) {
                    // Get page 3
                    request.get('/questions/view?q=' + question.id + "&page=3")
                        .end(function(err, res) {
                            done(undefined, question, argumentsFor,
                                argumentsAgainst, err, res);
                        });
                },
                function(question, argumentsFor, argumentsAgainst, err, res,
                         done) {
                    // Verify that all appropriate arguments are displayed on
                    // page 3
                    for (var i = 9; i >= 0; i--) {
                        assert.ok(
                            res.text.indexOf(argumentsFor[i].text) !== -1,
                            'response should contain "' +
                            argumentsFor[i].text + '"');
                        assert.ok(
                            res.text.indexOf(argumentsAgainst[i].text) !== -1,
                            'response should contain "' +
                            argumentsAgainst[i].text + '"');
                    }
                    done(undefined, question, argumentsFor, argumentsAgainst);
                }
            ], done);
        });
    });

    /**
     * /questions/vote
     */

    describe('/questions/vote', function() {
        it('should fail to vote when logged out', function(done) {
            async.waterfall([
                function(done) {
                    // Log out
                    request.get('/users/logout')
                        .end(function() {
                            done();
                        });
                },
                function(done) {
                    // Initialize database with test question
                    database.createQuestion('vote logged out test question',
                        'vote logged out test details', username,
                        function(question) {
                            done(undefined, question);
                        }
                    );
                },
                function(question, done) {
                    // Try to upvote the question
                    request.post('/questions/vote?q=' + question.id)
                        .send({
                            vote: 'up'
                        })
                        .end(function(err, res) {
                            done(undefined, question, err, res);
                        });
                },
                function(question, err, res, done) {
                    // Verify that the user was redirected to /users/login
                    var location = res.header.location;
                    assert.ok(location.indexOf('/users/login') !== -1,
                        'redirect to /users/login expected');

                    request.get(location)
                        .end(function(err, res) {
                            done(undefined, question, err, res)
                        });
                },
                function(question, err, res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Please login before' +
                            ' performing that action.') !== -1,
                        'response should contain "Please login before' +
                        ' performing that action."');
                    done();
                }, function(done) {
                    // Log back in
                    request.post('/users/login')
                        .send({
                            username: 'test',
                            password: 'testpass123'
                        })
                        .end(function() {
                            done();
                        });
                }
            ], done)
        });

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
                    database.createQuestion(
                        'novote downvoted argument test question',
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
        async.series([
            function(done) {
                // Empty test database
                database.clear(function() {
                    done();
                });
            },
            function(done) {
                // Shutdown server
                server.close();
                done();
            }
        ], done);
    });
});
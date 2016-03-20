var assert = require('assert');

var async = require('async');
var dotenv = require('dotenv');
var session = require('supertest-session');

var db = require("../data/db");

describe('/users', function() {
    var app;
    var database;
    var server;
    var request;

    // Test credentials used to create account before each test
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
                // Create local variable for database
                database = app.get('db');
                done();
            }
        ], done);
    });

    beforeEach(function(done) {
        async.series([
            function(done) {
                // Initialize database
                app.get('initDb')(done);
            },
            function(done) {
                // Create test user
                database.createUser(username, password, email, function() {
                    done();
                });
            },
            function(done) {
                // Create local variable for requests
                request = session(server);
                done();
            },
            function(done) {
                // Log into test user account
                request.post('/users/login')
                    .send({
                        username: username,
                        password: password
                    })
                    .end(function() {
                        done();
                    });
            }
        ], done);
    });

    describe('/users/account', function() {
        it('should fail to update account when logged out', function(done) {
            var newEmail = 'test2@test2.com';
            assert.ok(email !== newEmail);

            async.waterfall([
                function(done) {
                    // Log out
                    request.get('/users/logout')
                        .end(function() {
                            done();
                        });
                },
                function(done) {
                    // Try to change email while logged out
                    request.post('/users/account')
                        .send({
                            type: 'update',
                            email: newEmail
                        })
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify that the user was redirected to /users/login
                    assert.ok(res.header.location.indexOf(
                            '/users/login') !== -1,
                        'redirect to /users/login expected');
                    request.get(res.header.location)
                        .end(function(err, res) {
                            done(err, res)
                        });
                },
                function(res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(res.text.indexOf('Please login before' +
                            ' performing that action.') !== -1,
                        'response should contain "Please login before' +
                        ' performing that action."');
                    done();
                }
            ], done);
        });

        it('should successfully update email', function (done) {
            var newEmail = 'test2@test2.com';
            assert.ok(email !== newEmail);

            async.waterfall([
                function(done) {
                    // Try to update email
                    request.post('/users/account')
                        .set('Referer', 'referer_test')
                        .send({
                            type: 'update',
                            email: newEmail
                        })
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify that the user was redirected to referer
                    assert.ok(
                        res.header.location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');
                    request.get('/users/account')
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(
                        res.text.indexOf('Account information updated.') !== -1,
                        'response should contain "Account information' +
                        ' updated."');
                    database.getUser(username, function(user) {
                        done(undefined, user);
                    });
                },
                function(user, done) {
                    // Verify that the database was updated
                    assert.ok(user.email === newEmail);
                    done();
                }
            ], done);
        });

        it('should fail to update email with invalid email', function (done) {
            var newEmail = 'test2';

            async.waterfall([
                function(done) {
                    // Try to update email
                    request.post('/users/account')
                        .send({
                            type: 'update',
                            email: newEmail
                        })
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify that the user was redirected to /users/account
                    assert.ok(
                        res.header.location.indexOf('/users/account') !== -1,
                        'redirect to /users/account expected');
                    request.get(res.header.location)
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(
                        res.text.indexOf('Email is invalid.') !== -1,
                        'response should contain "Email is invalid."');
                    database.getUser(username, function(user) {
                        done(undefined, user);
                    });
                },
                function(user, done) {
                    // Verify that the database was not updated
                    assert.ok(user.email !== newEmail);
                    done();
                }
            ], done);
        });

        it('should successfully update password', function(done) {
            var newPassword = 'aaaaa';
            assert.ok(password !== newPassword);

            async.waterfall([
                function(done) {
                    // Try to update password
                    request.post('/users/account')
                        .set('Referer', 'referer_test')
                        .send({
                            type: 'update',
                            password: newPassword,
                            confirmPassword: newPassword
                        })
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify that the user was redirected to referer
                    assert.ok(
                        res.header.location.indexOf('referer_test') !== -1,
                        'redirect to referer expected');
                    request.get('/users/account')
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify that the next page the user visits contains the
                    // appropriate flash message
                    assert.ok(
                        res.text.indexOf('Account information updated.') !== -1,
                        'response should contain "Account information' +
                        ' updated."');
                    database.getUser(username, function(user) {
                        done(undefined, user);
                    });
                },
                function(user, done) {
                    // Verify that the database was updated
                    assert.ok(user.authenticate(newPassword));
                    done();
                }
            ], done);
        });

        it('should fail to update password with invalid password',
            function(done) {
                var newPassword = 'a';
                assert.ok(password !== newPassword);

                async.waterfall([
                    function(done) {
                        // Try to update password
                        request.post('/users/account')
                            .send({
                                type: 'update',
                                password: newPassword,
                                confirmPassword: newPassword
                            })
                            .end(function(err, res) {
                                done(err, res);
                            });
                    },
                    function(res, done) {
                        // Verify that the user was redirected to /users/account
                        assert.ok(res.header.location.indexOf(
                                '/users/account') !== -1,
                            'redirect to /users/account expected');
                        request.get(res.header.location)
                            .end(function(err, res) {
                                done(err, res);
                            });
                    },
                    function(res, done) {
                        // Verify that the next page the user visits contains
                        // the appropriate flash message
                        assert.ok(
                            res.text.indexOf('Password must be at least 4' +
                                ' characters in length.') !== -1,
                            'response should contain "Password must be at' +
                            ' least 4 characters in length."');
                        database.getUser(username, function(user) {
                            done(undefined, user);
                        });
                    },
                    function(user, done) {
                        // Verify that the database was not updated
                        assert.ok(!user.authenticate(newPassword));
                        done();
                    }
                ], done);
            }
        );

        it('should fail to update password with non-matching passwords',
            function(done) {
                var password = 'aaaaa';
                var confirmPassword = 'bbbbb';

                async.waterfall([
                    function(done) {
                        // Try to update password
                        request.post('/users/account')
                            .send({
                                type: 'update',
                                password: password,
                                confirmPassword: confirmPassword
                            })
                            .end(function(err, res) {
                                done(err, res);
                            });
                    },
                    function(res, done) {
                        // Verify that the user was redirected to /users/login
                        assert.ok(res.header.location.indexOf(
                                '/users/account') !== -1,
                            'redirect to /users/account expected');
                        request.get(res.header.location)
                            .end(function(err, res) {
                                done(err, res);
                            });
                    },
                    function(res, done) {
                        // Verify that the next page the user visits contains
                        // the appropriate flash message
                        assert.ok(
                            res.text.indexOf('Passwords do not match.') !== -1,
                            'response should contain "Passwords do not' +
                            ' match."');
                        database.getUser(username, function(user) {
                            done(undefined, user);
                        });
                    },
                    function(user, done) {
                        // Verify that the database was not updated
                        assert.ok(!user.authenticate(password));
                        assert.ok(!user.authenticate(confirmPassword));
                        done();
                    }
                ], done);
         }
        );

        it('should successfully delete an account', function(done) {
            async.waterfall([
                function(done) {
                    // Try to delete user
                    request.post('/users/account/')
                        .send({
                            type: 'delete'
                        })
                        .end(function(err, res) {
                            done(err, res);
                        });
                },
                function(res, done) {
                    // Verify user is redirected to home page
                    // and that no errors occurred
                    assert.ok(res.header.location.indexOf('/') !== -1,
                        'redirect to / expected');
                    database.getUser(username, function(user) {
                        done(undefined, user);
                    });
                },
                function(user, done) {
                    // Verify that the database was updated
                    assert.ok(user.deleted);
                    done();
                }
            ], done);
        });
    });

    afterEach(function(done) {
        // Empty test database
        database.clear(function() {
            done();
        });
    });

    after(function(done) {
        // Shutdown server
        server.close();
        done();
    });
});
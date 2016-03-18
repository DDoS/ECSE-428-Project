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
        // TODO 
        it('should successfully load the "Manage Account" page');

        it('should fail to load the "Manage Account" when logged out');

        it('should successfully update email');

        it('should successfully update password');

        it('should successfully delete an account', function(done) {
            async.waterfall([
                function(done) {
                    // try to delete user
                    request.post('/users/account/')
                        .send({
                            type: 'delete'
                        })
                        .end(function(err, res) {
                            done(undefined,err,res);
                        });
                },
                function(err, res, done) {
                    // verify user is redirected to home page
                    // and that no errors occurred
                    var location = res.header.location;
                    assert.ok(location === '/');
                    assert.ok(err === null);
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
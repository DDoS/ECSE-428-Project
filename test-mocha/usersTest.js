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
                        username: 'test',
                        password: 'testpass123'
                    })
                    .end(function() {
                        done();
                    });
            }
        ], done);
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
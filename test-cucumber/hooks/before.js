var WebdriverIO = require('webdriverio'),
    merge = require('deepmerge'),
    config = require('../support/configure');

var BeforeHook = module.exports = function (done) {

    // Launch test server
    var dotenv = require('dotenv');
    var db = require("../../data/db");
    var session = require('supertest-session');

    var app,
        database,
        server,
        request;

    // test account info
    var username = "test";
    var password = "testpass123";
    var email = "test@test.com";

    function loadTestServer(done) {
        dotenv.load({path: '.env'});
        process.env.NODE_ENV = 'test';

        app = require('../../app');

        app.set('port', 8080);
        app.set('ipaddress', '127.0.0.1');

        app.get('initDb')(function() {
            server = app.listen(app.get('port'), app.get('ipaddress'), function() {
                database = app.get('db');
                request = session(server);
                done();
            });
        });
    } 

    loadTestServer(function() {
        // Create test user after test server is up
        app.get('db').createUser(username, password, email, function() {
        });
    });

    // Configure selenium
    var options = config.options;
    options = merge(config.options, config.selenium || {});
    options.desiredCapabilities = config.capabilities;

    this.browser = WebdriverIO.remote(options);
    this.browser.init().call(done);
};

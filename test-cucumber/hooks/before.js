var async = require('async');
var dotenv = require('dotenv');

var db = require('../../data/db');

var WebdriverIO = require('webdriverio'),
    merge = require('deepmerge'),
    config = require('../support/configure');

BeforeHook = module.exports = function (done) {
    var that = this;

    var options = config.options;
    options = merge(config.options, config.selenium || {});
    options.desiredCapabilities = config.capabilities;

    this.browser = WebdriverIO.remote(options);
    this.browser.init().call(function() {
        serverStartup(that, done);
    });
};

function serverStartup(that, done) {
    // Load environment variables, include testing environment variables
    dotenv.load({path: __dirname + '/../../.env'});
    process.env.NODE_ENV = 'test';

    // Initialize app
    that.app = require('../../app');
    that.app.set('port', 8080);
    that.app.set('ipaddress', '127.0.0.1');

    async.series([
        function(done) {
            // Initialize database
            that.app.get('initDb')(done);
        },
        function(done) {
            // Launch app server
            that.server = that.app.listen(that.app.get('port'),
                that.app.get('ipaddress'), done);
        },
        function(done) {
            // Create environment variables for database
            that.database = that.app.get('db');

            // Create environment variables for questions and arguments
            that.questions = {};
            that.arguments = {};
            done();
        }
    ], done);
}

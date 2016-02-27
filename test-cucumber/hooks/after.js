var async = require('async');

var AfterHook = module.exports = function (done) {
    var that = this;
    this.browser.end(function() {
        serverShutdown(that, done);
    });
};

function serverShutdown(that, done) {
    async.series([
        function(done) {
            // Empty test database
            that.database.clear(function() {
                done();
            });
        },
        function(done) {
            // Shutdown server
            that.server.close();
            done();
        }
    ], done);
}

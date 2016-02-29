module.exports = function(done) {
    var that = this;
    this.database.clear(function() {
        that.database.initialize(function() {
            done();
        });
    });
};

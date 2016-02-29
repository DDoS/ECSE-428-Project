module.exports = function(username, password, email, done) {
    this.database.createUser(username, password, email, function() {
        done();
    });
};

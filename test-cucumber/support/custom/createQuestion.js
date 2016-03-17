module.exports = function(username, question, details, id, done) {
    var that = this;
    this.database.createQuestion(question, details, username, function(question) {
        that.questions[id] = question;
        done();
    });
};

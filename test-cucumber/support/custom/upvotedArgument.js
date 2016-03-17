var db = require("../../../data/db");

module.exports = function(username, questionId, id, done) {
    this.database.setArgumentVote(this.questions[questionId].id, this.arguments[id].id, username, db.VoteType.UP, function() {
        done();
    });
};

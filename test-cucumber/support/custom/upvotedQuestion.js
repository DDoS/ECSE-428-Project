var db = require("../../../data/db");

module.exports = function(username, id, done) {
    this.database.setQuestionVote(this.questions[id].id, username, db.VoteType.UP, function() {
        done();
    });
};

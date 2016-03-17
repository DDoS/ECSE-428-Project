var db = require("../../../data/db");

module.exports = function(username, questionId, text, id, done) {
    var that = this;
    this.database.createArgument(this.questions[questionId].id, db.ArgumentType.PRO, text, username, function(argument) {
        that.arguments[id] = argument;
        done();
    });
};

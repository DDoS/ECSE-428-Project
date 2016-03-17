module.exports = function(id, done) {
    var upvoteId = "#q" + this.questions[id].id + "_upvote";
    this.browser
        .click(upvoteId)
        .call(done);
};

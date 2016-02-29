module.exports = function(id, done) {
    var downvoteId = "#q" + this.questions[id].id + "_downvote";
    this.browser.click(downvoteId)
        .call(done);
};

module.exports = function(id, done) {
    var upvoteId = "#a" + this.arguments[id].id + "_upvote";
    this.browser.click(upvoteId)
        .call(done);
};

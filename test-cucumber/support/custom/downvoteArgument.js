module.exports = function(id, done) {
    var downvoteId = "#a" + this.arguments[id].id + "_downvote";
    this.browser.click(downvoteId)
        .call(done);
};

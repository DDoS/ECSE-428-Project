module.exports = function(id, falseCase, score, done) {
    var scoreId = "#a" + this.arguments[id].id + "_count";
    this.browser.getText(scoreId)
        .then(function (text) {
            if (falseCase) {
                score.should.not.equal(text);
            } else {
                score.should.equal(text);
            }
        })
        .call(done);
};

module.exports = function(falseCase, id, done) {
    var that = this;
    var questionsId = "#questions > div";
    this.browser
        .getAttribute(questionsId, 'id')
        .then(function (value) {
            if (falseCase) {
                value[0].should.not.equal('q' + that.questions[id].id);
            } else {
                value[0].should.equal('q' + that.questions[id].id);
            }
        })
        .call(done);
};

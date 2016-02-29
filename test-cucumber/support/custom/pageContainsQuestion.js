module.exports = function(falseCase, id, done) {
    var titleId = "#q" + this.questions[id].id + "_title";
    this.browser
        .elements(titleId)
        .then(function (elements) {
            if (falseCase) {
                expect(elements.value).to.have.length(0, 'expected element "' + elements + '" not to exist');
            } else {
                expect(elements.value).to.have.length.above(0, 'expected element "' + elements + '" to exist');
            }
        })
        .call(done);
};

module.exports = function(falseCase, id, done) {
    var textId = "#a" + this.arguments[id].id + "_text";
    this.browser
        .elements(textId)
        .then(function (elements) {
            if (falseCase) {
                expect(elements.value).to.have.length(0, 'expected element "' + elements + '" not to exist');
            } else {
                expect(elements.value).to.have.length.above(0, 'expected element "' + elements + '" to exist');
            }
        })
        .call(done);
};

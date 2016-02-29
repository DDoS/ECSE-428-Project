module.exports = function(falseCase, id, done) {
    var that = this;
    var argumentsId = "#argumentsFor > div";
    this.browser
        .getAttribute(argumentsId, 'id')
        .then(function (value) {
            if (falseCase) {
                value[0].should.not.equal('a' + that.arguments[id].id);
            } else {
                value[0].should.equal('a' + that.arguments[id].id);
            }
        })
        .call(done);
};

module.exports = function(id, done) {
    var that = this;
    this.browser
        .url()
        .then(function(result) {
            var value = "/questions/view?q=" + that.questions[id].id;
            result.value.should.contain(value, 'Expected URL (' + result.value + ') to contain "' + value + '"');
        })
        .call(done);
};

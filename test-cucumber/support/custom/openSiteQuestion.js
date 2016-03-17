module.exports = function(id, done) {
    this.browser
        .url(this.baseUrl + '/questions/view?q=' + this.questions[id].id)
        .call(done);
};
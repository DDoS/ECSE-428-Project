module.exports = function(id, questionId, done) {
    this.browser
        .url(this.baseUrl + '/arguments/edit?q=#' + this.questions[questionId].id + '&a=#' + this.arguments[id].id)
        .call(done);
};
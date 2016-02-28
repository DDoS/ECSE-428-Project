module.exports = function (type, page, done) {
    if (page === "$DEFAULT_TEST_QUESTION_VIEW_URL") {
        page = "/questions/view?q=" + this.question.id;
    }

    var url = (type === 'url') ? page : this.baseUrl + page;

    this.browser
        .url(url)
        .call(done);
};

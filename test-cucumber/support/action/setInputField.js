module.exports = function (method, text, element, done) {
    var command = (method === 'add') ? 'addValue' : 'setValue';
    if (text === "$DEFAULT_TEST_USERNAME") {
        text = this.username;
    } else if (text === "$DEFAULT_TEST_PASSWORD") {
        text = this.password;
    }

    this.browser[command](element, text)
        .call(done);
};

module.exports = function(username, password, done) {
    this.browser
        .url(this.baseUrl + '/users/login')
        .setValue('#usernameInput', username)
        .setValue('#passwordInput', password)
        .click('#loginButton')
        .call(done);
};

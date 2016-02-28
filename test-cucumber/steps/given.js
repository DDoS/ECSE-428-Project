/**
 * given steps
 */

var db = require("../../data/db");

module.exports = function () {
    this
        .given(/I open the (url|site) "$string"$/,
            require('../support/action/openWebsite'))

        .given(/^the element "$string" is( not)* visible$/,
            require('../support/check/isVisible'))

        .given(/^the element "$string" is( not)* enabled$/,
            require('../support/check/isEnabled'))

        .given(/^the element "$string" is( not)* selected$/,
            require('../support/check/checkSelected'))

        .given(/^the checkbox "$string" is( not)* checked$/,
            require('../support/check/checkSelected'))

        .given(/^there is (an|no) element "$string" on the page$/,
            require('../support/check/checkElementExists'))

        .given(/^the title is( not)* "$string"$/,
            require('../support/check/checkTitle'))

        .given(/^the element "$string" contains( not)* the same text as element "$string"$/,
            require('../support/check/compareText'))

        .given(/^the (element|inputfield) "$string" does( not)* contain the text "$string"$/,
            require('../support/check/checkContent'))

        .given(/^the (element|inputfield) "$string" does( not)* contain any text$/,
            require('../support/check/checkContent'))

        .given(/^the page url is( not)* "$string"$/,
            require('../support/check/checkURL'))

        .given(/^the( css)* attribute "$string" from element "$string" is( not)* "$string"$/,
            require('../support/check/checkProperty'))

        .given(/^the cookie "$string" contains( not)* the value "$string"$/,
            require('../support/check/checkCookieContent'))

        .given(/^the cookie "$string" does( not)* exist$/,
            require('../support/check/checkCookieExists'))

        .given(/^the element "$string" is( not)* ([\d]+)px (broad|tall)$/,
            require('../support/check/checkDimension'))

        .given(/^the element "$string" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
            require('../support/check/checkOffset'))

        .given(/^I have a screen that is ([\d]+) by ([\d]+) pixels$/,
            require('../support/action/resizeScreenSize'))

        .given(/^I have closed all but the first (window|tab)$/,
            require('../support/action/closeAllButFirstTab'))

        .given(/^a (alertbox|confirmbox|prompt) is( not)* opened$/,
            require('../support/check/checkModal'))

        .given(/^the database has been cleared$/, function(done) {
            var that = this;
            this.database.clear(function() {
                that.database.initialize(function() {
                    done();
                });
            });
        })

        .given(/^I have a registered user account with username "$string" and password "$string" and email "$string"$/,
            function(username, password, email, done) {
                this.database.createUser(username, password, email, function() {
                        done();
                    }
                );
        })

        .given(/^I am logged into the account with username "$string" and password "$string"$/, function(username, password, done) {
            this.browser
                .url(this.baseUrl + '/users/login')
                .setValue('#usernameInput', username)
                .setValue('#passwordInput', password)
                .click('#loginButton')
                .call(done);
        })

        .given(/^I have created a question with username "$string" and question "$string" and details "$string" and ID "$string"$/,
            function(username, question, details, id, done) {
                var that = this;
                this.database.createQuestion(question, details, username, function(question) {
                    that.questions[id] = question;
                    done();
                });
            }
        )

        .given(/^I have created an argument in favour with username "$string" and question ID "$string" and text "$string" and ID "$string"$/,
            function(username, questionId, text, id, done) {
                var that = this;
                this.database.createArgument(this.questions[questionId].id, db.ArgumentType.PRO, text, username, function(argument) {
                    that.arguments[id] = argument;
                    done();
                });
            }
        )

        .given(/^I have created an argument against with username "$string" and question ID "$string" and text "$string" and ID "$string"$/,
            function(username, questionId, text, id, done) {
                var that = this;
                this.database.createArgument(this.questions[questionId].id, db.ArgumentType.CON, text, username, function(argument) {
                    that.arguments[id] = argument;
                    done();
                });
            }
        )

        .given(/^I have downvoted the question with username "$string" and ID "$string"$/, function(username, id, done) {
            this.database.setQuestionVote(this.questions[id].id, username, db.VoteType.DOWN, function() {
                done();
            });
        })

        .given(/^I have upvoted the question with username "$string" and ID "$string"$/, function(username, id, done) {
            this.database.setQuestionVote(this.questions[id].id, username, db.VoteType.UP, function() {
                done();
            });
        })

        .given(/^I have downvoted the argument with username "$string" and question ID "$string" and ID "$string"$/, function(username, questionId, id, done) {
            this.database.setArgumentVote(this.questions[questionId].id, this.arguments[id].id, username, db.VoteType.DOWN, function() {
                done();
            });
        })

        .given(/^I have upvoted the argument with username "$string" and question ID "$string" and ID "$string"$/, function(username, questionId, id, done) {
            this.database.setArgumentVote(this.questions[questionId].id, this.arguments[id].id, username, db.VoteType.UP, function() {
                done();
            });
        })

        .given(/^I open the site for the question with ID "$string"$/,
            function(id, done) {
                this.browser
                    .url(this.baseUrl + '/questions/view?q=' + this.questions[id].id)
                    .call(done);
            }
        );
};

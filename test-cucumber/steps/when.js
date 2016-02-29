/**
 * when steps
 */

var db = require("../../data/db");

module.exports = function () {
    this
        .when(/^I (click|doubleclick) on the (link|button|element) "$string"$/,
            require('../support/action/clickElement'))

        .when(/^I (add|set) "$string" to the inputfield "$string"$/,
            require('../support/action/setInputField'))

        .when(/^I clear the inputfield "$string"$/,
            require('../support/action/clearInputField'))

        .when(/^I drag element "$string" to element "$string"$/,
            require('../support/action/dragElement'))

        .when(/^I submit the form "$string"$/,
            require('../support/action/submitForm'))

        .when(/^I pause for (\d+)ms$/,
            require('../support/action/pause'))

        .when(/^I set a cookie "$string" with the content "$string"$/,
            require('../support/action/setCookie'))

        .when(/^I delete the cookie "$string"$/,
            require('../support/action/readCookie'))

        .when(/^I press "$string"$/,
            require('../support/action/pressButton'))

        .when(/^I (accept|dismiss) the (alertbox|confirmbox|prompt)$/,
            require('../support/action/handleModal'))

        .when(/^I enter "$string" into the prompt$/,
            require('../support/action/setPromptText'))

        .when(/^I scroll to element "$string"$/,
            require('../support/action/scroll'))

        .when(/^I close the last opened (window|tab)$/,
            require('../support/action/closeLastOpenedWindow'))

        .when(/^I focus the last opened (window|tab)$/,
            require('../support/action/focusLastOpenedWindow'))

        .when(/^I log in to site with username "$string" and password "$string"$/,
            require('../support/custom/login'))

        .when(/^I select the (\d+)(st|nd|rd|th) option for element "$string"$/,
            require('../support/action/selectOptionByIndex'))

        .when(/^I select the option with the (name|value|text) "$string" for element "$string"$/,
            require('../support/action/selectOption'))

        .when(/I open the (url|site) "$string"$/,
            require('../support/action/openWebsite'))

        .when(/^I downvote the question with username "$string" and ID "$string"$/, function(username, id, done) {
            var downvoteId = "#q" + this.questions[id].id + "_downvote";
            this.browser.click(downvoteId)
                .call(done);
        })

        .when(/^I upvote the question with username "$string" and ID "$string"$/, function(username, id, done) {
            var upvoteId = "#q" + this.questions[id].id + "_upvote";
            this.browser.click(upvoteId)
                .call(done);
        })


        .when(/^I downvote the argument with ID "$string"$/, function(id, done) {
            var downvoteId = "#a" + this.arguments[id].id + "_downvote";
            this.browser.click(downvoteId)
                .call(done);
        })

        .when(/^I upvote the argument with ID "$string"$/, function(id, done) {
            var upvoteId = "#a" + this.arguments[id].id + "_upvote";
            this.browser.click(upvoteId)
                .call(done);
        });
};

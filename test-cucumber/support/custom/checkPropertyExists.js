/**
 * check attribute or css property existence
 */

var assert = require('assert');

module.exports = function (isCSS, attrName, elem, falseCase, done) {
    var command = isCSS ? 'getCssProperty' : 'getAttribute';

    this.browser[command](elem, attrName)
        .then(function (res) {
            if (falseCase) {
                assert.ok(res === null);
            } else {
                assert.ok(res !== null);
            }
        })
        .call(done);
};

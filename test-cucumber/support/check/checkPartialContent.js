/**
 * check content for specific element or input field
 */

module.exports = function (type, element, falseCase, origText, done) {
    if (origText === "$DEFAULT_TEST_ARGUMENT_PRO_TEXT") {
        origText = this.argumentPro.text;
    } else if (origText === "$DEFAULT_TEST_ARGUMENT_CON_TEXT") {
        origText = this.argumentCon.text;
    }

    var command = (type !== 'inputfield') ? 'getText' : 'getValue';

    // Check for empty element
    if (!done && typeof origText === 'function') {
        done = origText;
        origText = '';

        falseCase = !falseCase;
    }

    this.browser[command](element)
        .then(function (text) {
            if (falseCase) {
                assert.ok(text.indexOf(origText) === -1);
            } else {
                assert.ok(text.indexOf(origText) !== -1);
            }
        })
        .call(done);
};

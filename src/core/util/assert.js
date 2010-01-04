goog.provide("ckft.util.assert");

/**
 * Assert that a condition must be true.  Throws an exception if assertion is false.
 * @param {boolean} test   Condition to test
 * @param {string=} message  Optional message to throw in exception 
 */
ckft.util.assert = function(test, message) {
    if (test) return;
    if (message) {
        throw "FAILURE: " + message;
    } else {
        throw "ASSERTION FAILED!"
    }
}

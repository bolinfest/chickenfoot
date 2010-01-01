/**
 * Testing framework.
 *
 * Typical usage:
 *
 * var t = new Test();
 *
 * t.test(function() {
 *    // testing code with assertions: Test.assert(), Test.assertEquals(), etc.
 * });
 * // repeat t.test() with other tests
 *
 * // end testing and display summary of results
 * t.close();
 */
function Test() {
  this.tests = 0;
  this.successes = 0;
  
  try {
      // set dom.max_script_run_time to infinity, so that Mozilla doesn't
      // interrupt possibly-slow testing with "Do you want to abort this?"
      var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefBranch);  
      this.old_max_script_run_time = prefs.getIntPref("dom.max_script_run_time");
      prefs.setIntPref("dom.max_script_run_time", 500000);
  } catch (e) {
      // client-side Chickenfoot will throw exceptions from this code      
  }
}


/**
 * Get summary of test, in the form "y/y tests succeeded" or
 * "x/y tests succeeded, z FAILED"
 */
Test.prototype.toString = function() {
  return this.successes + "/" + this.tests + " tests succeeded"
          + (this.successes != this.tests
                  ? ", " + (this.tests - this.successes) + " FAILED"
                  : "");
}
  
/**
 * End a test run and display the number of tests that succeeded.
 */
Test.prototype.close = function() {
  debug(this);

  try {
      // restore dom.max_script_run_time to previous value
      var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefBranch);  
      prefs.setIntPref("dom.max_script_run_time", this.old_max_script_run_time);
  } catch (e) {
      // client-side Chickenfoot will throw exceptions from this code      
  }
  
  return this;
}

/**
 * Do a test.  Runs testFunction; if it doesn't throw any
 * exceptions, considers it successful; otherwise catches & displays
 * the exception and considers the test a failure.
 */
Test.prototype.test = function(/*optional string*/ name, /*function*/ testFunction) {
  if (!testFunction) {
    testFunction = name;
    name = undefined;
  }    
  
  debug((name ? name + " test " : "Test ")
         + (++this.tests) + " ...");
  try {
    testFunction();
  } catch (msg) {
    if (instanceOf(msg, UserStopped)) throw msg;
    debug(msg);
    return; // without incrementing successes
  }
  ++this.successes
}


/**
 * Assertions.  Does nothing when assertion is OK; throws exception
 * when assertion fails.  The optional message is included
 * when the assertion fails, explaining what failed.
 * If message argument is omitted, a generic message is displayed instead.
 */
Test.assert = function(/*boolean*/ test, /*optional string*/ message) {
  if (test) return;
  if (message) {
    throw "FAILURE: " + message;
  } else {
    throw "TEST FAILED!";
  }
}

Test.assertTrue = function(/*boolean*/ test, /*optional string*/ message) {
  Test.assert(test, message);
}

Test.assertFalse = function(/*boolean*/ test, /*optional string*/ message) {
  Test.assert (!test, message);
}

Test.assertEquals = function(/*any*/ arg1, /*any*/ arg2, /*optional string*/ message) {
  if (message === undefined) {
    message = arg1 + " should be equal to " + arg2;
  }
  Test.assertTrue(arg1 == arg2, message);
}

Test.fail = function(/*optional string*/ message) {
  Test.assertTrue(false, message);
}

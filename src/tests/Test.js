/**
 * Testing framework.
 *
 * Typical usage:
 *
 *   var t = new Test();
 *
 *   t.test(function() {
 *      // testing code with assertions: Test.assert(), Test.assertEquals(), etc.
 *   });
 *  
 *   // repeat t.test() with other tests
 *
 *   // end testing and display summary of results
 *   t.close();
 * 
 * All Test objects created are automatically added to the
 * Test.allTests list, so that after running creating a series
 * of Test objects, the summary of all the tests can
 * be obtained with Test.summarizeAllTests().
 */


// Define Test only if it hasn't already been defined.
// This allows include("Test.js") to be done multiple times
// without harm.
if (this.Test === undefined) {    
    /**
     * Make a new test suite.
     * @param {string=} name   optional name of test suite
     * @constructor
     */
    Test = function(name) {
      this.name = name;
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
      
      if (name) output(name + " ****************************** "); 
        
      Test.allTests.push(this);
    }

    /**
     * List of all Test objects ever created.
     * @type {Array.Test}
     */    
    Test.allTests = [];
    
    /**
     * Clear the allTests list.
     */
    Test.clearAllTests = function() {
        Test.allTests = [];
    }
    
    /**
     * Get a summary of all the Test objects in the allTests list.
     */
    Test.summarizeAllTests = function() {
        var result = "*********** SUMMARY ***************\n";
        for (var i = 0; i < Test.allTests.length; ++i) {
            var test = Test.allTests[i];
            result += test + "\n";
        }
        return result;    
    }
    
    
    /**
     * Get summary of test, in the form "y/y tests succeeded" or
     * "x/y tests succeeded, z FAILED"
     */
    Test.prototype.toString = function() {
      return (this.name ? this.name + ": " : "") +
                this.successes + "/" + this.tests + " tests succeeded" +
              (this.successes != this.tests
                      ? ", " + (this.tests - this.successes) + " FAILED"
                      : "");
    }
      
    /**
     * End a test run and display the number of tests that succeeded.
     */
    Test.prototype.close = function() {
      output(this);
    
      try {
          // restore dom.max_script_run_time to previous value
          var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                        .getService(Components.interfaces.nsIPrefBranch);  
          prefs.setIntPref("dom.max_script_run_time", this.old_max_script_run_time);
      } catch (e) {
          // client-side Chickenfoot will throw exceptions from this code      
      }
    }
    
    /**
     * Do a test.  Runs testFunction; if it doesn't throw any
     * exceptions, considers it successful; otherwise catches & displays
     * the exception and considers the test a failure.
     * @param {string=} name   optional name of test
     * @param {function():void} testFunction   test to run 
     */
    Test.prototype.test = function(name, testFunction) {
        if (!testFunction) {
            testFunction = name;
            name = undefined;
        }    
      
        output((name ? name + " test " : "Test ") +
                 (++this.tests) + " ...");
        try {
            testFunction();
        } catch (msg) {
            if (instanceOf(msg, UserStopped)) throw msg;
            output(msg);
            return; // without incrementing successes
        }
        ++this.successes;
    }
    
    
    /**
     * Assertions.  Does nothing when test is true; throws exception
     * when test is false.  The optional message is included
     * when the assertion fails, explaining what failed.
     * If message argument is omitted, a generic message is displayed instead.
     * @param {boolean} test     Condition to test
     * @param {string=} message  Message to display when assertion fails
     */
    Test.assert = function(test, message) {
        if (test) return;
        if (message) {
            throw "FAILURE: " + message;
        } else {
            throw "TEST FAILED!";
        }
    }
    
    /**
     * Same as assert().
     */
    Test.assertTrue = Test.assert;
    
    /**
     * Asserts that a condition is false.  Throws exception if test is true.
     * If message argument is omitted, a generic message is displayed instead.
     * @param {boolean} test     Condition to test
     * @param {string=} message  Message to display when assertion fails
     */
    Test.assertFalse = function(test, message) {
        Test.assert (!test, message);
    }
    
    /**
     * Asserts that arg1 equals arg2.
     * @param {*} arg1
     * @param {*} arg2
     * @param {string=} message  Message to display when assertion fails
     */
    Test.assertEquals = function(/*any*/ arg1, /*any*/ arg2, /*optional string*/ message) {
        if (message === undefined) {
            message = arg1 + " should be equal to " + arg2;
        }
        Test.assertTrue(arg1 == arg2, message);
    }
    
    /**
     * Assertion that always fails.  Useful for exception handlers.
     * @param {string=} message  Message to display with failing assertion
     */
    Test.fail = function(message) {
        Test.assertTrue(false, message);
    }

}

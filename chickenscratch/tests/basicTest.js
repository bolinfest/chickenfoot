// This file is a model for creating new tests.

// Import the Test class from Chickenfoot.
var Test = Chickenfoot.Test;

// Create a new Test object representing this test.
var t = new Test();


// Call t.test() for every test you want to run.
// Pass it a function (of no arguments) that does the test,
// using Test.assert() to check the result.  You can call
// assert() multiple times to check various aspects of the
// result.  For example:
t.test(function() {
  var s = "123" + "456";
  
  // Test.assert() takes a boolean argument.  If it's true,
  // the test worked.  If it's false, the test failed.
  Test.assert(s == "123456");
  
  // Test.assert can also take a second argument, which is
  // a message to print when the test fails.
  Test.assert(s[0] == "1", "s does not start with 1");
});

// Normally the tests in this file are simply numbered
// in the output (Test 1, Test 2, etc.)  You can name
// them instead by passing a name as the first argument
// to t.test(), for example:
t.test("lower case", function() {
  var s = "ABCdef".toLowerCase();
  Test.assert(s == "abcdef");
});


// Finish the test by calling close().
t.close();


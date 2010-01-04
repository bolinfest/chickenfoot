include("Test.js");
Test.clearAllTests();

runTest("basicTest.js");
runTest("findTest.js");
runTest("clickTest.js");
runTest("pickTest.js");
runTest("checkTest.js");
runTest("xpathTest.js");
runTest("goTest.js");
runTest("SetTest.js");
runTest("namespaceTest.js");
runTest("waitTest.js");
runTest("instanceofTest.js");
runTest("recorderTest.js");
runTest("TextBlobTest.js");
runTest("MatchTest.js");
runTest("stringsTest.js");
runTest("includeTest.js");
runTest("insertTest.js");
runTest("removeTest.js");
runTest("replaceTest.js");
runTest("resetTest.js");
runTest("keypressTest.js");
//runTest("xulmatchingTest.js"); not ready yet
//runTest("withTabTest.js"); not ready yet

output(Test.summarizeAllTests());

function runTest(filename) {
  // give test a fresh namespace, but with
  // Test class predefined in it so that
  // its test is added to Test.allTests
  include(filename, {Test:Test});
}


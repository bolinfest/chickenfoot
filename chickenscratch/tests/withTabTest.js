// Import the Test class from Chickenfoot.
var Test = Chickenfoot.Test;
var StringBuffer = Chickenfoot.StringBuffer;

var prefix = "file://" + scriptDir.path + "/pages/";

// Create a new Test object representing this test.
var t = new Test();

// Test the withTab() function
// Loads saved google.com and mit.edu sites,
// populates their textboxes with different text,
// and then confirms that the text in the fields
// is as expected.
//
// TODO: 
// This test does not currently pass.
// It may also be desirable to test withTab
// using functions that accept arguments.
t.test("withTab", function() {
	go(prefix + "google.html");
	var googleTab = tab;
	var mitTab = openTab(prefix + "mit.html");
	withTab(googleTab, function() {
		testEnter("this is google");
	})
	withTab(mitTab, function() {
		testEnter("this is MIT");
	})
	with (googleTab) {
  	   Test.assertEquals(find("textbox").element.value, "this is google", "Text was not entered properly into Google textbox.");
	}
	
	with (mitTab) {
		Test.assertEquals(find("textbox").element.value, "this is MIT", "Text was not entered properly into MIT textbox.");
	}
});


// Finish the test by calling close().
t.close();

function testEnter(/*String*/ text){
	enter(text);
}

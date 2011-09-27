include("Test.js");

// These tests make sure go() goes to the right place,
// and document correctly waits until the page is loaded
// (so that document.title is valid).

// To debug page-loading problems, turn on this boolean,
// which causes the loading listeners to
// send debugging output to the Chickenfoot output pane.
Chickenfoot.showLoadingEvents = false;

var t = new Test("goTest");


// test domain name
testGo("google.com", "Google");

// test redirect
testGo("http://uid.csail.mit.edu/chickenfoot", "Chickenfoot");

// bug 116: when go() is used with keywords, rather than a URL,
// Firefox queries Google to resolve the keywords to a URL.
// This Google query should NOT make us think the page has been loaded.
testGo("yahoo.com", "Yahoo!");

// test full URL
testGo("http://www.google.com", "Google");

// bug 113: Back and Forward don't send document-loaded events.
t.test("back & forward", function() {
  go("google.com");
  Test.assertEquals(document.title, "Google");
  go("mit.edu");
  Test.assertEquals(document.title,
      "MIT - Massachusetts Institute of Technology");
  back();
  Test.assertEquals(document.title, "Google");
  forward();
  Test.assertEquals(document.title,
      "MIT - Massachusetts Institute of Technology");
});


// Summarize testing
t.close();

function testGo(url, title) {
  t.test(title, function() {
    go(url);
    Test.assertEquals(document.title, title);
  });
}

  




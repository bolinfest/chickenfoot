var Test = Chickenfoot.Test;
var TextBlobIterator = Chickenfoot.TextBlobIterator;

var prefix = "file://" + scriptDir.path + "/pages/";

// if useFetch is true, testing happens in the background, using fetch().
// otherwise, uses go().
var useFetch = false;


///////////////////////////////////
// tests

var t = new Test();

var testName;  // name of current test, inferred from load() argument


test("google.html", 
     "Google", 
     "©2005 Google - Searching 8,058,044,651 web pages", 
     9);

test("yahoo.html", 
     "Yahoo!", 
     "Copyright © 2005 Yahoo! Inc. All rights reserved. Copyright/IP Policy.", 
     103);

test("moodle.html", 
     "MAS110 2005", 
     "Home", 
     322);

test("google-advanced_search.html", 
     "Go to Google Home", 
     "©2005 Google", 
     102);


test("bug87.html", 
     "Personal Banking", 
     "Certificates of Deposit", 
     2);

t.close();

///////////////
// internal methods
//

function test(file, expectedFirstBlob, expectedLastBlob, expectedNumberBlobs) {
  load(file);
  t.test(testName, function() {    
    var iter = new TextBlobIterator(getDocument());
    var firstBlob = null;
    var lastBlob = null;
    var nBlobs = 0;
    while (blob = iter.next()) {
       //output(blob);
       if (!firstBlob) firstBlob = blob;
       lastBlob = blob;
       ++nBlobs;
    }
    Test.assertEquals(firstBlob.value, expectedFirstBlob);
    Test.assertEquals(lastBlob.value, expectedLastBlob);
    Test.assertEquals(nBlobs, expectedNumberBlobs);
  });
}


var fetched = null;

function load(file) {
  var url = prefix + file;
  if (useFetch) {
    fetched = fetch(url);
  } else {
    go(url);
  }
  
  // extract the basename of the filename and use
  // it as the test name
  testName = file.match(/^([^\.]*)(\.|$)/)[1]
}

function getDocument() {
  if (useFetch) {
    return fetched.document;
  } else {
    return document;
  }
}











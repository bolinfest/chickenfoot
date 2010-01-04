include("Test.js");

var prefix = "file://" + scriptDir.path + "/pages/";


///////////////////////////////////
// tests

var t = new Test("MatchTest");

var testName;  // name of current test, inferred from load() argument

load("google.html");
t.test(testName, function() {    
  var m = find("Groups link");
  Test.assertEquals(m.element, document.links[1]);
  Test.assertEquals(m.text, "Groups");
  Test.assertEquals(m.html, '<a id="2a" class="q" href="http://groups-beta.google.com/grphp?hl=en&amp;tab=wg" onclick="return qs(this);">Groups</a>');
                             
});

t.close();

///////////////
// internal methods
//

function load(file) {
  var url = prefix + file;
    go(url);
  
  // extract the basename of the filename and use
  // it as the test name
  testName = file.match(/^([^\.]*)(\.|$)/)[1]
}




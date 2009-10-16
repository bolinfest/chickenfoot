var Test = Chickenfoot.Test;

var prefix = "file://" + scriptDir.path + "/pages/";


///////////////////////////////////
// tests

var t = new Test();

var testName;  // name of current test, inferred from load() argument

load("google.html");
t.test(testName, function() {    
  var m = find("Groups link");
  Test.assertEquals(m.element, document.links[1]);
  Test.assertEquals(m.text, "Groups");
  Test.assertEquals(m.html, '<A onclick="return qs(this);" href="http://groups-beta.google.com/grphp?hl=en&amp;tab=wg" class="q" id="2a">Groups</A>');
});

/*
t.test(testName, function() {    
  var m = find(new TC("Groups"));
  Test.assertEquals(m.element, document.links[1]);
  Test.assertEquals(m.text, "Groups");
  Test.assertEquals(m.html, 'Groups');
});

t.test(testName, function() {    
  var m = find(new TC("from bold containing Web\n to bold containing more"));
  Test.assertEquals(m.element.tagName, "FONT");
});
*/

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



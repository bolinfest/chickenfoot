var Test = Chickenfoot.Test;

var t = new Test();

t.test(function() {
  include('pages/include1.js');
  Test.assertEquals(42, definedWithVar);
  Test.assertEquals(102, definedFunction());
  Test.assertEquals(56, globalVariable);

  delete definedWithVar; 
  delete definedFunction; 
  delete globalVariable; 

  try {
    globalVariable;
    Test.fail();
  } catch (e) {
  }
});

t.test(function() {
  var Include2 = {};
  include('pages\\include1.js', Include2);

  Test.assertEquals(42, Include2.definedWithVar);
  Test.assertEquals(102, Include2.definedFunction());
  Test.assertEquals(56, globalVariable);
  if ("globalVariable" in Include2) Test.fail("globalVariable shouldn't be in Include2");

  delete globalVariable; 
});

t.test(function() {
  var Include3 = {};
  include('pages/include1.js', Include3);

  Test.assertEquals(42, Include3.definedWithVar);
  Test.assertEquals(102, Include3.definedFunction());
  Test.assertEquals(56, globalVariable);
  if ("globalVariable" in Include3) Test.fail("globalVariable shouldn't be in Include3");

  delete globalVariable;
});

t.test("Include scriptDir referenced file", function() {
  var Include4 = {};
  include('include2.js', Include4);  //as file is present in the directory of this file
  Test.assertEquals(5, Include4.add(2,3));
});

t.test("Include Full file path", function() {
  var Include5 = {};
  var file = scriptDir.clone();
  file.append("include2.js");
  include('file://' + file.path, Include5);  //Constructs the full path name string
  Test.assertEquals(5, Include5.add(2,3));
});

t.test("Include remote URL and remote reference", function() {
  var Include6 = {};
  include("http://uid.csail.mit.edu/chickenfoot/includeTest/include.js", Include6);  //Constructs the full URL path name string
  Test.assertEquals(9, Include6.add_three(2,3,4));
  Test.assertEquals(92, Include6.k);
});

t.test("Include Nested includes", function() {
  var Include8 = {};
  include("pages/include-test1/tester1.js", Include8);
  Test.assertEquals(55, Include8.x);
  Test.assertEquals(43, Include8.y);
});

t.test("Include libraries", function() {
  var Include9 = {};
  include("fileio.js", Include9);
  Test.assert(Include9.write);
});

t.close();


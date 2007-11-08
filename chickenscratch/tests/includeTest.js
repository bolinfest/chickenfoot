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
  var Include1 = {};
  include('pages/include1.js', Include1);

  Test.assertEquals(42, Include1.definedWithVar);
  Test.assertEquals(102, Include1.definedFunction());
  Test.assertEquals(56, globalVariable);
  if ("globalVariable" in Include1) Test.fail("globalVariable shouldn't be in Include1");

  delete globalVariable; 
});

t.test(function() {
  var Include2 = {};
  include('pages/include1.js', Include2);

  Test.assertEquals(42, Include2.definedWithVar);
  Test.assertEquals(102, Include2.definedFunction());
  Test.assertEquals(56, globalVariable);
  if ("globalVariable" in Include2) Test.fail("globalVariable shouldn't be in Include2");

  delete globalVariable;
});

t.test(function() {
  var Include3 = {};
  include('include2.js', Include3);  //as file is present in the directory of this file
  Test.assertEquals(5, Include3.add(2,3));
});

t.test(function() {
  var Include4 = {};
  var file = scriptDir.clone();
  file.append("include2.js");
  include('file://' + file.path, Include4);  //Constructs the full path name string
  Test.assertEquals(5, Include4.add(2,3));
});

t.test(function() {
  var Include5 = {};
  include("http://uid.csail.mit.edu/chickenfoot/includeTest/include.js", Include5);  //Constructs the full URL path name string
  Test.assertEquals(9, Include5.add_three(2,3,4));
  Test.assertEquals(92, Include5.k);
});

t.test(function() {
  var Include6 = {};
  include("pages/include-test1/in*.js", Include6);
  Test.assertEquals(10, Include6.x);
  Test.assertEquals(7, Include6.y);
});

t.test(function() {
  var Include7 = {};
  include("pages/include-test1/tester1.js", Include7);
  Test.assertEquals(55, Include7.x);
  Test.assertEquals(43, Include7.y);
});

t.test("libraries", function() {
  var File = {};
  include("fileio.js", File);
  Test.assert(File.write);
});

t.close();


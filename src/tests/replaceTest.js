include("Test.js");

var t = new Test("replaceTest");

t.test(function() {
  go("http://www.google.com/");
 
  replace("google search button", new Button("Bleah Bleah"));
  Test.assert(find("bleah bleah button").hasMatch);
  Test.assert(!find("google search button").hasMatch);

  x = replace("google search button", "funky");
  Test.assert(x == null);
});

t.close();



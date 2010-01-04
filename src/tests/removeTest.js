include("Test.js");

var t = new Test("removeTest");

t.test(function() {
  go("file://" + scriptDir.path + "/pages/mit-webmail.html");
  
  // remove something and make sure it's gone
  var currentTime = remove("Current time");
  Test.assert(!find(/Current time/).hasMatch,
      '"Current time" was not removed');

  // put it back somewhere else
  insert(after("Password"), currentTime);
  Test.assert(find("Password Current").hasMatch,
      '"Current time" was not added back into the page');

  // remove something not found
  var noMatch = remove("asdfasdfasdfasdfasdfasdf");
  Test.assert(noMatch == null,
      'remove() should return null for a pattern that cannot be matched');
});

// removing multiple matches to pattern
t.test(function() {
  go("file://" + scriptDir.path + "/pages/google.html");
  
  var n = find("link").count;
  while (n > 0) {
    var x = remove("link");
    --n;
    Test.assert(find("link").count == n, 'count did not match n');
  }
  
  var x = remove("link");
  Test.assert(x == null, 'last remove should return null');
});

t.close();



var Test = Chickenfoot.Test;

var t = new Test();

t.test(function() {
  go("https://webmail.mit.edu");
  
  // remove something and make sure it's gone
  var x = remove("MIT Kerberos");
  Test.assert(!find(/MIT Kerberos/).hasMatch);
  
  // put it back somewhere else
  insert(after("Password"),x)
  Test.assert(find(/PasswordMIT Kerberos/).hasMatch)
  
  // remove something not found
  var x = remove("asdfasdfasdfasdfasdfasdf");
  Test.assert(x == null);
});

// removing multiple matches to pattern
t.test(function() {
  go("http://www.google.com/");
  
  var n = find("link").count;
  while (n > 0) {
    var x = remove("link");
    --n;
    Test.assert(find("link").count == n);
  }
  
  // last remove should return null
  var x = remove("link");
  Test.assert(x == null);
});

t.close();


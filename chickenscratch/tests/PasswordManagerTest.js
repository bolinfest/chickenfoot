var Test = Chickenfoot.Test;

var t = new Test();

t.test("add-get password", function(){
  try {
    //clear existing password
    removePassword('deathstar.com','obi-wan@jeditemple.edu');
  }
  catch (e) {
    //continue
  }
  addPassword('http://www.deathstar.com','obi-wan@jeditemple.edu','protectluke','https://login.deathstar.com/login.php','email','pass');
  var passObj = getPassword('deathstar.com','obi-wan@jeditemple.edu');
  Test.assertEquals('protectluke', passObj.password);
});

t.test("remove password", function(){
  addPassword('http://www.deathstar.com','anekin@jeditemple.edu','protectluke','https://login.deathstar.com/login.php','email','pass');
  removePassword('deathstar.com','anekin@jeditemple.edu');
  var passObj = getPassword('deathstar.com','anekin@jeditemple.edu');
  Test.assertEquals(null, passObj);
  try {
    removePassword('deathstar.com','anekin@jeditemple.edu');
    Test.fail();
  }
  catch (e) {
    //the remove threw an exception as expected
    //continue
  }
});

t.close();
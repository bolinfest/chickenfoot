include("Test.js");

var t = new Test("resetTest");


t.test(function() {
  go("http://web.mit.edu");
  check("People")
  enter("asdfasd")
  
  Test.assert(find("People radiobutton").element.checked);
  Test.assert(find("textbox").element.value == "asdfasd");
  
  reset("form")

  Test.assert(!find("People radiobutton").element.checked);
  Test.assert(find("textbox").element.value == "");

});

t.close();
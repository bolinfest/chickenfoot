include("Test.js");

var t = new Test("insertTest");

t.test(function() {
  go("http://www.google.com/");
 
  insert(after("google search button"), new Button("Bleah Bleah"));
  Test.assert(find("bleah bleah button").hasMatch);
  
  var gs = find("google search button").element; 
  var b = find("bleah bleah button").element;
  Test.assert(b.previousSibling == gs); 

  insert(before("Privacy link"), "Funky ");
  Test.assert(find("Funky Privacy").hasMatch);
});

t.close();



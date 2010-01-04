include("Test.js");

var t = new Test("insertTest");

t.test(function() {
  go("http://www.google.com/");
 
  insert(after("google search button"), new Button("Bleah Bleah"));
  Test.assert(find("bleah bleah button").hasMatch);
  
  gs = find("google search button").element; 
  b = find("bleah bleah button").element;
  Test.assert(b.previousSibling == gs); 

  insert(before("Advanced Search link"), "Funky ");
  Test.assert(find("Funky Advanced Search").hasMatch);
});

t.close();



var Test = Chickenfoot.Test;

var t = new Test();

t.test("click", function(){
  go("http://www.google.com");
  click("advanced search");
  Test.assert(/advanced_search/.test(document.location));
  click("Google Search");
  Test.assert(/webhp/.test(document.location));
});

// regression test for bug #293
t.test("click", function() {
  go("http://www.google.com", true)
  insert(after("google search button"),
    "<a href='http://web.mit.edu' target='mit'>MIT</a>")
  click("mit")
  Test.assert(/www.google.com/.test(document.location));
});

// regression tests for bug #288
t.test("click", function() {
  go("file://" + scriptDir.path + "/pages/housingbubbleblog.html");
  var m = find(new XPath("//img[@class='collapseicon']"))
  click(m)
});

t.close();




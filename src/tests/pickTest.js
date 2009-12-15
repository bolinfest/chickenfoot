var Test = Chickenfoot.Test;

var prefix = "file://" + scriptDir.path + "/pages/";

function gelid(id) {
  return document.getElementById(id);
}

// These tests make sure pick() does the right thing.

var t = new Test();

go(prefix + "google-advanced_search.html", true);
t.test(function() {
  pick("30 results", true)
  Test.assertEquals(gelid("num").selectedIndex, 2, "didn't pick 30 results")
})
t.test(function() {
  pick("domain", "don't")
  Test.assertEquals(gelid("as_dt").selectedIndex, 1, "didn't pick domain=don't")
})
t.test(function() {
  pick("no filtering", false)
  Test.assertEquals(gelid("sfo").checked, false, "didn't turn off no filtering")
})
t.test(function() {
  unpick("filter using safesearch", true)
  Test.assertEquals(gelid("ss").checked, true, "didn't turn on safe filtering")
})

go(prefix + "guidedNews.html", true)
t.test(function() {
  pick("U.S. News")
  Test.assertEquals(gelid("newscat").selectedIndex, 3, "didn't pick U.S. News")
})

// changing to U.S. News should change the second drop-down menu
t.test(function() {
  pick("Northeast Regional")
  Test.assertEquals(gelid("srccat").selectedIndex, 2, "didn't pick Northeast Regional")
})

go(prefix + "iframe-xpath.html");
t.test(function() {
	var m = find(new XPath("//img"));
  	Test.assert(m.length > 0, "XPath is not reaching into embedded iframe.");  
});

// Summarize testing
t.close();





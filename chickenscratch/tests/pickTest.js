var Test = Chickenfoot.Test;

var prefix = "file://" + scriptDir.path + "/pages/";

// in order to use forms[0].inputName syntax, we have to get a
// reference to the real document, not the XPCNativeWrapped document
function getDocument() {
  return (document.wrappedJSObject) ? document.wrappedJSObject : document;
}

// These tests make sure pick() does the right thing.

var t = new Test();

go(prefix + "google-advanced_search.html", true);
t.test(function() {
  pick("30 results", true)
  Test.assertEquals(getDocument().forms[0].num.selectedIndex, 2, "didn't pick 30 results")
})
t.test(function() {
  pick("domain", "don't")
  Test.assertEquals(getDocument().forms[0].as_dt.selectedIndex, 1, "didn't pick domain=don't")
})
t.test(function() {
  pick("no filtering", false)
  Test.assertEquals(getDocument().forms[0].sfo.checked, false, "didn't turn off no filtering")
})
t.test(function() {
  unpick("filter using safesearch", true)
  Test.assertEquals(getDocument().forms[0].ss.checked, true, "didn't turn on safe filtering")
})

go(prefix + "guidedNews.html", true)
t.test(function() {
  pick("U.S. News")
  Test.assertEquals(getDocument().forms[0].newscat.selectedIndex, 3, "didn't pick U.S. News")
})

// changing to U.S. News should change the second drop-down menu
t.test(function() {
  pick("Northeast Regional")
  Test.assertEquals(getDocument().forms[0].srccat.selectedIndex, 2, "didn't pick Northeast Regional")
})

// Summarize testing
t.close();




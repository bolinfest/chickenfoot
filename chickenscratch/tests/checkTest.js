var Test = Chickenfoot.Test;

var prefix = "file://" + scriptDir.path + "/pages/";

// in order to use forms[0].inputName syntax, we have to get a
// reference to the real document, not the XPCNativeWrapped document
function getDocument() {
  return (document.wrappedJSObject) ? document.wrappedJSObject : document;
}

// These tests make sure check() does the right thing.

var t = new Test();

go(prefix + "preferences.html", true);
t.test(function() {
  check("arabic");
  Test.assertEquals(getDocument().forms[0].lr[0].checked, true, "didn't check arabic")
  getDocument().forms[0].lr[0].checked = false;
})

t.test(function() {
  getDocument().forms[0].lr[9].checked = true;
  uncheck("english");
  Test.assertEquals(getDocument().forms[0].lr[9].checked, false, "didn't uncheck english")
})


t.test(function() {
  check(find("checkbox"));
  Test.assertEquals(getDocument().forms[0].lr[0].checked, true, "didn't check first checkbox")
})

// Summarize testing
t.close();






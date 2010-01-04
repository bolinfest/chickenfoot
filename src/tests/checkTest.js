include("Test.js");

var prefix = "file://" + scriptDir.path + "/pages/";

function gelid(id) {
  return document.getElementById(id);
}

// These tests make sure check() does the right thing.



var t = new Test("checkTest");

go(prefix + "preferences.html", true);
t.test(function() {
  check("arabic");
  Test.assertEquals(gelid("lr0").checked, true, "didn't check arabic")
  gelid("lr0").checked = false;
})

t.test(function() {
  gelid("lr9").checked = true;
  uncheck("english");
  Test.assertEquals(gelid("lr9").checked, false, "didn't uncheck english")
})


t.test(function() {
  check(find("checkbox"));
  Test.assertEquals(gelid("lr0").checked, true, "didn't check first checkbox")
})

// Summarize testing


t.close();



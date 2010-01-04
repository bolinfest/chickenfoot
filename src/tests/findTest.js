include("Test.js");

var Pattern = Chickenfoot.Pattern;
var StringBuffer = Chickenfoot.StringBuffer;

var prefix = "file://" + scriptDir.path + "/pages/";

// if useFetch is true, testing happens in the background, using fetch().
// otherwise, uses go().
var useFetch = false;


///////////////////////////////////
// tests

var t = new Test("findTest");

var testName;  // name of current test, inferred from load() argument

// xhtml (which has lower-case tag names)
load("classic.xhtml")
testCount(12, null, "link");
testCount(2, null, "button");

load("login.xml")
testElement("name", "accountName", Pattern.TEXTBOX, "e-mail address")
testElement("name", "password", Pattern.TEXTBOX, "password")
testElement("onclick", "Form.submit(this)", Pattern.LINK, "login")

 
// iTunes page
load("artists.html");
testElement("name", "0.5.1.9.6.2.0", Pattern.TEXTBOX, "albums");
testElement("name", "0.5.1.9.8.2.0", Pattern.TEXTBOX, "tracks");
testElement("name", "0.5.1.9.10.2.0", Pattern.TEXTBOX, "videos");
testElement("name", "0.5.1.9.12.3.0", Pattern.TEXTBOX, "labels");
testElement("name", "0.5.1.9.14.3.0", Pattern.TEXTBOX, "other");

testElement("name", "0.5.1.9.6.2.0", Pattern.TEXTBOX, "first");
testElement("name", "0.5.1.9.8.2.0", Pattern.TEXTBOX, "second");
testElement("name", "0.5.1.9.10.2.0", Pattern.TEXTBOX, "third");
testElement("name", "0.5.1.9.12.3.0", Pattern.TEXTBOX, "fourth");
testElement("name", "0.5.1.9.14.3.0", Pattern.TEXTBOX, "fifth");

testElement("name", "0.5.1.9.12.3.0", Pattern.TEXTBOX, "0.5.1.9.12.3.0");

// personalized Google home page
// makes sure that quoted patterns match exactly
load("personalized-google.html");
testCount(1, Pattern.LINK, "'sign out'");
testCount(0, Pattern.LINK, "'sign in'");

// Google home page
load("google.html");
testCount(13, null, "Link");
testCount(1, Pattern.LINK, "Advertising");
testElement("name", "btnG", Pattern.BUTTON, "Search");
testElement("name", "btnI", Pattern.BUTTON, "Lucky");
testElement("name", "q", Pattern.TEXTBOX, "");

testElement("src", "/intl/en/images/logo.gif", Pattern.IMAGE, "Google");

// test searching with internal field names
testElement("name", "btnG", Pattern.BUTTON, "btnG");
testElement("name", "q", Pattern.TEXTBOX, "q");

// test searching with context
var form = testCount(1, Pattern.FORM, "search");
testCount(13, null, "link");
testCount(10, null, "link", form);

// test regexps
testCount(28, /\w+/);
testCount(5, /\d+/);


// Yahoo
load("yahoo.html");
testElement("id", "fp", Pattern.TEXTBOX, "search the web");
testElement("id", "fp", Pattern.TEXTBOX, "search");
testElement("id", "zi", Pattern.TEXTBOX, "zip code");
testElement("id", "zi", Pattern.TEXTBOX, "enter city");
testElement("name", "s", Pattern.TEXTBOX, "Stock Quotes");

// Google Advanced Search
load("google-advanced_search.html")
testCount(1, Pattern.LINK, "Advanced Search");
testCount(13, null, "Link");
testElement("name", "as_epq", Pattern.TEXTBOX, "exact phrase");
testElement("name", "as_oq", Pattern.TEXTBOX, "with at least one of the words");
testElement("name", "as_rq", Pattern.TEXTBOX, "similar to the page");
testElement("name", "as_lq", Pattern.TEXTBOX, "link to the page");
testElement("value", "active", Pattern.RADIOBUTTON, "Filter using SafeSearch");
testElement("value", "off", Pattern.RADIOBUTTON, "No filtering");
testElement("name", "lr", Pattern.LISTBOX, "Arabic");
testElement("name", "num", Pattern.LISTBOX, "10 results");

var domainListbox = testElement("name", "as_dt", Pattern.LISTBOX, "domain");
testElement("value", "i", Pattern.LISTITEM, "only", domainListbox);
testElement("value", "e", Pattern.LISTITEM, "don't", domainListbox);


// test searching with internal field names
testElement("name", "as_qdr", Pattern.LISTBOX, "as_qdr");

// MIT home page
load("mit.html")
testElement("id", "people", Pattern.RADIOBUTTON, "People");
testElement("id", "offices", Pattern.RADIOBUTTON, "Offices");

// Google preferences
load("preferences.html")
testElement("value", "lang_ar", Pattern.CHECKBOX, "Arabic")
testElement("value", "lang_bg", Pattern.CHECKBOX, "Bulgarian")
testElement("value", "lang_tr", Pattern.CHECKBOX, "Turkish")
testElement("value", "xx-hacker", Pattern.LISTITEM, "Hacker")
testElement("name", "hl", Pattern.LISTBOX, "tips messages")

testCount(35, Pattern.CHECKBOX, "lr")

// test searching with context
var row = testCount(1, Pattern.TABLE, "6th");
testCount(1, Pattern.LINK, null, row);
testCount(0, Pattern.LISTBOX, null, row);
testCount(2, Pattern.RADIOBUTTON, null, row);
testCount(35,Pattern.CHECKBOX, null, row);
testCount(0, Pattern.BUTTON, null, row);

// Janus
load("janus.html")
testElement("value", "Log On", Pattern.BUTTON, "log on")


// Bug 137
load("bug137.html")
testElement("name", "textbox1", Pattern.TEXTBOX, "label1")
testElement("name", "textbox2", Pattern.TEXTBOX, "label2")
testElement("name", "textbox3", Pattern.TEXTBOX, "label3")
testElement("name", "textbox4", Pattern.TEXTBOX, "label4")
testElement("name", "textbox5", Pattern.TEXTBOX, "label5")
testElement("name", "textbox6", Pattern.TEXTBOX, "label6")

// Bug 140

load("hidden_inputs.html");
t.test("bug140 test", function() {
  var match;
  try {
    match = find("textbox");
    Test.assertEquals(match.count, 1, "num matches for enter('textbox'): " + match.count);
    Test.assertEquals(match.element.id, 'a', "did not match correct textbox");
  } catch (e) {
    Test.fail("Exception for enter('sometext'): " + e);
  }
});

// craigslist
// test regexp matching with subpatterns
load("craigslist.html"); 

t.test("craigslist", function() {
  // find headers like "services (34720)"
  var match = find(/(.*)\s+\((\d+)\)/);
  Test.assertEquals(8, match.count);
  Test.assertEquals(3, match.groups.length);
  Test.assertEquals("event calendar (2635)", match.groups[0]);
  Test.assertEquals("event calendar", match.groups[1]);
  Test.assertEquals("2635", match.groups[2]);
});


// moodle
load("moodle.html");
testElement("src", "/moodle/pix/f/web.gif",
            Pattern.IMAGE, "design by numbers");
testElement("src", "/moodle/pix/i/users.gif",
            Pattern.IMAGE, "Participants");



// umbrellabank
load("umbrellabank.html");
testElement("onmouseover", "MM_swapImage('personal_banking','','images/personal_banking_f2.gif',1);",
            Pattern.LINK, "personal banking");


// bug87
load("bug87.html");
testElement("name", "button1",
            Pattern.BUTTON, "personal banking");
testElement("name", "button2",
            Pattern.BUTTON, "certificates deposit");

// gmap
load("gmap.html")
testElement("name", "saddr",
            Pattern.TEXTBOX, "first")
testElement("name", "daddr",
            Pattern.TEXTBOX, "second")


// frames
load("frames.html");
testCount(1, Pattern.LINK, "Advanced Search");
testCount(19, null, "Link");
testElement("name", "as_epq", Pattern.TEXTBOX, "exact phrase");
testElement("value", "active", Pattern.RADIOBUTTON, "Filter using SafeSearch");
testCount(2, Pattern.LISTBOX, "Arabic");
testElement("value", "lang_tr", Pattern.CHECKBOX, "Turkish")
testElement("value", "xx-hacker", Pattern.LISTITEM, "Hacker")

load("frames2.html");
testCount(1, Pattern.LINK, "Advanced Search");
testCount(32, null, "Link");
testElement("name", "as_epq", Pattern.TEXTBOX, "exact phrase");
testElement("value", "active", Pattern.RADIOBUTTON, "Filter using SafeSearch");
testCount(2, Pattern.LISTBOX, "Arabic");
testElement("value", "lang_tr", Pattern.CHECKBOX, "Turkish")
testElement("value", "xx-hacker", Pattern.LISTITEM, "Hacker")


load("google-results.html");
testElement("href", "/search?q=hello&hl=en&start=10&sa=N",
            Pattern.LINK, "Next");

// Summarize testing
t.close();


///////////////
// internal methods
//

var fetched = null;

function load(file) {
  var url = prefix + file;
  if (useFetch) {
    fetched = fetch(url);
  } else {
    go(url);
  }
  
  // extract the basename of the filename and use
  // it as the test name
  testName = file.match(/^([^\.]*)(\.|$)/)[1]
}

function getDocument() {
  if (useFetch) {
    return fetched.document;
  } else {
    return document;
  }
}

  
function doFind(type, pattern, /*optional*/ context) {
  pattern = patternToString(type,pattern);

  if (context) {
    return context.find(pattern);
  } else if (useFetch) {
    return fetched.find(pattern);
  } else {
    return find(pattern);
  }
}

function testElement(attr,val,type,pattern, /*optional*/ context) {
  var m; 
  t.test(testName, function() {
    m = doFind(type,pattern,context);
    var matches = matchesToString(m);
    Test.assertEquals(m.count, 1, 
                    patternToString(type,pattern) + " matched " + m.count + " times:\n" + matches);

    var attrValue = m.element.getAttribute(attr);
    Test.assertEquals(val, attrValue, 
                    patternToString(type,pattern) + " matched " + attrValue + " instead of " + val + ":\n" + matches);
  });
  return m; 
}

function testCount(count,type,pattern, /*optional*/ context) {
  var m; 
  t.test(testName, function() {
    m = doFind(type, pattern, context);
    Test.assertEquals(count, m.count, 
                    patternToString(type,pattern) + " matched " + m.count + " times instead of " + count + ": \n" + matchesToString(m));
    Test.assertEquals(count > 0, m.hasMatch,
                    patternToString(type,pattern) + ".hasMatch==" + m.hasMatch + " but has " + m.count + " matches");
  });
  return m;
}



function patternToString(type,pattern) {
  if (!pattern) return type;
  else if (!type) return pattern;
  else return pattern + " " + type;
}

function matchesToString(m) {
  var sb = new StringBuffer();
  while (m.hasMatch) {
    sb.append(m.html + "\n");
    m = m.next;
  }
  return sb.toString();
}




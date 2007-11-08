Chickenfoot.debugRecorder = false;

var Test = Chickenfoot.Test;
var Pattern = Chickenfoot.Pattern;
var StringBuffer = Chickenfoot.StringBuffer;

var prefix = "file://" + scriptDir.path + "/pages/";

// if useFetch is true, testing happens in the background, using fetch().
// otherwise, uses go().
var useFetch = false;

// in order to use forms[0].inputName syntax, we have to get a
// reference to the real document, not the XPCNativeWrapped document
function getDocument() {
  return (document.wrappedJSObject) ? document.wrappedJSObject : document;
}


///////////////////////////////////
// tests

var t = new Test();

var testName;  // name of current test, inferred from load() argument

// google-advanced-search
load("google-advanced_search.html");
testRecord(getDocument().forms[0].as_ft, "change");    // uses xpath, generated command was: pick("File Format listbox", "Only")
testRecord(getDocument().forms[0].as_dt, "change");    
testRecord(getDocument().forms[0].g.btnG, "click");    // uses xpath, generated command was: click("first Search button")

// preferences
load("preferences.html");
testRecord(getDocument().forms[0].lr.item(10), "change");  // uses xpath, generated command was: uncheck("Estonian")
testRecord(getDocument().forms[0].safe.item(0), "change");

// google
load("google.html");
testRecord(getDocument().forms[0].btnG, "click"); 
testRecord(getDocument().forms[0].q, "change"); 

// guided news
load("guidedNews.html");
testRecord(getDocument().forms[0].T1, "change");  // uses xpath, generated command was: enter("Step One: Select a news category -- Entry Required Step Two: Select a news source -- Entry Required Source List Step Three: Enter search terms -- Entry Required", "")
testRecord(getDocument().forms[0].S4, "change");  // uses xpath, generated command was: pick("fourth in listbox", "and")
testRecord(getDocument().forms[0].T2, "change");
testRecord(getDocument().forms[0].S3, "change");  // uses xpath, generated command was:  pick("third in listbox", "Headline, Lead Paragraph(s), Terms")
testRecord(getDocument().forms[0].date.item(0), "change");  // uses xpath, generated command was: check("first From:")
testRecord(getDocument().forms[0].frm_rng, "change");  // uses xpath, generated command was: enter("From:", "")

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

function testRecord(/*DOM node*/ target, /*string*/ eventType) {
    t.test(testName, function() {
        if (target == null || target == "undefined") {
            Test.assertEquals(1, 0, testName + " - invalid argument");
            return;
        }     
        
        var result = 1;
        var command;
        
        try {
            command = Chickenfoot.generateChickenfootCommand(target, eventType);
        }
        catch (e) {
            result = 0;
        }
        output(command);
        Test.assertEquals(result, 1, testName + " - " + target.name + " returned error: " + command);
        
        /*var m = Chickenfoot.interpretKeywordCommand(target.ownerDocument, command);   
        var matchedNode = m[0].node.nodeName == "OPTION" ? m[0].node.parentNode : m[0].node;
    	if (m.length == 0 || matchedNode != target) result = 0;
    	
    	Test.assertEquals(result, 1, testName + " - keyword command matched wrong node: " + matchedNode.nodeName);*/
    });
}





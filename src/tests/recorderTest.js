Chickenfoot.debugRecorder = false;

var Test = Chickenfoot.Test;
var Pattern = Chickenfoot.Pattern;
var StringBuffer = Chickenfoot.StringBuffer;

var prefix = "file://" + scriptDir.path + "/pages/";

// if useFetch is true, testing happens in the background, using fetch().
// otherwise, uses go().
var useFetch = false;

function gelid(id) {
  return document.getElementById(id);
}

///////////////////////////////////



// tests




var t = new Test();

var testName;  // name of current test, inferred from load() argument




// google-advanced-search



load("google-advanced_search.html");
testRecord(gelid("as_ft"), "change");    // uses xpath, generated command was: pick("File Format listbox", "Only")
testRecord(gelid("as_dt"), "change");    
testRecord(gelid("btnG"), "click");    // uses xpath, generated command was: click("first Search button")




// preferences
load("preferences.html");
testRecord(gelid("lr10"), "change");  // uses xpath, generated command was: uncheck("Estonian")
testRecord(gelid("stf"), "change");

// google



load("google.html");
testRecord(gelid("btnG"), "click"); 
testRecord(gelid("q"), "change"); 

// guided news



load("guidedNews.html");
testRecord(gelid("T1"), "change");  // uses xpath, generated command was: enter("Step One: Select a news category -- Entry Required Step Two: Select a news source -- Entry Required Source List Step Three: Enter search terms -- Entry Required", "")



testRecord(gelid("S4"), "change");  // uses xpath, generated command was: pick("fourth in listbox", "and")



testRecord(gelid("T2"), "change");
testRecord(gelid("S3"), "change");  // uses xpath, generated command was:  pick("third in listbox", "Headline, Lead Paragraph(s), Terms")



testRecord(gelid("date"), "change");  // uses xpath, generated command was: check("first From:")



testRecord(gelid("frm_rng"), "change");  // uses xpath, generated command was: enter("From:", "")




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
        //output(command);



        Test.assertEquals(result, 1, testName + " - " + target.name + " returned error: " + command);
    });
}




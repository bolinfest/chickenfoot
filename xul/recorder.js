const CF_ACTION_HISTORY_ID = "CF_DEBUG";
const CF_ACTION_HISTORY_TAB = "CF_DEBUG_TAB";

function startRecording() {
  // set recordingCheckbox
  var cbox = document.getElementById('recordingCheckbox');
  cbox.checked = isRecording();

  recordFromWindow(Chickenfoot.getTabBrowser(chromeWindow));
}

function stopRecording() {
  stopRecordingFromWindow(Chickenfoot.getTabBrowser(chromeWindow));
}

function isRecording() {
  var prefs = Chickenfoot.getPrefBranch();
  try {
    return prefs.getBoolPref("recordActions");
  } catch (e) {
    var defaultValue = false;
    prefs.setBoolPref("recordActions", defaultValue);
    return defaultValue;
  }
}

function setRecording(/*boolean*/ on) {
  Chickenfoot.getPrefBranch().setBoolPref("recordActions", on);
  
  if (on) startRecording();
  else stopRecording();
}

function recordFromWindow(/*HtmlWindow*/ win) {
  win.addEventListener('click', recordAction, true);
  win.addEventListener('change', recordAction, true);
  win.addEventListener('load', recordAction, true);
}

function stopRecordingFromWindow(/*HtmlWindow*/ win) {
  win.removeEventListener('click', recordAction, true);
  win.removeEventListener('change', recordAction, true);
  win.removeEventListener('load', recordAction, true);
}

function recordAction (event) {
    doRecordAction(event.explicitOriginalTarget, event.type);
}

function doRecordAction(node, type) {
    if (!isRecording()) return;
    
    if (type == "click" && node.nodeName == "tabbrowser") return;
    
    //if (type == "click" && !Chickenfoot.shouldGenerateClickCommand(node)) return;

    try {
        var result = Chickenfoot.generateChickenfootCommand(node, type);      
        recordMatch(result);
    }
    catch (e) {
    	try {
        	var result = Chickenfoot.generateChickenfootCommand(node, type);
        	recordMatch(result);
        }
        catch (e2) {
        	debug(e2.message);
        	recordError(e2.message);
        }
    }
    
    return;
}

function recordMatch(/*String*/ record) {
    if (record == "") return;
    text = "<tag class=actions><i>" + record + "</i></tag>";
    printAction(text, true);
}

function recordError(/*String*/ error) {
    text = "<tag class=actionError><i>" + error + "</i></tag>";
    printAction(text, true);
}

function removeTypes(/*String*/ record) {
    var types = new Array(" radiobutton", " checkbox", " textbox", " listitem", " listbox");

    for (var i=0; i<types.length; i++) {
        record = record.replace(types[i], "");
    }
    
    return record;
}

function printAction(/*String*/ text, /*boolean*/ html){
  if (html == null) {
      Chickenfoot.printDebug(chromeWindow, text, true, false, CF_ACTION_HISTORY_ID);
  }
  else {
      Chickenfoot.printDebug(chromeWindow, text, true, html, CF_ACTION_HISTORY_ID);
  }
}


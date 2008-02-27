var global_context;


function evaluate(/*ChromeWindow*/ chromeWindow,
                  /*String*/ code,
                  /*boolean*/ displayResultInConsole,
                  /*optional HtmlWindow*/ win,
                  /*extra context*/ extraContext,
                  /*optional nsIFile*/ sourceDir,
                  /*optional function*/ feedbackHandler) {
  enableStopButton(chromeWindow);
  if (!win) win = getVisibleHtmlWindow(chromeWindow);
  if (displayResultInConsole) {
    startNewDebug(chromeWindow);
  }

  // Create a fresh Javascript exeuction context using
  // a temporary iframe.
  // Start by making a hidden iframe attached to the chrome window,
  // loaded with the chickenscratch evaluation XUL.
  var doc = chromeWindow.document;
  var root = doc.documentElement;
  var frame = doc.createElement("iframe");
  frame.setAttribute("collapsed", "true");
  frame.setAttribute("src", "chrome://@EXTENSION_NAME@/content/chickenscratch.xul");  
  root.appendChild(frame);
  
  // have to wait for the new iframe to finish loading before we can
  // use its JS context.
  var frameWin = frame.contentWindow;
  frameWin.addEventListener("load", loaded, false);
  
  function loaded() {
    // Defer running the user's code, because we're currently blocked
    // in a network handling thread.  If we try to run the user's code
    // right here, it will hang when trying to get the current document.
    frameWin.setTimeout(readyToEvaluate, 0);
  }
  
  function readyToEvaluate() {
    // grab the evaluation function from the new evaluation context
    var chickenscratchEvaluate = frameWin.chickenscratchEvaluate;
    
    // Now that we have the new Javascript execution context, destroy the frame.
    // We do this *before* evaluating the user's code, rather than *after*,
    // because destroying the frame clears its global object of 
    // all user-defined identifiers.  We don't want to destroy any
    // identifiers put there by the user's code, in case the user registered
    // event handlers that require them and that will stick around after the
    // evaluation.  As long as we hold a reference to something in the JS
    // execution context, it will continue to stay around.
    root.removeChild(frame);

    // create the Chickenfoot evaluation context
    var context = getEvaluationContext({}, chromeWindow, win, chickenscratchEvaluate, sourceDir, feedbackHandler);
    for (var k in extraContext) {
        context[k] = extraContext[k]
    }
    global_context = context;
    try {
      checkForStop();      
      var result = chickenscratchEvaluate(context, code);
      if (result !== undefined && displayResultInConsole) {
        printDebug(chromeWindow, result);
      }
      disableStopButton(chromeWindow);
    } catch (e) {
      debug(e);
      disableStopButton(chromeWindow);
      throw e; // this ensures that the exception appears in the Javascript console
    }
  }
}

/**
 * Return an object containing the properties and commands 
 * that Chickenscratch scripts can call.
 */ 
function getEvaluationContext(/*Object*/ context,
                              /*ChromeWindow*/ chromeWindow,
                              /*HtmlWindow*/ win,
                              /*EvaluatorFunction*/ chickenscratchEvaluate,
                              /*nsIFile*/ sourceDir,
                              /*function*/ feedbackHandler) {
// In theory, we could add these properties and commands directly to the
// fresh global object created by evaluate().  In practice, we can't,
// because at least one property (location) is protected by that global
// object, throwing an exception if you try to replace it.  So we create
// a fresh object for the Chickenfoot command space and use eval.call()
// to make sure it's in scope when the user's script is evaluated.

  // getters for important objects
  context.window getter= function getWindow() { return win; };
  context.document getter= function getDocument() { return getLoadedHtmlDocument(win); };
  context.chromeWindow getter= function getChromeWindow() { return chromeWindow; };
  context.tab getter= function getTab() { return new Tab(win); };
  context.scriptDir = sourceDir; //is an nsIFile object for the script file
  context.scriptURL = null;
  context.scriptNamespace = null;
  context.__feedbackHandler = feedbackHandler;
  
  // delegate to properties of window
  context.location getter= function() { return win.location; };
  context.frames getter= function() { return win.frames; };
  context.frameElement getter= function() { return win.frameElement; };
  context.history getter= function() { return win.history; };
  context.screen getter= function() { return win.screen; };

  context.fullScreen getter= function() { return win.fullScreen; };
  context.fullScreen setter= function(msg) { win.fullScreen = msg; };
  context.status getter= function() { return win.status; };
  context.status setter= function(msg) { win.status = msg; };
  context.defaultStatus getter= function() { return win.defaultStatus; };
  context.defaultStatus setter= function(msg) { win.defaultStatus = msg; };
  context.navigator getter= function() { return win.navigator; };

  // delegate to methods of window
  context.alert = function() { return win.alert.apply(win, arguments); };
  context.atob = function() { return win.atob.apply(win, arguments); };
  context.back = function() { return win.back.apply(win, arguments); };
  context.btoa = function() { return win.btoa.apply(win, arguments); };
  context.close = function() { return win.close.apply(win, arguments); };
  context.confirm = function() { return win.confirm.apply(win, arguments); };
  context.forward = function() { return win.forward.apply(win, arguments); };
  context.getComputedStyle = function() { return win.getComputedStyle.apply(win, arguments); };
  context.home = function() { return win.home.apply(win, arguments); };
  context.open = function() { return win.open.apply(win, arguments); };
  context.openDialog = function() { return win.openDialog.apply(win, arguments); };
  context.opener = function() { return win.opener.apply(win, arguments); };
  context.print = function() { return win.print.apply(win, arguments); };
  context.prompt = function() { return win.prompt.apply(win, arguments); };
  context.stop = function() { return win.stop.apply(win, arguments); };

  // delegate to chromeWindow for these methods, because
  // window clears them every time a new page is visited
  context.setInterval = function() { return chromeWindow.setInterval.apply(chromeWindow, arguments); };
  context.setTimeout = function() { return chromeWindow.setTimeout.apply(chromeWindow, arguments); };
  context.clearInterval = function() { return chromeWindow.clearInterval.apply(chromeWindow, arguments); };
  context.clearTimeout = function() { return chromeWindow.clearTimeout.apply(chromeWindow, arguments); };

  // core client-side Javascript classes
  context.Packages getter= function() { return chromeWindow.Packages; };
  context.java getter= function() { return chromeWindow.java; };
  context.Node getter= function() { return chromeWindow.Node; };
  context.NodeFilter getter= function() { return chromeWindow.NodeFilter; };
  context.Document getter= function() { return chromeWindow.Document; };
  context.DocumentFragment getter= function() { return chromeWindow.DocumentFragment; };
  context.DOMParser getter= function() { return chromeWindow.DOMParser; };
  context.Element getter= function() { return chromeWindow.Element; };
  context.Range getter= function() { return chromeWindow.Range; };
  context.XPathResult getter= function() { return chromeWindow.XPathResult; };
  context.XMLHttpRequest getter= function() { return chromeWindow.XMLHttpRequest; };
  context.Components getter= function() { return chromeWindow.Components; };
  
  // Chickenfoot commands
  context.go = function go(url, reload) { goImpl(win, url, reload); };
  context.fetch = function fetch(url) { return openTabImpl(chromeWindow, url, false, true); };
  context.reload = function reload() { win.location.reload(); };
  
  context.find = function find(pattern) { return Pattern.find(context.document, pattern); };
  context.click = function click(pattern) { clickImpl(context.document, pattern, chromeWindow, undefined, context.__feedbackHandler); };
  context.enter = function enter(pattern,value) { enterImpl(context.document, pattern, value, undefined, context.__feedbackHandler); };
  context.keypress = function keypress(keySequence, destination) { keypressImpl(context.document, keySequence, destination); };
  context.pick = function pick(listPattern,choicePattern,checked) { pickImpl(context.document, arguments, undefined, context.__feedbackHandler); };
  context.unpick = function unpick(listPattern,choicePattern,checked) { unpickImpl(context.document, arguments, context.__feedbackHandler); };
  context.check = function check(pattern) { checkImpl(context.document, pattern, undefined, context.__feedbackHandler); };
  context.uncheck = function uncheck(pattern) { uncheckImpl(context.document, pattern, undefined, context.__feedbackHandler); };
  context.reset = function reset(pattern) { resetImpl(context.document, pattern); };
  
  context.insert = function insert(pattern, chunk) { return insertImpl(context.document, pattern, chunk); };
  context.remove = function remove(pattern) { return removeImpl(context.document, pattern); };
  context.replace = function replace(pattern, chunk) { return replaceImpl(context.document, pattern, chunk); };

  context.onClick = function onClick(pattern, handler) { return onClickImpl(context.document, pattern, handler); };
  context.onKeypress = function onKeypress(pattern, handler, destination) { return onKeypressImpl(context.document, pattern, handler, destination); };
  
  context.savePage = function savePage(saveLocationOrName) { savePageImpl(chromeWindow, context.document,  saveLocationOrName); };
  context.savePageComplete = function savePageComplete(saveLocationOrName) { savePageCompleteImpl(chromeWindow, context.document, saveLocationOrName); };
  context.printPage = function printPage(printerName) { printPageImpl(chromeWindow, printerName); };
  
  // file io (deprecated -- users should now include fileio.js)
  context.read = function read(filename) { throw "need to include(\"fileio.js\") before calling read" };
  context.write = function write(filename, data) { throw "need to include(\"fileio.js\") before calling write" };
  context.append = function append(filename, data) { throw "need to include(\"fileio.js\") before calling append" };
  context.exists = function exists(filename) { throw "need to include(\"fileio.js\") before calling exists" };

  //password manager operators
  context.addPassword = function(hostname, username, password, formSubmitURL, usernameField, passwordField) {return addPasswordImpl(hostname, username, password, formSubmitURL, usernameField, passwordField); };
  context.removePassword = function(hostname, username) {return removePasswordImpl(hostname, username); };  
  context.addPassword = function(retrievedEntry, hostname, formSubmitURL, username) {return retrievePasswordImpl(retrievedEntry, hostname, formSubmitURL, username); };
  
  // pattern operators
  context.before = function before(pattern) { return beforeImpl(context.document, pattern); };
  context.after = function after(pattern) { return afterImpl(context.document, pattern); };

  context.output = function output() { 
    for (var i = 0; i < arguments.length; ++i) {
      printDebug(chromeWindow, arguments[i]); 
    }
  };
  context.clear = function clear() { clearDebugPane(chromeWindow); };
  context.list = function list(obj, opt_regexp) { printDebug(chromeWindow, listImpl(obj, opt_regexp)); };
  context.include = function include(path, opt_namespace) { return includeImpl(path, chickenscratchEvaluate, context, opt_namespace, context.scriptDir); };
  context.localUrl = function localUrl(url) { return localUrlImpl(url); };

  context.openTab = function openTab(url, show) { return openTabImpl(chromeWindow, url, show); };

  context.Chrome = function openChrome(cwin) { return new Chrome(cwin ? cwin : chromeWindow); };
  context.chrome getter = function getChrome() { return new Chrome(chromeWindow); };

  context.wait = function wait(tabs) { return waitImpl(chromeWindow, tabs, true); };
  context.ready = function ready(tabs) { return waitImpl(chromeWindow, tabs, false); };
  context.sleep = sleep;
  
  context.whenLoaded = function whenLoaded(func, win) { 
    return whenLoadedImpl(chromeWindow, func, win); 
  };
  
  // constructors
  context.Link = Link;
  context.Button = Button;
  context.TC = TC;    
  context.XPath = XPath;
  
  // internal access to Chickenfoot code
  context.Chickenfoot = Chickenfoot;
  context.chickenscratchEvaluate = chickenscratchEvaluate;
  // global space for sharing data between script runs
  context.global getter = function getGlobal() { return global; };
  
  return context;
}


// If true, running Chickenfoot scripts will be interrupted.
// This may take some time, so it's good to set this to true
// for some interval before setting it back to false.
var stoppingAllScripts = false;

// called periodically by Chickenfoot commands to check whether the user
// wants to interrupt the script.  Throws an exception if so.
function checkForStop() {
  if (stoppingAllScripts) throw new UserStopped();
}

// called by frontend when user presses Stop button.
function stopAllScripts(/*ChromeWindow*/ chromeWindow) {
  stoppingAllScripts = true;
  chromeWindow.setTimeout(function() { 
      stoppingAllScripts = false; 
      disableStopButton(chromeWindow, true);
  }, 500);
}

function UserStopped() {
}
UserStopped.prototype.toString = function() { return "Script cancelled: user pressed Stop button"; }

// number of scripts currently in progress
var scriptsRunning = 0;

function enableStopButton(/*ChromeWindow*/ chromeWindow) {
  ++scriptsRunning;
  setStopButtonEnabled(chromeWindow, true);
}

function disableStopButton(/*ChromeWindow*/ chromeWindow, /*optional boolean*/allScriptsStopped) {
  if (allScriptsStopped) scriptsRunning = 0;
  else --scriptsRunning;
  
  if (!scriptsRunning) setStopButtonEnabled(chromeWindow, false);
}

function setStopButtonEnabled(/*ChromeWindow*/ chromeWindow, /*boolean*/ enabled) {
  var sbwin = getSidebarWindow(chromeWindow);
  if (!sbwin) return; // Chickenfoot sidebar isn't open
  
  var stopButton = sbwin.document.getElementById("cfStopButton");
  if (!stopButton) return;
  
  stopButton.disabled = !enabled;
}

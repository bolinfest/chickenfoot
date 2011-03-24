/*
 * Chickenfoot end-user web automation system
 *
 * Copyright (c) 2004-2007 Massachusetts Institute of Technology
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Chickenfoot homepage: http://uid.csail.mit.edu/chickenfoot/
 */

/**
 * Chickenfoot: a reference to this XPCOM's global namespace.
 * This is the object that will actually be returned when
 * somebody asks for the wrappedJSObject of the Chickenfoot XPCOM service.
 * 
 * By convention, all XUL or XPCOM code will define this Chickenfoot variable.
 * So if a class or function "F" is defined at the top level in the XPCOM, 
 * it can be referenced from anywhere (XUL or XPCOM land) by simply
 * Chickenfoot.F.
 *
 * Examples: 
 *    Chickenfoot.StringBuffer
 *    Chickenfoot.evaluate()
 *    Chickenfoot.gTriggerManager
 */
var Chickenfoot = this;

// The substitution pattern appears in a quoted string so that this code is
// syntactically correct JavaScript without compilation.
var isExportedXpi = ('yes' === '@IS_EXPORTED_XPI@');

// Global variables
var gTriggerManager;
var global = {}; // user's global variable space

// These classes are not provided in the XPCOM JS environment by default.  So we have
// to get them from the first chrome window's Javascript environment.
// Some of these classes are used by the LAPIS-Chickenfoot bridge, so before you prune
// this list of dead references, make sure they're not used in LAPIS-Chickenfoot either.
var Node;
var NodeFilter;
var Document;
var DocumentFragment;
var DOMParser;
var Element;
var Range;
var XPathResult;
var XMLHttpRequest;
var XULDocument;
var XULElement;

// Initialize the Chickenfoot service.
// This function runs when the Chickenfoot XPCOM service is first requested.
// It can call other parts of Firefox, other XPCOM components, but it doesn't
// have access to any chrome windows.  (Defer window-specific initialization
// to setupWindow(), below).
function setupService() {
  gTriggerManager = new TriggerManager();
  
  // grab a reference to the command-line handler
  chickenfootCommandLineHandler = null
  if (!isExportedXpi) {
    chickenfootCommandLineHandler =
      Components.classes["@uid.csail.mit.edu/ChickenfootCommandLineHandler/;1"].
      getService(Components.interfaces.nsISupports).wrappedJSObject
  }
}

/**
 *  Set up a new chrome window for Chickenfoot.
 *  Called by Chickenfoot's overlay whenever a new Firefox window
 *  appears.
 */
function setupWindow(/*ChromeWindow*/ window) {
  if (!Document) {
      Node = window.Node;
      NodeFilter = window.NodeFilter;
      Document = window.Document;
      DocumentFragment = window.DocumentFragment;
      DOMParser = window.DOMParser;
      Element = window.Element;
      Range = window.Range;
      XMLHttpRequest = window.XMLHttpRequest;
      XPathResult = window.XPathResult;
      XULDocument = window.XULDocument;
      XULElement = window.XULElement;
  }
    
  addTriggerListener(window);
  
  //add a load listener for the install trigger button script, making it a built-in trigger
  var browser = getTabBrowser(window);  
  browser.addEventListener("load", triggerListener, true);
  function triggerListener(event) {
    //if listener is fired for loading a xul document, then ignore it
    var doc = event.originalTarget;
    var win = doc.defaultView;
    if(doc.location == null) { return; }
    
    //if not at the chickenfoot scripts wiki, then ignore it
    if(doc.location.wrappedJSObject.href.match(/http:\/\/groups.csail.mit.edu\/uid\/chickenfoot\/scripts\/index.php\/*/) != null) {
      Chickenfoot.installTriggerButtons(doc);
    }
  }
  
}


/******************************************************************************/

// Cannot use Components.utils.import() as written in the sample documentation
// because "import" is a reserved word, so it is rejected by the Closure Compiler.
Components.utils['import']('resource://gre/modules/XPCOMUtils.jsm');


/**
 * @constructor
 */
var ChickenfootService = function() {
  this.wrappedJSObject = Chickenfoot;
  setupService();
};


/** @type {nsJSID} */
ChickenfootService.prototype.classID = Components.ID("{@CHICKENFOOT_GUID@}");


/** @type {Function} */
ChickenfootService.prototype.QueryInterface =
    XPCOMUtils.generateQI([Components.interfaces.nsIChickenfoot]);


// From https://developer.mozilla.org/en/XPCOM/XPCOM_changes_in_Gecko_2.0.
var NSGetFactory, NSGetModule;
if (XPCOMUtils.generateNSGetFactory) {
  // Firefox 4.0 and later.
  NSGetFactory = XPCOMUtils.generateNSGetFactory([ChickenfootService]);
} else {
  // Firefox 3.0-3.6.
  NSGetModule = XPCOMUtils.generateNSGetModule([ChickenfootService]);
}

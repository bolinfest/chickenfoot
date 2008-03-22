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

var isExportedXpi = @IS_EXPORTED_XPI@;

// Function.bind and Function.bindAsEventListener are added to support prototype.js
//
// Apparently, adding properties to Function.prototype does not add the properties
// to functions defined in a Chickenscratch script, which is why these properties
// are added at the XPCOM level instead.
//
// TODO: find a cleaner way to integrate prototype.js with Chickenfoot

Function.prototype.bind = function() {
  function $A(iterable) {
    var results = [];
    for (var i = 0; i < iterable.length; i++)
      results.push(iterable[i]);
    return results;
  }
  var __method = this, args = $A(arguments), object = args.shift();
  return function() {
    return __method.apply(object, args.concat($A(arguments)));
  }
}

Function.prototype.bindAsEventListener = function(object) {
  var __method = this;
  return function(event) {
    return __method.call(object, event || window.event);
  }
}


// Global variables
var gTriggerManager;
var global = {}; // user's global variable space

// These classes are not provided in the XPCOM JS environment by default.  So we have
// to get them from the first chrome window's Javascript environment.
// Some of these classes are used by the LAPIS-Chickenfoot bridge, so before you prune
// this list of dead references, make sure they're not used in LAPIS-Chickenfoot either.
var Packages;
var java;
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

/** @return true if Firefox has Java 1.5 or later installed (has the side effect of loading Java if Java is installed) */
function hasJava() {
  try {
    // first we try calling a benign java function,
    // which should throw an exception if Java is disabled or not installed
    var a = Packages.java.lang.String.valueOf(5)
    
    // now that we're sure Java is available,
    // we want to make sure it's the correct version
    var version = Packages.java.lang.System.getProperty('java.vm.version').match(/^(\d+)\.(\d+)/);
    var max = parseInt(version[1], 10);
    var min = parseInt(version[2], 10);
    if (max > 1 || (max === 1 && min >= 5)) {
      return true;    
    } else {
      return false;
    }
  } catch (e) {
    return false
  }
}

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
      Packages = window.Packages;
      java = window.java;
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
  
/*
  //add a load listener for the install trigger button script, making it a built-in trigger
  var browser = getTabBrowser(window);  
  browser.addEventListener("load", triggerListener, true);
  function triggerListener(event) {    
    var doc = event.originalTarget;
    var win = doc.defaultView;
    evaluate(window, "Chickenfoot.installTriggerButtons(document);", false, win, null, null);
  }
*/  
}


/******************************************************************************/

const CLASS_ID    = Components.ID("{@CHICKENFOOT_GUID@}");
const CLASS_NAME  = "Chickenfoot";
const CONTRACT_ID = "@CHICKENFOOT_CONTRACT_ID@";

function ChickenfootService() {
  this.wrappedJSObject = Chickenfoot;
  setupService();
}


// The only interface we support is nsISupports.
// All the action happens through wrappedJSObject.
ChickenfootService.prototype.QueryInterface = function(iid) {
  if (!iid.equals(Components.interfaces.nsISupports))
    throw Components.results.NS_ERROR_NO_INTERFACE;
  return this;
}


/* gModule implements Components.interfaces.nsIModule */
var gModule = {

  _firstTime : true,

  _factory : {
      createInstance: function (aOuter, aIID) {
        if (aOuter != null) throw Components.results.NS_ERROR_NO_AGGREGATION;
        return new ChickenfootService().QueryInterface(aIID);
      }
  },

  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
    if (!this._firstTime) throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
    this._firstTime = false;
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID,
                                     CLASS_NAME,
                                     CONTRACT_ID,
                                     aFileSpec,
                                     aLocation,
                                     aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType) {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID) {
    if (!aIID.equals(Components.interfaces.nsIFactory)) {
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    }
    if (aCID.equals(CLASS_ID)) {
      return this._factory;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
  
};

function NSGetModule(aCompMgr, aFileSpec) { return gModule; }

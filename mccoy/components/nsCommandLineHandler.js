/*
//@line 38 "c:\mozilla\source\MOZILLA_1_9a8_RELEASE\mozilla\mccoy\components\src\nsCommandLineHandler.js"
*/

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function CommandLineHandler() {
}

CommandLineHandler.prototype = {
  handle: function(aCmdLine)
  {
    try {
      // Initialise the key service. Will prompt for password if there is one.
      var ks = Cc["@toolkit.mozilla.org/keyservice;1"].
               getService(Ci.nsIKeyService);
    }
    catch (e) {
      // Chances are the user cancelled the password dialog, either way it's bad
      throw Components.results.NS_ERROR_ABORT;
    }
  },
  
  helpInfo: "",
  
  classDescription: "McCoy Command Line Handler",
  contractID: "@mozilla.org/mccoy/mccoy-clh;1",
  classID: Components.ID("{2a349418-834c-43c7-a139-de34c0d97c97}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsICommandLineHandler]),
  _xpcom_categories: [{ category: "command-line-handler", entry: "x-mccoy" }]
};

function NSGetModule(compMgr, fileSpec)
  XPCOMUtils.generateModule([CommandLineHandler]);

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

const CLASS_ID    = Components.ID("@CHICKENFOOT_COMMAND_LINE_HANDLER_GUID@");
const CLASS_NAME  = "ChickenfootCommandLineHandler";
const CONTRACT_ID = "@uid.csail.mit.edu/ChickenfootCommandLineHandler/;1";

var runThese = []

ChickenfootCommandLineHandler = this
function ChickenfootCommandLineHandlerService() {
  this.wrappedJSObject = ChickenfootCommandLineHandler;
}
  
ChickenfootCommandLineHandlerService.prototype.helpInfo =
    "  -cf-run <filename>   Run <filename> as a Chickenfoot script.\n";
//  "<--- white space ----->Helpful text... new-line -->\n"

ChickenfootCommandLineHandlerService.prototype.handle = function(cmdLine) {
    
    function getFile(filename) {
        try {
            var file = cmdLine.resolveFile(filename)
            if (!file.exists()) {
                file = cmdLine.resolveFile(filename + ".js")
            }
            if (file.exists()) {
                return file
            }
        } catch (e) {
        }
    }
    
    while (true) {
        var startIndex = cmdLine.findFlag("cf-run", false)
        if (startIndex < 0) {
            startIndex = cmdLine.findFlag("cfrun", false)
        }
        if (startIndex < 0) {
            break
        }
        
        var curIndex = startIndex + 1
        
        var filename = cmdLine.getArgument(curIndex)
        if (!filename || filename.match(/^\-/)) {
            throw "Missing a filename after -cf-run."
        }
        if (filename.match(/^file:\/\//)) {
            filename = filename.substring(6)
        }
        var file = getFile(filename)
        if (!file) {
            throw "Can't find/use the file: " + filename
        }
        
        var args = []        
        curIndex = curIndex + 1        
        while (curIndex < cmdLine.length) {
            var arg = cmdLine.getArgument(curIndex)
            if (!arg || arg.match(/^\-/)) {
                break
            }
            args.push(arg)
            curIndex = curIndex + 1
        }
        
        cmdLine.removeArguments(startIndex, curIndex - 1)
        
        runThese.push({file : file, context : {command_line_args : args, arguments : args}})
    }
}

/******************************************************************************/

ChickenfootCommandLineHandlerService.prototype.QueryInterface = function(iid)
  {
    if (!iid.equals(Components.interfaces.nsICommandLineHandler) &&
        !iid.equals(Components.interfaces.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }

/* gModule implements Components.interfaces.nsIModule */
var gModule = {

  _firstTime : true,

  _factory : {
      createInstance: function (aOuter, aIID) {
        if (aOuter != null) throw Components.results.NS_ERROR_NO_AGGREGATION;
        return new ChickenfootCommandLineHandlerService().QueryInterface(aIID);
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
                                     
    var catMan = Components.classes["@mozilla.org/categorymanager;1"].
        getService(Components.interfaces.nsICategoryManager)
    catMan.addCategoryEntry(
        "command-line-handler",
        "m-chickenfoot",
        "@uid.csail.mit.edu/ChickenfootCommandLineHandler/;1",
        true,
        true);
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

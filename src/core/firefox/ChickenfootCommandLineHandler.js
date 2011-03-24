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


// Cannot use Components.utils.import() as written in the sample documentation
// because "import" is a reserved word, so it is rejected by the Closure Compiler.
Components.utils['import']('resource://gre/modules/XPCOMUtils.jsm');


ChickenfootCommandLineHandler = this;


/**
 * @constructor
 */
var ChickenfootCommandLineHandlerService = function() {
  this.wrappedJSObject = ChickenfootCommandLineHandler;
};


/** @type {nsJSID} */
ChickenfootCommandLineHandlerService.prototype.classID =
    Components.ID("@CHICKENFOOT_COMMAND_LINE_HANDLER_GUID@");


/** @type {Function} */
ChickenfootCommandLineHandlerService.prototype.QueryInterface =
    XPCOMUtils.generateQI([Components.interfaces.nsIChickenfootCommandLineHandler]);


/** @type {string} */
ChickenfootCommandLineHandlerService.prototype.helpInfo =
    "  -cf-run <filename>   Run <filename> as a Chickenfoot script.\n";
//  "<--- white space ----->Helpful text... new-line -->\n"

var runThese = []


ChickenfootCommandLineHandlerService.prototype.handle = function(cmdLine) {
    
  var getFile = function(filename) {
    try {
      var file = cmdLine.resolveFile(filename);
      if (!file.exists()) {
        file = cmdLine.resolveFile(filename + ".js");
      }
      if (file.exists()) {
        return file;
      }
    } catch (e) {
      // OK
    }
  };

  while (true) {
    var startIndex = cmdLine.findFlag("cf-run", false)
    if (startIndex < 0) {
      startIndex = cmdLine.findFlag("cfrun", false);
    }
    if (startIndex < 0) {
      break;
    }
    
    var curIndex = startIndex + 1;
    
    var filename = cmdLine.getArgument(curIndex);
    if (!filename || filename.match(/^\-/)) {
      throw "Missing a filename after -cf-run.";
    }
    if (filename.match(/^file:\/\//)) {
      filename = filename.substring(6);
    }
    var file = getFile(filename);
    if (!file) {
      throw "Can't find/use the file: " + filename;
    }
    
    var args = [];
    curIndex = curIndex + 1;        
    while (curIndex < cmdLine.length) {
      var arg = cmdLine.getArgument(curIndex);
      if (!arg || arg.match(/^\-/)) {
          break;
      }
      args.push(arg);
      curIndex = curIndex + 1;
    }
    
    cmdLine.removeArguments(startIndex, curIndex - 1);
    
    runThese.push({
        file: file,
        context: {
          command_line_args: args,
          arguments: args
        }});
  }
};


// From https://developer.mozilla.org/en/XPCOM/XPCOM_changes_in_Gecko_2.0.
var NSGetFactory, NSGetModule;
if (XPCOMUtils.generateNSGetFactory) {
  // Firefox 4.0 and later.
  NSGetFactory = XPCOMUtils.generateNSGetFactory([ChickenfootCommandLineHandlerService]);
} else {
  // Firefox 3.0-3.6.
  NSGetModule = XPCOMUtils.generateNSGetModule([ChickenfootCommandLineHandlerService]);
}

/**
 * include() evaluates a script file.
 *
 * @param href {string} Filename or URL to load.  Examples:
 *   "GoogleSearch.js"
 *   "dir/file.js"
 *   "c:\\Documents and Settings...\\file.js"
 *   "file:///c:/Documents and Settings.../file.js"
 *   "chrome://chickenfoot/..."
 *   "http://uid.csail.mit.edu/..."
 *
 * Relative files like "GoogleSearch.js" or "dir/file.js" are searched for in the
 * following locations, in order:
 *    1. the libraries built into Chickenfoot, such as fileio.js
 *    2. the directory containing the including script (the sourceDir parameter)
 *    3. the chickenfoot/ directory in the Firefox profile directory (which
 *       is where trigger scripts are stored)
 *    4. any directories listed in the chickenfoot.include_directories preference
 *       (separated by semicolons)
 *
 * Note that absolute filenames use the native path separators (backslash on Windows,
 * slash on other platforms)
 *
 * @param evaluationContext  Chickenscratch evaluation context of including script.
 *
 * @param optional namespace {string|object} The namespace in which top-level vars
 * and functions in the file will be defined.  There are a few options for this argument:
 * <ul>
 *  <li>If unspecified, then the Chickenscratch evaluation context will be used.
 *  <li>If a string, a new object with that name will be created in the Chickenscratch
 *    evaluation context and the file's top-level vars and functions will become 
 *    properties of that new object. If there is already an object with that name in 
 *    the Chickenscratch context, then it will be replaced.
 *  <li>If an object, then the file's top-level vars and functions will be defined as a
 *    property of that object.
 * </ul>
 * Warning: variables that are never declared with var will *always* end up in
 * the global environment, regardless of the namespace argument.  For example, if
 * file contains the code below:
 *         var x = 5;
 *         y = 6;
 * then x will be placed in the namespace object, but y will be placed in the global
 * environment.
 */
function includeImpl(/*string*/ fileName,
                 /*object*/ evaluationContext,
                 /*optional string|object*/ namespace) {

  // load script(s) specified by fileName
  var scripts = loadScripts(fileName);
  
  // create or use the scope specified by namespace 
  var scope = getScope(namespace);
  
  // evaluate the scripts in the scope and return the result
  return evaluateScripts(scripts, scope);
  
  //
  // The rest of this method consists of helper functions.
  //
  
  // A Script represents a script loaded from a file or URL.
  function Script(/*string*/ text, /*nsIFile*/ dir, /*nsIURL*/ url) {
    this.text = text;       //(string) content of the script
    this.scriptDir = dir;  //(nsIFile) the folder containing the script, or null if script is a URL
    this.scriptURL  = url; //(nsIURL) the URL of the script's folder
  }

  function loadScripts(/*String or nsIFile */fileName) /*returns Script[]*/ {
    // try nsIFile
    if (instanceOf(fileName, Components.interfaces.nsIFile)) {
      return [new Script(SimpleIO.read(fileName), fileName.parent, null)];
    }
    
    // try absolute URL
    if (fileName.match(/^(chrome|file|https?):\//)) {
      return [new Script(SimpleIO.read(fileName), null, makeURL(directoryOf(fileName)))];
    }

    // try absolute filename
    try {
      var file = Components.classes["@mozilla.org/file/local;1"].
    	    createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(fileName);
      return loadScripts(file);
    } catch (e) {
      //debug(e)
      //debug(fileName + " is not an absolute pathname");
    }

    // try the libraries that are bundled with Chickenfoot
    try {
      return loadScripts("chrome://@EXTENSION_NAME@/content/libraries/" + fileName);
    } catch (e) {
      //debug(e)
      //debug(fileName + " is not a builtin library");
    }
    
    // for exported packages, try the package's top-level folder
    if(isExportedXpi) {
      try {
        return loadScripts("chrome://@EXTENSION_NAME@/content/" + fileName);
      } catch (e) {
        //debug(e)
        //debug(fileName + " is not a packaged extension file");
      }
    }

    // try the directory of the including script
    if (evaluationContext.scriptDir) {
        try {
            return loadScripts(SimpleIO.toFile(fileName, evaluationContext.scriptDir));
        } catch (e) {
          //debug(e)
          //debug(fileName + " is not in  " + evaluationContext.scriptDir.path);
        }
    }
        
    // try the URL of the including script
    if (evaluationContext.scriptURL) {
        try {
            return loadScripts(evaluationContext.scriptURL.asciiSpec + "/" + fileName);
        } catch (e) {
          //debug(e)
          //debug(fileName + " is not in " + evaluationContext.scriptURL);
        }
    }
        
    // try Chickenfoot profile dir
    try {
        return loadScripts(SimpleIO.toFile(fileName, TriggerManager._getChickenfootProfileDirectory()));
    } catch (e) {
      //debug(e)
      //debug(fileName + " is not in chickenfoot/ dir");
    }
    
    // try folders on the include path
    var includePath = getIncludeDirectories();
    for (var i = 0; i < includePath.length; ++i) {
        try {
            return loadScripts(SimpleIO.toFile(fileName, includePath[i]));
        } catch (e) {
          //debug(e)
          //debug(fileName + " is not in " + includePath[i].path);
        }
    }

    // give up
    throw new Error("include: can't find " + fileName);
  }  
  
  function getScope(/*optional string | object*/ namespace) /* returns scope object*/ {
      if (!namespace) {
        return evaluationContext;
      }
      
      var scope;
      if (typeof namespace === 'string' 
          || instanceOf(namespace, String)) {
        scope = {};
        evaluationContext[namespace.toString()] = scope;
      } else if (typeof namespace == 'object') {
        scope = namespace;
      } else {
        throw new Error("second argument of include() should be a string or an object");
      }
      
      // initialize the scope with Chickenscratch identifiers
      return getEvaluationContext(
            scope, 
            evaluationContext.chromeWindow, 
            evaluationContext.window, 
            evaluationContext.chickenscratchEvaluate
      );
  }

  function evaluateScripts(/*Script[]*/scripts, /*object*/ scope) /* returns any object*/ {
      // Evaluate the code in the namespace.
      if (scope == evaluationContext) {
        // need to save and restore the scriptDir and scriptURL variables if the
        // included code shares the same context as the including code
        var originalDir = scope.scriptDir;
        var originalURL = scope.scriptURL;
      }    
      try {
        var retval;
        for (var i = 0; i < scripts.length; ++i) {
          var script = scripts[i];
          scope.scriptDir = script.scriptDir;
          scope.scriptURL = script.scriptURL; 
          retval = evaluationContext.chickenscratchEvaluate(scope, script.text);
        }
        return retval;
      } finally {     
        if (scope == evaluationContext) {
          // restore the script-specific variables
          scope.scriptDir = originalDir;
          scope.scriptURL = originalURL;
        }
      }
  }

  function makeURL(/*string*/ href) {
    var url = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
    url.spec = href;
    return url;
  }
  
  // Removes the last path entry from a URL string, turning e.g.
  // http://www.foo.com/bar.js into http://www.foo.com
  // Requires: href has a nonempty file path part
  function directoryOf(/*string*/ href) {
    return href.substring(0, href.lastIndexOf('/'));
  }

  function getIncludeDirectories() { 
    // name of preference that contains the user-directories
    var key = 'include_directories';
    // preference branch that contains the Chickenfoot prefs
    var branch = Components.classes['@mozilla.org/preferences-service;1'].
                            getService(Components.interfaces.nsIPrefService).
                            getBranch('chickenfoot.');
    if (!branch.prefHasUserValue(key)) return [];
    var path = branch.getCharPref(key);
    var dirNames = path.split(';');
    var dirs = [];
    for (var i = 0; i < dirNames.length; ++i) {
      dirs.push(SimpleIO.toFile(dirNames));
    }
    return dirs;
  }
    
}

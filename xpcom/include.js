/**
 * include() evaluates the specified file.
 *
 * @param fileName {string} The name of the file to load. This may be either an
 *   absolute path, such as "c:\\chickenfoot\\", or just a file name, such as
 *   "GoogleSearch.js". If it is the latter, then include() will look for the file
 *   in the user's chickenfoot profile directory. If the file cannot be found
 *   there, then it will check each directory, in order, listed in the
 *   chickenfoot.include_directories preference listed in about:config. If there
 *   are multiple directories, they should be separated by semicolons.
 *
 * @param chickenscratchEvaluate  Chickenscratch evaluation function
 *
 * @param evaluationContext  Chickenscratch evaluation context.
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
 *
 * @param optional sourceDir parent directory of the script doing the including.  If this parameter is
 *    provided, then relative fileName references are interpreted with respect to its
 *    sourceDir
 */
function includeImpl(/*string*/ fileName,
                 /*function(context,code)->result*/ chickenscratchEvaluate,
                 /*object*/ evaluationContext,
                 /*string|object*/ opt_namespace,
                 /*optional nsIFile*/ sourceDir) {

  //the return type of getCode()
  function Code() {
    this.state = 0;  //undefined if file not found, 0 if single file, 1 if multiple files, 2 is URL
    this.files = [];  //stores paths of files to be included if multiple files need to be included
    this.script = "";  //stores the content of the included script if single include
    this.scriptDir = null;  //nsIFile stores the folder containing the script if single include
  }
  
  function getCode(fileName) 
  {
    var code = new Code();
    // absolute chrome:// URL
    if (typeof fileName == 'string' && fileName.match(/^chrome:/)) {
      code.script = SimpleIO.getChromeContent(fileName);
      code.state = 2;
      code.scriptDir = fileName.substring(0, fileName.lastIndexOf('/'));
      return code;
    }

    // try the libraries that are bundled with Chickenfoot
    try {
      code.script = SimpleIO.getChromeContent("chrome://@EXTENSION_NAME@/content/libraries/" + fileName);
      code.state = 0;
      code.scriptDir = sourceDir; //behaves as if the script is run as part of current script
      return code;
    } 
    catch (e) {
    //do nothing
    }
    
    // if exportedXpi
    if(isExportedXpi) {
      try {
        var chromeName = "chrome://@EXTENSION_NAME@/content/" + fileName;
        code.script = SimpleIO.getChromeContent(chromeName);
        code.state = 2;
        code.scriptDir = chromeName.substring(0, chromeName.lastIndexOf('/'));
        return code;
      } 
      catch (e) {
      //do nothing
      }
    }
    // not a chrome URL -- try other files
    var file;
    try {
      file = Components.classes["@mozilla.org/file/local;1"].
    	    createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(fileName);
    } catch (e) {
      // will fail if fileName is not an absolute path;
      // ignore error and see if fileName is in include directories
    }
    
    //If the fileName is a url
    if (!SimpleIO.exists(file) && fileName.search('://') != -1) {
      if(fileName.substring(0,7) == "file://") {
      fileName = fileName.substring(7);
      return getCode(fileName);
      }
      else if((fileName.substring(0,7) == "http://") || 
              (fileName.substring(0,8) == "https://")) {
        var request = new XMLHttpRequest();
        var asynchronous = false;
        var scriptContent = null;
        request.open("GET", fileName, asynchronous);
        request.send(null);
        if (request.status == 200) {
          scriptContent = request.responseText;
        }
        else {
          throw new Error('include URL Error: ' + request.status + ' ' + request.statusText);
        }
        code.script = scriptContent;
        code.state = 2;
        code.scriptDir = fileName.substring(0, fileName.lastIndexOf('/'));
        return code;
      }
      else {
        throw new Error('The file could not be imported: ' + fileName);
      }
    }
    
    if (!SimpleIO.exists(file)) {
      var includeDirectories = new Array();
      var numDirs = 0;
      if(evaluationContext.scriptDir) {
        includeDirectories.push(evaluationContext.scriptDir);
        numDirs++;
      }
      includeDirectories.push(TriggerManager._getChickenfootProfileDirectory());
      numDirs++;
      includeDirectories = includeDirectories.concat(getIncludeDirectories());
      for (var i = 0; i < includeDirectories.length; ++i) {
        var dir;
        if (i < numDirs) {
          dir = includeDirectories[i].clone();
        } else {
          dir = Components.classes["@mozilla.org/file/local;1"].
  	              createInstance(Components.interfaces.nsILocalFile);
  	      dir.initWithPath(includeDirectories[i]);
        }
        try { 
          while(fileName.indexOf('/')!=-1){
            var leafStr = fileName.substring(0, fileName.indexOf('/'));
            fileName = fileName.substring(fileName.indexOf('/')+1);
            dir.append(leafStr);
          }
          
          if(fileName.indexOf('*') != -1) {
            //if filename contains a wildcard, then perform a search
            code.files = [];
            var searchStr = fileName;
            searchStr = makeRegEx(searchStr);
            var entries = dir.directoryEntries;
            var entryNode;
            while(entries.hasMoreElements()) {
              entryNode = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
              if(searchStr.test(entryNode.leafName) && entryNode.isFile()) {
                code.files.push(entryNode.path);
              }
            }
            code.state = 1;
            code.scriptDir = sourceDir;
            return code
          }
          
          dir.append(fileName);
          if (SimpleIO.exists(dir)) {
            file = dir;
            break;
          }
        } catch (e) {
          //do nothing
        }
      }
    }
    
        
    //if the parent directory if a URL
    if(!SimpleIO.exists(file) && typeof fileName == 'string' ){
      if(evaluationContext.scriptDir == null) {
        var parentURI = evaluationContext.scriptURL;
        var url = parentURI.asciiSpec + "/" + fileName;
        return getCode(url);
      }
    } 
    
    if(SimpleIO.exists(file)) {
      code.script = SimpleIO.read(file);
      code.scriptDir = file.parent;
      code.state = 0;
      return code
    } else {
      code.state = undefined;
      return code;
    }
  }
  var code = getCode(fileName); // the code returned by the file
  if (code.state === undefined) {
    throw new Error('The file ' + fileName + ' could not be found.');
  }
  else if (code.state == 1) {
    //if multiple files need to be included
    var originalNamespace = evaluationContext.scriptNamespace;
    var namespace = originalNamespace;
    
    if (opt_namespace) {
      if (typeof opt_namespace === 'string' 
          || instanceOf(opt_namespace, String)) {
        opt_namespace = opt_namespace.valueOf();
        namespace = {};
        evaluationContext[opt_namespace] = namespace;
      } else {
        namespace = opt_namespace;
      }
    }
    
    if(namespace) {
      evaluationContext.scriptNamespace = namespace;
      evaluationContext.scriptDir = code.scriptDir;
      var ret; //stores return value
      try {
        var func = "function () {for(var i=0; i < arguments[0].length; i++) {include(arguments[0][i], arguments[1]);}}";
        var multiInclude = chickenscratchEvaluate(evaluationContext, func);
        var ret = multiInclude(code.files, namespace);
      }
      finally {
        evaluationContext.scriptDir = sourceDir;
      }
      return ret;
    }
    else {
      var ret; //stores return value
      evaluationContext.scriptDir = code.scriptDir;
      try {
        var func = "function () {for(var i=0; i < lst.length; i++) {include(arguments[0][i]);}}";
        var multiInclude = chickenscratchEvaluate(evaluationContext, func);
        var ret = multiInclude(code.files);
      }
      finally {
        evaluationContext.scriptDir = sourceDir;
      }  
      return ret;
    }
  }
  else if(code.state==0) {
    // get namespace object
    var originalNamespace = evaluationContext.scriptNamespace;
    var originalDir = evaluationContext.scriptDir;
    var namespace = originalNamespace;
    
    if (opt_namespace) {
      if (typeof opt_namespace === 'string' 
          || instanceOf(opt_namespace, String)) {
        opt_namespace = opt_namespace.valueOf();
        namespace = {};
        evaluationContext[opt_namespace] = namespace;
      } else {
        namespace = opt_namespace;
      }
    }
    
    if(namespace) {
      evaluationContext.scriptNamespace = namespace;
      evaluationContext.scriptDir = code.scriptDir;
      var ret; //stores return value
      try {
        var closure = chickenscratchEvaluate(evaluationContext,
                                             "function() {return eval.call(arguments[0],arguments[1]);}");
        ret = closure(namespace, code.script);
      }
      finally {
        evaluationContext.scriptNamespace = originalNamespace;
        evaluationContext.scriptDir = originalDir;
      }
      return ret;
    } 
    else {
      var ret;
      evaluationContext.scriptDir = code.scriptDir;
      try {
        ret = chickenscratchEvaluate(evaluationContext, code.script);
      }
      finally {
        evaluationContext.scriptDir = originalDir;
      }
      return ret;
    }
  }
  else if(code.state == 2) {
    // get namespace object
    var originalNamespace = evaluationContext.scriptNamespace;
    var originalDir = evaluationContext.scriptDir;
    var namespace = originalNamespace;
    
    if (opt_namespace) {
      if (typeof opt_namespace === 'string' 
          || instanceOf(opt_namespace, String)) {
        opt_namespace = opt_namespace.valueOf();
        namespace = {};
        evaluationContext[opt_namespace] = namespace;
      } else {
        namespace = opt_namespace;
      }
    }
    
    if(namespace) {
      evaluationContext.scriptNamespace = namespace;
      evaluationContext.scriptDir = null;
      var url = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
      url.spec = code.scriptDir;
      var originalURL = evaluationContext.scriptURL;
      evaluationContext.scriptURL = url;
      var ret; //stores return value
      try {
        var closure = chickenscratchEvaluate(evaluationContext,
                                             "function() {return eval.call(arguments[0],arguments[1]);}");
        ret = closure(namespace, code.script);
      }
      finally {
        evaluationContext.scriptNamespace = originalNamespace;
        evaluationContext.scriptDir = originalDir;   
        evaluationContext.scriptURL = originalURL;
      }
      return ret;
    } 
    else {
      var ret;
      evaluationContext.scriptDir = null;
      var url = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
      url.spec = code.scriptDir;
      var originalURL = evaluationContext.scriptURL;
      evaluationContext.scriptURL = url;
      try {
        ret = chickenscratchEvaluate(evaluationContext, code.script);
      }
      finally {
        evaluationContext.scriptDir = originalDir;
        evaluationContext.scriptURL = originalURL;
      }
      return ret;
    }
  }
}
function getIncludeDirectories() { 
  var branch = getIncludeDirectories.PREF_BRANCH;
  if (!branch.prefHasUserValue(getIncludeDirectories.PREF_KEY)) return [];
  var dirs = branch.getCharPref(getIncludeDirectories.PREF_KEY);
  return dirs.split(';');
}

// name of preference that contains the user-directories
getIncludeDirectories.PREF_KEY = 'include_directories';

// preference branch that contains the Chickenfoot prefs
getIncludeDirectories.PREF_BRANCH = Components.classes['@mozilla.org/preferences-service;1'].
                      getService(Components.interfaces.nsIPrefService).
                      getBranch('chickenfoot.');
                      
function makeRegEx(/*string*/ str) {
  var escapes = "^$\\/()|?+[]{},.";
  var ch;
  for(var i=0; i < escapes.length; i++) {
    ch = "/\\" + escapes[i] + "/g";
    ch = eval(ch);
    str = str.replace(ch, "\\"+escapes[i]);
  }
  str = "/^" + str + "$/";
  ch = /\*/g;
  str = str.replace(ch, "(.*)");
  str = eval(str);
  return str;
}

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
 * fileName may be an absolute pathname, relative pathname, chrome url, normal url
 *  -accepts wildcards (*)
 *
 * @param chickenscratchEvaluate  Chickenscratch evaluation function
 *
 * @param evaluationContext  Chickenscratch evaluation context.
 *
 * @param optional namespace {string|object} The namespace in which top-level vars
 * and functions in the file will be defined.  There are a few options for this argument:
 *  -If unspecified, then the Chickenscratch evaluation context will be used.
 *  -If a string, a new object with that name will be created in the Chickenscratch
 *    evaluation context and the file's top-level vars and functions will become 
 *    properties of that new object. If there is already an object with that name in 
 *    the Chickenscratch context, then it will be replaced.
 *  -If an object, then the file's top-level vars and functions will be defined as a
 *    property of that object.
 *
 *    WARNING: variables that are never declared with var will *always* end up in
 *    the global environment, regardless of the namespace argument.  For example, if
 *    file contains the code below:
 *            var x = 5;
 *            y = 6;
 *    then x will be placed in the namespace object, but y will be placed in the global
 *    environment.
 *
 * @param optional sourceDir parent directory of the script doing the including.  If this parameter is
 *    provided, then relative fileName references are interpreted with respect to its
 *    sourceDir
 *
 * @return results of evaluating the last expression in the last file
 * @throws exception if file can't be found, downloaded, accessed, etc.
 */
function includeImpl(/*string*/ fileName,
                 /*function(context,code)->result*/ chickenscratchEvaluate,
                 /*object*/ evaluationContext,
                 /*string|object*/ opt_namespace,
                 /*optional nsIFile*/ sourceDir) {

  // get namespace object
  var originalNamespace = evaluationContext.scriptNamespace;
  var originalDir = evaluationContext.scriptDir;
  var originalURL = evaluationContext.scriptURL;
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

  var code = getCode(fileName); // the code returned by the file
  if (code.type === undefined) {
    throw new Error('The file ' + fileName + ' could not be found.');
  }
  
  else if (code.type == "FileCode") { //multiple files
    evaluationContext.scriptDir = code.scriptDir;
    var ret; //stores return value
    try {
      //call evaluate on each file stored in the code object's files array
      for(var i=0; i<code.files.length; i++) {
        var currentScript = SimpleIO.read(code.files[i]);
        if (namespace) { 
          evaluationContext.scriptNamespace = namespace;
          try {
            var closure = chickenscratchEvaluate(evaluationContext,
                                             "function() {return eval.call(arguments[0],arguments[1]);}");
            ret = closure(namespace, currentScript);
          }
          finally {
            evaluationContext.scriptNamespace = originalNamespace;
            evaluationContext.scriptDir = originalDir;
          }
        }
        else {
          try {
            ret = chickenscratchEvaluate(evaluationContext, currentScript);
          }
          finally {
            evaluationContext.scriptDir = originalDir;
          }
        }
      }
    }
    finally { evaluationContext.scriptDir = originalDir; }
    return ret;
  }
  
  else if (code.type == "URLCode") { //url or chrome file
    evaluationContext.scriptDir = null;
    var url = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
    url.spec = code.scriptDir;
    evaluationContext.scriptURL = url;
    var ret; //stores return value
  
    if(namespace) {
      evaluationContext.scriptNamespace = namespace;
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

//FileCode constructor
  function FileCode(/*Array*/files, /*nsIFile*/scriptDir) {
    this.files = files;  //stores paths of files to be included if multiple files need to be included
    this.scriptDir = scriptDir;  //nsIFile stores the folder containing the script if single include
    if (files === undefined) {
      this.type = undefined;
    }
    else {
      this.type = "FileCode";
    }
  }
  
  //URL Code constructor
  function URLCode(/*String*/script, /*nsIFile*/scriptDir) {
    this.script = script;
    this.scriptDir = scriptDir;
    this.type = "URLCode";
  }  


//-------getCode function
//returns appropriate Code object
//takes fileName string  
  function getCode(fileName) {

    // absolute chrome:// URL
    if (typeof fileName == 'string' && fileName.match(/^chrome:/)) {
    return new URLCode(SimpleIO.getChromeContent(fileName), fileName.substring(0, fileName.lastIndexOf('/')));
    }

    //---- not a chrome URL -- try other files
    
    //check if fileName is absolute path
    var file;
    try {
      file = Components.classes["@mozilla.org/file/local;1"].
    	    createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(fileName);
    } catch (e) {
      // will fail if fileName is not an absolute path;
      // ignore error and see if fileName is in include directories
    }
    //check if file exists here and return right away
    if(SimpleIO.exists(file)) {
      return new FileCode([file], file.parent);
    }
    
    //---- try the libraries that are bundled with Chickenfoot
    var code = null
    try { 
      code = getCode("chrome://@EXTENSION_NAME@/content/libraries/" + fileName); 
    } 
    catch (e) {}
    finally {
      if(!code || (code.type === undefined)) {//do nothing}
      else {
        return code;
      }
    }    
    //if exportedXpi
    code = null;
    if(isExportedXpi) {
      try { 
        code = getCode("chrome://@EXTENSION_NAME@/content/" + fileName); 
      } 
      catch (e) {}
      finally {
        if(!code || (code.type === undefined)) {//do nothing}
        else {
          return code;
        }
      } 
    }
    
    //---- if the fileName is a normal(not chrome) url
    else if (fileName.search('://') != -1) {
      if(fileName.substring(0,7) == "file://") {
        fileName = fileName.substring(7);
        return getCode(fileName);
      }
      else if((fileName.substring(0,7) == "http://") || 
              (fileName.substring(0,8) == "https://")) {
        return new URLCode(SimpleIO.getChromeContent(fileName), fileName.substring(0, fileName.lastIndexOf('/')));
      }
      else {
        throw new Error('The file could not be imported: ' + fileName);
      }
    }
    
    //try possible directories where the file could be. for each directory, 
    //first search the contents, then try the directory itself
    else {
      //only search for wildcards in scriptDir, throw error if not found
      if(fileName.indexOf('*') != -1) {    
        var tempFileName = fileName; //assigning to temporary variable for various operations
        var dir;
        try { 
          dir = evaluationContext.scriptDir.clone();
          while(tempFileName.indexOf('/')!=-1) {
            var leafStr = tempFileName.substring(0, tempFileName.indexOf('/'));
            tempFileName = tempFileName.substring(tempFileName.indexOf('/')+1);
            if(leafStr == '..'){
              dir = dir.parent;
            }
            else {
              dir.append(leafStr);
            }
          }
        }
        catch(e) {
          throw new Error("exception while appending directories to scriptDir: " + evaluationContext.scriptDir + "\n" + e);
        }
        if(tempFileName.indexOf('*') != -1) {
          var codeFiles = [];
          var searchStr = tempFileName;
          searchStr = makeRegEx(searchStr);
          try {
            var entries = dir.directoryEntries;
            var entryNode;
            while(entries.hasMoreElements()) {
              entryNode = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
              if(searchStr.test(entryNode.leafName) && entryNode.isFile()) {
                codeFiles.push(entryNode.path);
              }
            }
          }
          catch(e) {
            throw new Error("scriptDir variable not provided for wildcard search: " + fileName);
          }
     
          return new FileCode(codeFiles, evaluationContext.scriptDir);
        }
      }
      
      
      //get list of all include directories to search: scriptDir, chickenfoot profile dir, and dirs from firefox pref
      var includeDirectories = new Array();
      if(evaluationContext.scriptDir) {
        includeDirectories.push(evaluationContext.scriptDir);
      }
      includeDirectories.push(TriggerManager._getChickenfootProfileDirectory());
      var incDirsFromPref = getIncludeDirectories();
      var nsIFilesFromPref = [];
      for (var j=0; j<incDirsFromPref; j++) {
        newDir = Components.classes["@mozilla.org/file/local;1"].
  	              createInstance(Components.interfaces.nsILocalFile);
        nsIFilesFromPref[j] = newDir.initWithPath(incDirsFromPref[j]);
      }
      includeDirectories = includeDirectories.concat(nsIFilesFromPref); //getIncludeDirectories());
      
      //now iterate though all the include directories looking for the filename
      for (var i = 0; i < includeDirectories.length; ++i) {
        var dir = includeDirectories[i].clone();
        try {
          var tempFileName = fileName; //assigning to temporary variable for various operations
          while(tempFileName.indexOf('/')!=-1) {
            var leafStr = tempFileName.substring(0, tempFileName.indexOf('/'));
            tempFileName = tempFileName.substring(tempFileName.indexOf('/')+1);
            if(leafStr == '..'){
              dir = dir.parent;
            }
            else {
              dir.append(leafStr);
            }
          }
          
          dir.append(tempFileName);
          if (SimpleIO.exists(dir)) {
            return new FileCode([dir.path], dir.parent);
          }
        }
        catch(e) {}
      }
      //if remote folder, use scriptURL parameter if supplied
      if((typeof fileName == 'string') && (evaluationContext.scriptDir == null)) {
        var parentURI = evaluationContext.scriptURL;
        return getCode(parentURI.asciiSpec + "/" + fileName);
      }
      
    }
    
    return new FileCode(undefined, null);
  } //end of getCode
  
} //end of includeImpl



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

function TriggerManager() {

  this.triggers = [];
  var triggerFile = this._getTriggerFile();

  // initialized by loadTriggers
  this.doc = null;

  var prefs = getPrefBranch();
  try {
    prefs.getBoolPref("ignoreAllTriggers");
  } catch (e) {
    this._ignoreAllTriggers = false;
    prefs.setBoolPref("ignoreAllTriggers", this._ignoreAllTriggers);
  }
  var mgr = this;
  addPreferenceListener(prefs, "ignoreAllTriggers", function() {
    mgr._ignoreAllTriggers = prefs.getBoolPref("ignoreAllTriggers");
    mgr.fireEvent({type:"ignoreAllTriggers"});
  });

  this._listeners = [];
  
  this.loadTriggers(triggerFile);
  
  // params for syncing with GDocs
  try {
    this.syncEnabled = getPrefBranch().getBoolPref("syncEnabled");
  } catch (e) {
    this.syncEnabled = false;
    getPrefBranch().setBoolPref("syncEnabled", this.syncEnabled);
  }
  try {
    this.googleAuthKey = getPrefBranch().getCharPref("googleAuthKey");
  } catch (e) {
    this.googleAuthKey = "";
    getPrefBranch().setCharPref("googleAuthKey", this.googleAuthKey);
  }
}

TriggerManager.prototype.getTriggerFromFile = function(file) {
  for (var i = 0; i < this.triggers.length; i++) {
    var trigger = this.triggers[i];
    if (trigger.path.equals(file)) {
      return trigger;
    }
  }
  return null;
}

TriggerManager.prototype.addListener = function(func) {
  this._listeners.push(func);
}

TriggerManager.prototype.removeListener = function(func) {
  for (var i = 0; i < this._listeners.length; i++) {
    var thisFunc = this._listeners[i];
    if (thisFunc === func) {
      this._listeners.splice(i, 1);
      return;
    }
  }
}

TriggerManager.prototype.fireEvent = function(event) {
  for (var i = 0; i < this._listeners.length; i++) {
    this._listeners[i](event);
  }
}

TriggerManager.prototype.isIgnoringTriggers = function() {
  return this._ignoreAllTriggers;
}

TriggerManager.prototype.setIgnoringTriggers = function(ignoring) {
  if (this._ignoreAllTriggers == ignoring) return;
  this._ignoreAllTriggers = ignoring;
  getPrefBranch().setBoolPref("ignoreAllTriggers", ignoring);
  this.fireEvent({type:"ignoreAllTriggers"});
}

TriggerManager.prototype.loadTriggers = function(/*nsIFile* or *chromeURL*/ file) {
  var domParser = Components.classes["@mozilla.org/xmlextras/domparser;1"].
                  getService(Components.interfaces.nsIDOMParser);
  if(file instanceof Components.interfaces.nsILocalFile) {
    var triggerXml = file;
    var _fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                               createInstance(Components.interfaces.nsIFileInputStream);
    var _siStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
                               createInstance(Components.interfaces.nsIScriptableInputStream);
    _fiStream.init(triggerXml, 1, 0, false);
    _siStream.init(_fiStream);
    var contents = "";
    while (_siStream.available() > 0) {
      contents += _siStream.read(_siStream.available());
    }
    _siStream.close();
    _fiStream.close();
  
    // nsIDOMParser.parseFromStream has problems, so we dump file contents to string instead    
    this.doc = domParser.parseFromString(contents, "text/xml");
    var isOldFormat = this._createTriggersFromXml(this.doc);
    
    // if trigger XML was out of date, save it in the new format.
    if (isOldFormat) {
      this.saveTriggers(file);
    }
  }
  else if(file.substring(0,9) == 'chrome://') {
    var contents = Chickenfoot.SimpleIO.read(file); 
    
    // nsIDOMParser.parseFromStream has problems, so we dump file contents to string instead    
    this.doc = domParser.parseFromString(contents, "text/xml");
    this._createTriggersFromXml(this.doc);
  
  }
}

/**
 * File to save to is optional; triggers.xml in Chickenfoot profile is the default.
 */
TriggerManager.prototype.saveTriggers = function(/*nsIFile*/ opt_file) {
  if (!opt_file) opt_file = this._getTriggerFile();
  this._updateXmlDoc(this.doc);
  var buffer = [];
  this._prettyPrint(this.doc, "", buffer);
  var content = buffer.join("");
  SimpleIO.write(opt_file, content, false);
  uploadSyncTrigger(opt_file);

  this.fireEvent({type:"saveTriggers"});
}

TriggerManager.prototype.addTrigger = function(/*String*/ fileName){
    var file = Chickenfoot.SimpleIO.toFileInChickenfootDirectory(fileName).clone();
    var fileString = Chickenfoot.SimpleIO.read(file);
    var attMap = Chickenfoot.extractUserScriptAttributes(fileString);
    var map = {    name : attMap.name,
                   when : attMap.when,
                   description : attMap.description,
                   include : attMap.include,
                   exclude : attMap.exclude,
                   code : fileString
              }
    this.makeTriggerFromMap(map);
}

TriggerManager.prototype.makeTriggerFromMap = function(foundMap) {
  //default trigger properties
  var name = "no name";
  var when = "Pages Match";
  var description = "no description";
  var includes = new Chickenfoot.SlickSet();
  var excludes = new Chickenfoot.SlickSet();
  
  if (foundMap.name) {name = foundMap.name[0];}
  if (foundMap.when) {when = foundMap.when[0];}
  if (foundMap.description) {description = foundMap.description[0];}
  if (foundMap.include) {includes.addAll(foundMap.include);}
  if (foundMap.exclude) {excludes.addAll(foundMap.exclude);}

  var map = { name : name,
              when : when,
              description : description,
              includes : includes,
              excludes : excludes
            };
  var newCode = Chickenfoot.updateAttributes(foundMap.code, map);

  var trigger = new Chickenfoot.Trigger(
    name,
    newCode,
    description,
    true, //enabled boolean
    foundMap.include, // includes Array
    foundMap.exclude, // excludes Array
    undefined,  // path
    when);    // when to enable the trigger

  //check if the trigger already exists, and delete the old one if it does
  this.deleteDuplicate(name);
  //add to triggers xml file and chickenfoot profile directory
  this.triggers.push(trigger);
  this.saveTriggers();
}

TriggerManager.prototype.deleteDuplicate = function(/*string*/ name){
    for(var i=0; i<this.triggers.length; i++){
        if(this.triggers[i].name == name){
            this.triggers.splice(i,1);
        }
    }
    return;
}

/**
 * Pretty-prints an XML document. Apparently, Firefox's built-in
 * XML serializer does not support a pretty-print mode.
 * This is similar to flatten() in domFlattener.js, but adds newlines
 * and indents to make the resulting content more readable.
 * Also handles Node.DOCUMENT_NODE.
 */
TriggerManager.prototype._prettyPrint = function(node, indent, buffer) {
  // using node.ELEMENT_NODE rather than the more customary Node.ELEMENT_NODE
  // because this code may be called before Chickenfoot.Node is actually defined.
  if (node.nodeType == node.ELEMENT_NODE) {
    buffer.push(indent, "<", node.nodeName, "");
    for (var i = 0; i < node.attributes.length; ++i) {
      var attr = node.attributes[i];
      // TODO: escape attribute values
      buffer.push(" ", attr.nodeName, "=\"", removeXmlChars(attr.nodeValue), "\"");
    }
    if (node.childNodes.length == 0) {
      buffer.push("/>\n");
    } else {
      buffer.push(">\n");
      for (var i = 0; i < node.childNodes.length; ++i) {
        this._prettyPrint(node.childNodes.item(i), indent + "  ", buffer);
      }    
      buffer.push(indent, "</", node.nodeName, ">\n");
    }
  } else if (node.nodeType == node.TEXT_NODE) {
    buffer.push(removeXmlChars(node.nodeValue));
  } else if (node.nodeType == node.DOCUMENT_NODE) {
    for (var i = 0; i < node.childNodes.length; ++i) {
      this._prettyPrint(node.childNodes.item(i), indent, buffer);
    }
  }
}

TriggerManager.prototype._updateXmlDoc = function(/*XMLDocument*/ doc) {
  var ele = doc.documentElement;

  // remove old child nodes
  for (var i = ele.childNodes.length - 1; i >= 0; --i) {
    ele.removeChild(ele.childNodes.item(i));
  }
  // add new child nodes
  for (var i = 0; i < this.triggers.length; ++i) {
    var t = this.triggers[i];
    this._appendTriggerXmlNode(doc, ele, t);
  }
  // remove extra whitespace nodes
  doc.normalize();
}

TriggerManager.prototype._appendTriggerXmlNode =
    function(/*XMLDocument*/ doc, /*Element*/ ele, /*Trigger*/ t) {

  var trigger = doc.createElement('trigger');
  trigger.setAttribute('name', t.name);
  trigger.setAttribute('description', t.description);
  if (t.path.parent.equals(this._getChickenfootProfileDirectory())) {
    // in chickenfoot profile directory, just save name
    trigger.setAttribute('path', t.path.leafName);
  } else {
    // elsewhere on disk, use absolute path
    trigger.setAttribute('path', t.path.path); // questionable!    
  }
  trigger.setAttribute('enabled', t.enabled.toString());
  
  if (t.when == null){
    // Set the default value for backward compatible
    trigger.setAttribute('when', 'Pages Match');
  }else{
    trigger.setAttribute('when', t.when);
  }

  if (t.when == 'Pages Match'){
    // Add include tags and set 'urlPattern' attribute
    for (var i = 0; i < t.includes.length; ++i) {
      var includeUrlPattern = t.includes[i];
      var include = doc.createElement('include');
      include.setAttribute('urlPattern', includeUrlPattern);
      trigger.appendChild(include);
    }
  
    // Add exclude tags and set 'urlPattern' attribute
    for (var i = 0; i < t.excludes.length; ++i) {
      var excludeUrlPattern = t.excludes[i];
      var exclude = doc.createElement('exclude');
      exclude.setAttribute('urlPattern', excludeUrlPattern);
      trigger.appendChild(exclude);
    }
  }else{
    // Do not write includes and excludes information
  }
  
  ele.appendChild(trigger);
}

/**
 * Translates the XML trigger file into a data structure of in-memory triggers.
 * Returns true if XML format is out of date and should be saved immediately in
 * the updated format.
 */
TriggerManager.prototype._createTriggersFromXml = function(/*XMLDocument*/ doc) {
  var isOldFormat = false;
  
  // backwards compatibility: ignoreAllTriggers has now been moved to a preference.
  // Copy its value to the preference, and remove it from XML file.
  var docElem = doc.documentElement;
  if (docElem.hasAttribute("ignoreAllTriggers")) {
    var ignoring = (docElem.getAttribute('ignoreAllTriggers') != 'false');
    this.setIgnoringTriggers(ignoring);
    docElem.removeAttribute('ignoreAllTriggers');
    isOldFormat = true;
  }

  // 5 is XPathResult.ORDERED_NODE_ITERATOR_TYPE, but XPathResult is not in scope
  var triggerIter = doc.evaluate('triggers/trigger', doc, null, 5, null);
  var triggerNode;
  while (triggerNode = triggerIter.iterateNext()) {
    // function Trigger(name, source, description, enabled, includes)
    var name = triggerNode.getAttribute('name');
    var description = triggerNode.getAttribute('description');
    var enabled = (triggerNode.getAttribute('enabled') == 'true');

    // TODO(mbolin): handle case when path is not local to chickenfoot profile
    var file;
    var path = triggerNode.getAttribute('path');
    if (isExportedXpi) {
      file = TriggerManager._getProfileDirectory();
      file.append("extensions");
      file.append("{@EXTENSION_NAME@}");
      file.append(path);
    }
    else if (path.indexOf(':') >= 0) {
      file = this.getFile(path);
    } else {
      file = this._getChickenfootProfileDirectory();
      file.append(path);    
    }

    // extract "when to trigger" information
    var when = triggerNode.getAttribute('when');
    
    if (when == null){
      // give the default value to trigger's "when" attribute for backward compatible
      when = 'Pages Match';
    }
    
    if (when == 'Pages Match'){
      // extract includes
      var includes = [];
      // 5 is XPathResult.ORDERED_NODE_ITERATOR_TYPE
      var includeIter = doc.evaluate('include', triggerNode, null, 5, null);
      var includeNode;
      while (includeNode = includeIter.iterateNext()) {
        includes.push(includeNode.getAttribute('urlPattern'));
      }
      if (includes.length == 0) includes = null;

      // extract excludes
      var excludes = [];
      // 5 is XPathResult.ORDERED_NODE_ITERATOR_TYPE
      var excludeIter = doc.evaluate('exclude', triggerNode, null, 5, null);
      var excludeNode;
      while (excludeNode = excludeIter.iterateNext()) {
        excludes.push(excludeNode.getAttribute('urlPattern'));
      }
      if (excludes.length == 0) excludes = null;    
    }else{  // when == 'Firefox Starts' or 'New Winodw'
      
      var includes = [];
      var excludes = [];
      
      includes = excludes = '';
    }
    
    var t = new Trigger(name, null, description, enabled, includes, excludes, file, when);
    this.triggers.push(t);
  }

  return isOldFormat;
}

/** @return nsIFile or chromeURL */
TriggerManager.prototype._getTriggerFile = function() {
  var dir;
  if (isExportedXpi) {
    dir = TriggerManager._getProfileDirectory();
    var file = dir.clone();
    file.append("extensions");
    file.append("{@EXTENSION_NAME@}");
    file.append("triggers.xml");
    if (!SimpleIO.exists(file)) {
      this._initializeTriggerFolder(dir, file);
    } else if (!file.isFile()) {
      throw new Error("triggers.xml is not a file!");
    }
  }
  else {
    dir = this._getChickenfootProfileDirectory();
    var file = dir.clone();
    file.append("triggers.xml");
    if (!SimpleIO.exists(file)) {
      this._initializeTriggerFolder(dir, file);
    } else if (!file.isFile()) {
      throw new Error("triggers.xml is not a file!");
    }
  }
  return file;
}

/**
 * Copy the files in the xpi directory to the
 * chickenfoot/ directory under the user's profile.
 */
TriggerManager.prototype._initializeTriggerFolder = function(/*nsIFile*/ folder, /*nsIFile*/ file) {
  var GUID = "{@GUID@}";
  var setupDir = TriggerManager._getProfileDirectory();
  setupDir.append("extensions");
  setupDir.append(GUID);
  if (setupDir.isFile()) {
    // if profile/extensions/GUID is a file, then Chickenfoot was installed
    // using run-no-install.  Need to read the contents of that file to find
    // the actual extensions directory.
    var fileContents = SimpleIO.read(setupDir);
    setupDir = SimpleIO.toFile(fileContents);
  }
  setupDir.append("setup");
  var enumeration = setupDir.directoryEntries;
  var profileDir = this._getChickenfootProfileDirectory();
  while (enumeration.hasMoreElements()) {
    var file = enumeration.getNext();
    file.QueryInterface(Components.interfaces.nsIFile);
    file.copyTo(profileDir, file.leafName);
  }
  // TODO(mbolin): update the rootDirectory attribute in triggers.xml when copied over
}

/** @return isILocalFile representing chickenfoot profile directory */
TriggerManager._getChickenfootProfileDirectory = 
TriggerManager.prototype._getChickenfootProfileDirectory = function() {
  var profileDir = TriggerManager._getProfileDirectory();
  profileDir.append("chickenfoot");
  if (!SimpleIO.exists(profileDir)) {
    try {
      profileDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
    } catch (e) {
      // TODO: figure out what to do if this happens
      throw e;
    }
  } else if (!profileDir.isDirectory()) {
    throw new Error("chickenfoot/ is not a directory!");
  }
  return profileDir;
}

/** @return nsILocalFile representing user's profile directory */
TriggerManager._getProfileDirectory = function() {
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                       .getService(Components.interfaces.nsIProperties)
                       .get("ProfD", Components.interfaces.nsILocalFile);
  return file;
}

TriggerManager._saveNewTriggerScript = function(/*String*/ name, /*String*/ script) {
  function nameToFilename(name) {
    var filename;
    filename = escape(name);
    filename = filename.replace(/\//g, "%2F");
    return filename;
  }
  
  var path = null;
  var i = 1;
  var suffix = ".js";
  while (true) {
    var path = TriggerManager._getChickenfootProfileDirectory();
    
    path.append(nameToFilename(name) + suffix);
    if (!SimpleIO.exists(path)) {
      break;
    }
    suffix = i + ".js";
    ++i;
  }

  Chickenfoot.SimpleIO.write(path, script)
  uploadSyncTrigger(path);
  
  return path;  
}

TriggerManager.prototype.getTriggersFor = function(url) {
  if (this.isIgnoringTriggers()) return []; // do not match when triggers ignored
  if (!url) throw new Error('cannot get triggers for null url');
  url = url.toString();

  //The return type of this function
  function ReturnType(scriptContent, file) {
    this.scriptContent = scriptContent; /*string*/
    this.file = file; /*nsIFile*/
  }
  
  var matchedTriggers = [];
  for (var i = 0; i < this.triggers.length; i++) {
    CONSIDER_NEXT_TRIGGER:
    
    // Only triggers with when="Pages Match" and enabled need to be checked
    if (this.triggers[i].enabled && (this.triggers[i].when == 'Pages Match')) {     
      var trigger = this.triggers[i];
      for (var j = 0; j < trigger.includesRegExps.length; j++) {
        if (url.match(trigger.includesRegExps[j])) {
          for (var k = 0; k < trigger.excludesRegExps.length; k++) {
            if (url.match(trigger.excludesRegExps[k])) {
              // this trigger should be excluded
              break CONSIDER_NEXT_TRIGGER;
            }
          }
          var temp = new ReturnType(trigger.getSource(), trigger.path);
          matchedTriggers.push(temp);
          // this trigger is decidedly included
          break CONSIDER_NEXT_TRIGGER;
        }
      }
    }
  }
  return matchedTriggers;
}

/** @return nsIFile */
TriggerManager.prototype.getFile = function(/*String*/ path) {
  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream = Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);  
  var channel = ioService.newChannel(path, null, null);
  channel.QueryInterface(Components.interfaces.nsIFileChannel);
  return channel.file;
}

/** @exported */
TriggerManager.prototype.QueryInterface = function (iid) {
  if (!iid.equals(Components.interfaces.cfITriggerManager)
       && !iid.equals(Components.interfaces.nsISupports))
    throw Components.results.NS_ERROR_NO_INTERFACE;
  return this;
}

/**
 * Set an account that the TriggerManager will use for syncing triggers with GDocs.
 * Note: the authentication key will be saved to Preferences
 *
 * @throw exception if failed to log in
 */
TriggerManager.prototype.setGoogleSync = function(enabled, email, password) {
  if (!enabled) {
    this.setSyncEnabled(false)
  } else {
    this.setSyncEnabled(true);
    try {
      this.setGoogleAuthKey(getGDocsAuth(email, password));
    } catch(e) {
      this.setGoogleAuthKey("");
      throw(e);
    }
  }
}

/**
 * Setter for syncEnabled
 */
TriggerManager.prototype.setSyncEnabled = function(enabled) {
  this.syncEnabled = enabled;
  getPrefBranch().setBoolPref("syncEnabled", this.syncEnabled);
}

/**
 * Setter for googleAuthKey
 */
TriggerManager.prototype.setGoogleAuthKey= function(auth) {
  this.googleAuthKey = auth;
  getPrefBranch().setCharPref("googleAuthKey", this.googleAuthKey);
}

/**
 * Upload all triggers to Google Docs 
 */
TriggerManager.prototype.uploadAllTriggers = function() {
  if (!this.syncEnabled) return;
  
  var auth = this.googleAuthKey;
  var folder = getGDocsChickenfootFolderID(auth);
  
  var triggers_xml = Chickenfoot.SimpleIO.read(this._getTriggerFile());
  
  var triggers_xml_edit = getGDocsChickenfootScriptEditLink(auth, folder, "triggers.xml");
  updateGDocsDocument(auth, triggers_xml_edit, escape(triggers_xml));
  
  for (var i=0; i<this.triggers.length; i++) {
    var content = Chickenfoot.SimpleIO.read(this.triggers[i].path.path);
    var filename = this.triggers[i].path.leafName;
    var edit_link = getGDocsChickenfootScriptEditLink(auth, folder, filename);
    updateGDocsDocument(auth, edit_link, escape(content));
    debugToErrorConsole("uploaded " + filename);
  }
  
}

TriggerManager.prototype.uploadTrigger = function(/*nsIFile*/ file) {
  if (!this.syncEnabled) return;

  var auth = this.googleAuthKey;
  var folder = getGDocsChickenfootFolderID(auth);
  
  // TODO: somewhat hacky way for initializing
  if (!containsGDocsChickenfootScript(auth, folder, "triggers.xml")) {
    // upload all triggers if the folder doesn't have triggers.xml -- first time syncing
    this.uploadAllTriggers();
    return;
  }
  
  var content = Chickenfoot.SimpleIO.read(file);
  var filename = file.leafName;
  var edit_link = getGDocsChickenfootScriptEditLink(auth, folder, filename);
  
  updateGDocsDocument(auth, edit_link, escape(content));
  debugToErrorConsole("uploaded " + filename);
}

/**
 * Download all triggers from Google Docs 
 */
TriggerManager.prototype.downloadAllTriggers = function() {
  if (!this.syncEnabled) return;
  
  var auth = this.googleAuthKey;
  var folder = getGDocsChickenfootFolderID(auth);
  
  var triggers_path = this._getTriggerFile();
  triggers_path = triggers_path.parent;
  
  var names = getGDocsAllChickenfootFileNames(auth, folder);
  for (var i=0; i<names.length; i++) { 
    var content = readGDocsDocument(auth, folder, names[i]);
    content = unescape(content);
    var file_path = triggers_path.clone();
    file_path.append(names[i]);
    Chickenfoot.SimpleIO.write(file_path, content);
    debugToErrorConsole("downloaded " + names[i]);
  }
  
  this.triggers = [];
  this.loadTriggers(this._getTriggerFile());
}

/**
 * Populate a context menu that lets a user run a trigger on a page
 */
function populateTriggerContextMenuPopup(popup) {
  var doc = popup.ownerDocument;
  // delete existing child nodes
  while (popup.hasChildNodes()) {
    popup.removeChild(popup.lastChild);
  }
  // add a menuitem for each available trigger
  var triggers = gTriggerManager.triggers;
  for (var i = 0; i < triggers.length; ++i) {
    var trigger = triggers[i];
    var menuitem = doc.createElement("menuitem");
    menuitem.setAttribute("label", trigger.name);
    menuitem.setAttribute("oncommand", "Chickenfoot.runTriggerNow(" + i + ", window)");
    popup.appendChild(menuitem);
  }
}

/**
 * Callback for triggers listed in context menu
 */
function runTriggerNow(index, chromeWindow) {
  var tabbrowser = chromeWindow.gBrowser;
  var browser = tabbrowser.getBrowserForTab(tabbrowser.selectedTab);
  var win = browser.contentWindow.wrappedJSObject;
  evaluate(chromeWindow,
           gTriggerManager.triggers[index].getSource(),
           false,
           win,
           {scriptDir: gTriggerManager.triggers[index].path.parent});
}
  
/**
 * Extract "Firefox Starts" and "New Window" triggers' source scripts
 */
function/*String[]*/ getTriggersForEvent(/* "Pages Match" | "Firefox Starts" | "New Window" */ when){
  
  function ReturnType(scriptContent, file) {
    this.scriptContent = scriptContent; /*string*/
    this.file = file; /*nsIFile*/
  }
  
  var matchedTriggers = [];
  var triggers = gTriggerManager.triggers;
  
  for (var i = 0; i < triggers.length; i++) {
    var trigger = triggers[i];
    if (trigger.enabled && (trigger.when == when)) {     
      var temp = new ReturnType(trigger.getSource(), trigger.path);
      matchedTriggers.push(temp);      
    }
  }
  return matchedTriggers;
}

var isFirstTimeLaunched = true;
var isNewWindow = false;

function addTriggerListener(/*ChromeWindow*/ chromeWindow) {
  var browser = getTabBrowser(chromeWindow);  
  browser.addEventListener("load", triggerListener, true);

  var isFirefoxStart = isFirstTimeLaunched;
  isFirstTimeLaunched = false;
  isNewWindow = true;
  
  function triggerListener(event) {
    // deal with command-line script(s)
    if (chickenfootCommandLineHandler && chickenfootCommandLineHandler.runThese) {
      for (var i = 0; i < chickenfootCommandLineHandler.runThese.length; i++) {
        evaluateFile(chromeWindow, chickenfootCommandLineHandler.runThese[i].file,
            chickenfootCommandLineHandler.runThese[i].context)
      }
      chickenfootCommandLineHandler.runThese = null
    }
      
    var doc = event.originalTarget;
    try {
      doc.QueryInterface(Components.interfaces.nsIDOMHTMLDocument);
    } catch (e) {
      try {
          doc.QueryInterface(Components.interfaces.nsIDOMXULDocument);
          //is XUL document
      }
      catch (err) {
        return;
      }
    }
    
    var triggers = gTriggerManager.getTriggersFor(doc.location.toString()); 
    if (triggers.length){
      var win = doc.defaultView;
      for (var i = 0; i < triggers.length; ++i) {
        evaluate(chromeWindow, triggers[i].scriptContent, false, win, {scriptDir: triggers[i].file.parent});
      }
    }

    if (isFirefoxStart){
      var specificTriggers = getTriggersForEvent("Firefox Starts");
      for (var i = 0; i < specificTriggers.length; ++i) {
        evaluate(chromeWindow, specificTriggers[i].scriptContent, false, doc.defaultView, {scriptDir: specificTriggers[i].file.parent});
      }
      isFirefoxStart = false;
    }
 
    if (isNewWindow){
      var specificTriggers = getTriggersForEvent("New Window");
      for (var i = 0; i < specificTriggers.length; ++i) {
        evaluate(chromeWindow, specificTriggers[i].scriptContent, false, doc.defaultView, {scriptDir: specificTriggers[i].file.parent});
      }
      isNewWindow = false;
    }
     
  }
  
}

/**
 * Upload a file (trigger or triggers.xml) to Google Docs
 */
function uploadSyncTrigger(/*nsIFile*/ file) {
  try {
    if (Chickenfoot.gTriggerManager.syncEnabled) { 
      Chickenfoot.gTriggerManager.uploadTrigger(file);
    }
  } catch(e) {
    getAWindow().alert(e.message);  
    Chickenfoot.gTriggerManager.setSyncEnabled(false);
    Chickenfoot.gTriggerManager.setGoogleAuthKey("");
  }
}

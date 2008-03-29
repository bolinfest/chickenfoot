/**
 *  triggers.js -- (c) .........
 */
var thisSidebarSaved = false;

function loadTriggersPane() {
  // load trigger list
  loadTriggers();

  // set ignoreAllTriggersCheckbox
  updateIgnoreAllTriggersUI();
  
  // watch for changes to TriggerManager
  Chickenfoot.gTriggerManager.addListener(triggerManagerChanged);  
}
  
function unloadTriggersPane() {
  Chickenfoot.gTriggerManager.removeListener(triggerManagerChanged);
}

function triggerManagerChanged(event) {
  if (event.type == "ignoreAllTriggers") {
    updateIgnoreAllTriggersUI();    
  } else {
    /* event.type == "saveTriggers" */
    if (!thisSidebarSaved) {
      loadTriggers();
    }
  }
}

function loadTriggers() {
  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  
  // clear out the previous triggers
  while (listbox.getRowCount() > 0) {
    listbox.removeItemAt(0)
  }

  var triggers = Chickenfoot.gTriggerManager.triggers;  
  
  for (var i = 0; i < triggers.length; ++i) {
    var trigger = triggers[i];
    addTriggerToListbox(trigger);
  }
}

function saveTriggers() {
  try {
    thisSidebarSaved = true;
    Chickenfoot.gTriggerManager.saveTriggers();
  } finally { 
    thisSidebarSaved = false;
  }
}
 
function clickedIgnoreAllTriggersCheckbox() {
  var cbox = document.getElementById('ignoreAllTriggersCheckbox');
  var checked = cbox.checked; 
  Chickenfoot.gTriggerManager.setIgnoringTriggers(checked);
  updateIgnoreAllTriggersUI();
}

function updateIgnoreAllTriggersUI() {
  var checked = Chickenfoot.gTriggerManager.isIgnoringTriggers();
  var cbox = document.getElementById('ignoreAllTriggersCheckbox');
  cbox.checked = checked;
  document.getElementById("CF_TRIGGERS_PANE").setAttribute("ignoreAllTriggers", checked);
}


function addTriggerToListbox(/*Trigger*/ trigger) {
  var item = document.createElement("listitem");
  item.setAttribute("allowevents", "true");

  var enabled = document.createElement("checkbox");
  enabled.setAttribute("checked", trigger.enabled);
  enabled.setAttribute("observes", "requiresTriggersEnabled");
  item.appendChild(enabled);
  
  var name = document.createElement("label");
  name.setAttribute("value", trigger.name);
  item.appendChild(name);
  
  // add "when to trigger" information to the list box
  var includes = document.createElement("label");
  if (trigger.when == 'Pages Match'){
    includes.setAttribute("value", patternArrayToString(trigger.includes, trigger.excludes));
  }else if(trigger.when == 'Firefox Starts'){
    includes.setAttribute("value", "Firefox starts");
  }else if(trigger.when == 'New Window'){
    includes.setAttribute("value", "New window opens");
  }
  item.appendChild(includes);
  
  item._trigger = trigger;

  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  listbox.appendChild(item);

  // now that the new widgets are in the UI, add event listeners to them
  enabled.addEventListener("command",
    function(event) {
      trigger.enabled = enabled.checked;
      saveTriggers();
    }, false);
}

function updateTriggerInListbox(index) {
  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  var item = listbox.getItemAtIndex(index);
  var trigger = item._trigger;

  var enabled = item.firstChild;
  //TODO - enabled.checked = trigger.enabled
  enabled.setAttribute("checked", trigger.enabled);
  //TODO - get rid of this saveTriggers
  Chickenfoot.gTriggerManager.saveTriggers();

  //TODO - change the property instead of the attribute for next two
  var includes = enabled.nextSibling;
  
  // add "when to trigger" information to the list box
  if (trigger.when == 'Pages Match'){
    includes.setAttribute("value", patternArrayToString(trigger.includes, trigger.excludes));
  }else if(trigger.when == 'Firefox Starts'){
    includes.setAttribute("value", "Firefox starts");
  }else if(trigger.when == 'New Window'){
    includes.setAttribute("value", "New window opens");
  }
}

/**
 * Concatenate includes and excludes into to one string and return it back 
 *
 * @param array 1 - array of includes
 * @param array 2 - array of excludes
 */

function patternArrayToString(/*String[]*/array1, /*String[]*/array2) {
  var arrayString = '';

  // Adding Includes URLs
  for(var i=0; i<array1.length ; i++){
    arrayString = arrayString + array1[i] + " ";
  }
  
  // Adding Excludes URLs
  for(var i=0 ; i<array2.length ; i++){
    arrayString = arrayString + "-" + array2[i] + " ";
  }

  return arrayString;
}

//TODO - delete this function
function triggerClick(event) {
  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  //TODO - consider changing to event.button or something more descriptive
  if (event.which == 1) { // left mouse click
    var listitem = listbox.getSelectedItem(0);
    var checked = listitem.childNodes[0].getAttribute("checked");
    checked = (checked != "true");
    listitem.childNodes[0].setAttribute("checked", checked);
    loadedScripts[listbox.getIndexOfItem(listitem)].enabled = checked;
  } else if (event.which == 3) { // right mouse click
  
  } else {
    return; // middle mouse click? ignore
  }    
  // 
  ///listbox.clearSelection();
  ///var box = document.getBoxObjectFor(event.target);
  // use box to determine if checkbox was clicked
}

function addTrigger() {
  var buffer = getSelectedBuffer();
  if (!buffer) return;
  
  var dialogArguments = {};
  openTriggerDialog(/*trigger*/ null, dialogArguments, buffer);
  
  if (dialogArguments.name == null) return;
  
  var parsedRules = {};
  
  if ((dialogArguments.when == 'Pages Match')&&(dialogArguments.rulesTxt != null)){
    // rulesParsing() returns well-classified includes and excludes arrays
	parsedRules = rulesParsing(dialogArguments.rulesTxt);
  }else{
	parsedRules.includes = [];
	parsedRules.excludes = [];
  }
  
  var includes = new Chickenfoot.SlickSet();
  includes.addAll(parsedRules.includes);
  var excludes = new Chickenfoot.SlickSet();
  excludes.addAll(parsedRules.excludes);
  var map = {
    name : dialogArguments.name,
    when : dialogArguments.when,
    description : dialogArguments.description,
    includes : includes,
    excludes : excludes
  };
  var newCode = Chickenfoot.updateAttributes(dialogArguments.source, map);
    
  //TODO - push this code into openTriggerDialog -> editDialog...
  //TODO - make this look like newTrigger
  var trigger = new Chickenfoot.Trigger(
    dialogArguments.name,
    newCode,
    dialogArguments.description,
    dialogArguments.enabled,
    parsedRules.includes, // includes Array
    parsedRules.excludes, // excludes Array
    undefined,  // path
    dialogArguments.when);    // when to enable the trigger

  addTriggerToListbox(trigger);
  //TODO - method in Chickenfoot.gTriggerManager to do this, don't manipulate the struct. directly
  Chickenfoot.gTriggerManager.triggers.push(trigger);
  saveTriggers();
  
  buffer.text = newCode;
  buffer.trigger = trigger;
  buffer.dirty = false;
}

function editTriggerScript() {
  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  var itemIndex = listbox.selectedIndex;
  if (itemIndex != -1) {
	  var triggers = Chickenfoot.gTriggerManager.triggers;
	  var trigger = triggers[itemIndex];	  
	  startEditingTriggerScript(trigger);
  }
}

function editTriggerProperties() {
  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  var itemIndex = listbox.selectedIndex;
  if (itemIndex != -1) {
	  var triggers = Chickenfoot.gTriggerManager.triggers;
	  var trigger = triggers[itemIndex];
	  
	  var dialogArguments = {};
	  openTriggerDialog(trigger, dialogArguments);
	  
	  var parsedRules = {};
	  if ((dialogArguments.when == 'Pages Match')&&(dialogArguments.rulesTxt != null)){
	    // rulesParsing() returns well-classified includes and excludes arrays
	    parsedRules = rulesParsing(dialogArguments.rulesTxt);
	  }else{
	    parsedRules.includes = [];
	    parsedRules.excludes = [];
	  }
	  
	  if (dialogArguments.name != null) {
	    trigger.name = dialogArguments.name;
	    trigger.includes = parsedRules.includes;
	    trigger.excludes = parsedRules.excludes;
	    trigger.enabled = dialogArguments.enabled;
        trigger.when = dialogArguments.when;
        trigger.description = dialogArguments.description;
	    
        var includes = new Chickenfoot.SlickSet();
        includes.addAll(parsedRules.includes);
        var excludes = new Chickenfoot.SlickSet();
        excludes.addAll(parsedRules.excludes);
        var map = {
          name : dialogArguments.name,
          when : dialogArguments.when,
          description : dialogArguments.description,
          includes : includes,
          excludes : excludes
        };
	    var newCode = Chickenfoot.updateAttributes(dialogArguments.source, map);
	    trigger.setSource(newCode);
        
        //check if trigger script is open in a buffer, if yes, then change that too
        var buffers = getAllBuffers();
        try {
          var buffer;
          for (var k=0; k<buffers.length; k++) {
            buffer = buffers[k];
            if (buffer.file.path == trigger.path.path) {
              buffer.text = newCode;
              buffer.dirty = false;
            }
          }
        }
        catch(err) {}
        
        //TODO - save triggers here
	    updateTriggerInListbox(itemIndex);
	  }
  }
}

/**
 * Opens the trigger edit dialog for a trigger
 *
 * @param trigger to edit
 * @param dialogArguments
 * @param buffer open with contents for new trigger, or null if merely editing a trigger
 */
//TODO - consider returning a trigger object
function openTriggerDialog(trigger, dialogArguments, buffer) {
  return window.openDialog("chrome://chickenfoot/content/addTriggerDialog.xul",
  	"showmore",
  	"chrome,modal,centerscreen,dialog,resizable",
  	(trigger) ? "Edit Trigger" : "Add Trigger",
  	(trigger) ? trigger.name : "",
  	(trigger) ? patternArrayToString(trigger.includes, trigger.excludes) : Chickenfoot.getVisibleHtmlWindow(chromeWindow).location,
  	(trigger) ? trigger.enabled : true,
  	(trigger) ? trigger.getSource() : buffer.text,
  	(trigger) ? trigger.when : "Pages Match",
  	dialogArguments,
	(trigger) ? trigger.description : ""
  	);
}

function moveTrigger(/* 'down' | 'up' */ direction) {
  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  var item = listbox.selectedItem;
  if (item == null) return;

  var triggers = Chickenfoot.gTriggerManager.triggers;  

  var itemIndex = listbox.selectedIndex;
  
  if (direction == 'up') {
    var itemAboveUs = item.previousSibling;
    // NOTE: we must also check that listbox.selectedIndex != 0
    // in case there is a DOM object above us which is the header list,
    // and we don't want to move above that
    if (itemAboveUs != null && itemIndex != 0) {
      listbox.removeChild(item);
      listbox.insertBefore(item, itemAboveUs);
           
      var t = triggers[itemIndex-1];
      triggers[itemIndex-1] = triggers[itemIndex];
      triggers[itemIndex] = t;
    }
  } else if (direction == 'down') {
    var itemBelowUs = item.nextSibling;
    if (itemBelowUs != null) {
      listbox.removeChild(itemBelowUs);
      listbox.insertBefore(itemBelowUs, item);

      var t = triggers[itemIndex+1];
      triggers[itemIndex+1] = triggers[itemIndex];
      triggers[itemIndex] = t;
    }
  } else {
    //TODO throw error/illegal argument exception
  }

  // whatever happens, let's reselect the item
  // just in case it got deselected in the moving process
  listbox.selectedIndex = listbox.getIndexOfItem(item);
  saveTriggers();
  
  // dump triggers list for debugging
  /*
  var s = "";
  for (var i = 0; i < triggers.length; ++i) {
    s += triggers[i].name + "\n";
  }
  alert(s);
  */
}

function removeTriggers() {
  var listbox = document.getElementById("CF_TRIGGERS_PANE");
  var triggers = Chickenfoot.gTriggerManager.triggers;  
  
  for (var i = listbox.selectedCount - 1; i >= 0; --i) {
    var item = listbox.getSelectedItem(i);
    var itemIndex = listbox.getIndexOfItem(item);

    var item = listbox.getItemAtIndex(itemIndex);
    var name = item._trigger.name;
    if (!window.confirm('Are you sure you want to delete the following trigger: ' + name)) {
      continue;
    }
    
    listbox.removeItemAt(itemIndex);
    triggers.splice(itemIndex, 1);
    saveTriggers();
  }
}

/**
 * Parsing rulesTxt and save includes and excludes separately
 *
 * @param rulesTxt - rules text of the trigger
 */
function rulesParsing(rulesTxt){
  var tokenizedRules = [];
  var parsedRules = {};
  var includes = [], excludes = [];
  var includesIndex = 0, excludesIndex = 0;
  var excludesPattern = /^-/;
  
  //Based on space to tokenize the rules text
  tokenizedRules = rulesTxt.split(/\s+/);

  for(var i =0 ; i < tokenizedRules.length ; i++){
    var text = tokenizedRules[i];
    if (!text) continue;
    else if (text.match(excludesPattern)){
      // Skip the first character "-"
      excludes[excludesIndex] = text.substring(1,text.length);
      excludesIndex += 1;
    } else{
      includes[includesIndex] = text;
      includesIndex += 1;
    }
  }
  
  parsedRules.includes = includes;
  parsedRules.excludes = excludes;
    
  return parsedRules;
}

/**
 * Take the file leaf name and return the nsIFile object of this file in the chickenfoot
 * folder inside the Chickenfoot profile directory. (This folder is where all the trigger
 * files and triggers.xml file are).
 * @param leafStr : String //the leaf name of the file to return
 */
function getFileInProfileDirectory(/*String*/ leafStr) {
  var profDir = Chickenfoot.gTriggerManager._getChickenfootProfileDirectory();
  try {profDir.append(leafStr);
    if(profDir.exists()) { return profDir; }
  } catch(e) {}
  return null;
}


/**
 * Take the code in the currently selected trigger and prompt the user to package it as an XPI.
 *
 * @param mainTrigger : Trigger //trigger to store the packaging metadata in
 */
function packageSelectedTriggers(/*Trigger*/ mainTrigger) {
  //only check for java if Firefox version < 3
  if ((chromeWindow.navigator.userAgent.match("Firefox/3") == null) && !Chickenfoot.hasJava()) {
    Chickenfoot.showNeedsJavaDialog(window)
    return;
  }
  
  //try to extract any existing packaging information from the metadata of the main trigger file
  var mainTriggerCode = Chickenfoot.SimpleIO.read(mainTrigger.path);
  var packagingConfig = Chickenfoot.extractUserScriptAttributes(mainTriggerCode);
  
  //put any existing packaging information into the map 'dialogArguments'
  var dialogArguments = compileDialogArguments();
  
  //open the exportDialog.xul window and send it the information in dialogArguments
  window.openDialog("chrome://chickenfoot/content/exportDialog.xul", "showmore", "chrome,modal,centerscreen,dialog,resizable", dialogArguments);
  
  //extension packaging canceled, return here
  if (!dialogArguments.createXpi) return;

  //the list of user files (everything except the triggers) is a string, so parse it into an array
  var toparse = dialogArguments.userFiles.replace(/\n/g, ";");
  var userFiles = []; var strFile = ""; 
  var i=0; var j=0;
  while (toparse != "") {
    while (toparse[i] != ";" && i<toparse.length) { strFile = strFile + toparse[i]; i++; }
    userFiles[userFiles.length] = strFile;
    if (i+1 >= toparse.length) { toparse = ""; }
    else { toparse = toparse.substring(i+1, toparse.length); }
    i=0; j++; strFile = "";
  }

  //add template tags for the updateLink and updateURL
  var xpiFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  xpiFile.initWithPath(dialogArguments.outputPath);
  var updateSite = dialogArguments.templateTags.EXTENSION_URL;
  var updateXpiFile = dialogArguments.templateTags.EXTENSION_URL;
  if((updateSite != "") && updateSite.charAt(updateSite.length - 1) != "/") { 
    updateSite += "/update.rdf";
    updateXpiFile += "/" + xpiFile.leafName;
  }
  dialogArguments.templateTags.EXTENSION_UPDATE_URL = updateSite;
  dialogArguments.templateTags.EXTENSION_UPDATE_LINK = updateXpiFile;

  //update packaging metadata information in the main trigger file
  var metadata = updateMetadata();

  //set iconPath to null if user supplied file doesn't exist
  var iconPath = null;
  iconFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  if(dialogArguments.icon) {
    iconFile.initWithPath(dialogArguments.icon);
    if(iconFile) { iconPath = iconFile.path; }
  }

  //call Chickenfoot.xpiTie to actually package the extension
  var xpiFile = null;
  try { xpiFile = Chickenfoot.xpiTie(dialogArguments.outputPath, dialogArguments.templateTags, dialogArguments.triggers, userFiles, iconPath, chromeWindow); }
  catch (e) { alert(e); return; }
  
  //alert to user with location of xpi file on completion of packaging
  var message;
  if (dialogArguments.templateTags.EXTENSION_UPDATE_URL != "") {
     message = "Your new extension " + xpiFile.leafName + " and an update description file update.rdf "
     message += "were created in " + xpiFile.parent.path + "\n"
     message += "\n"
     message += "In order to make Firefox automatic updating work correctly, "
     message += "place both files on the Web at " + dialogArguments.templateTags.EXTENSION_UPDATE_URL;
   } else { message = "Your new extension was created at: " + xpiFile.path; }
   alert(message);
   
   
  /**
   * This inner function compiles all of the existing packaging information into the map 'dialogArguments' to be sent to exportDialog.xul
   * @returns dialogArguments : Object //map to pass to exportDialog.xul
   **/
   function compileDialogArguments() {
     //create Trigger objects from the triggerPaths to give to exportDialog.xul
     var triggers = [];
     if(packagingConfig.trigger) {
       for(var k=0; k<packagingConfig.trigger.length; k++) {
         //trigger paths are relative to Chickenfoot profile directory
         var triggerFile = getFileInProfileDirectory(packagingConfig.trigger[k]);
         if(triggerFile == null) { continue; }
         var currentPath = triggerFile.path;
         var triggerCode = Chickenfoot.SimpleIO.read(currentPath);
         var attMap = Chickenfoot.extractUserScriptAttributes(triggerCode);
         var tName = attMap.name; if(!tName) { tName = "unresolved"; }
         var tDescription = attMap.description; if(!tDescription) { tDescription = "unresolved"; }
         var tIncludes = attMap.includes; if(!tIncludes) { tIncludes = []; }
         var tExcludes = attMap.excludes; if(!tExcludes) { tExcludes = []; }
         var tWhen = attMap.when; if(!tWhen) { tWhen = "Firefox Starts"; }
         var tPath = Chickenfoot.SimpleIO.toFile(currentPath);
         var currentTrigger = new Chickenfoot.Trigger(tName, null, tDescription, true, tIncludes, tExcludes, tPath, tWhen);
         triggers[triggers.length] = currentTrigger;
       }
     }

     //all of the user files should be relative to the chickenfoot profile directory
     var files = packagingConfig.file; var userFiles = [];
     if(files) {
       for(var i=0; i<files.length; i++) {
         var nsiFile = getFileInProfileDirectory(files[i]);
         if(nsiFile) { userFiles[userFiles.length] = nsiFile.path; }
       }
     }
     var iconPath = null;
     if(packagingConfig.extensionIcon) {
       var iconFile = getFileInProfileDirectory(packagingConfig.extensionIcon);
       if(iconFile) { iconPath = iconFile.path; }
     }

     //put some of the existing information about packaging configuration into a map 'templateTags'
     // Note: the contents of this map will later be used to fill in the template files during
     //       the actual packaging. so any information that won't be used in this way should be
     //       passed in as a separate argument to dialogArguments, not through this map
       var templateTags = {
         extensionName : packagingConfig.extensionName,
         extensionAuthor : packagingConfig.extensionAuthor,
         extensionGUID : packagingConfig.extensionGUID,
         extensionDescription : packagingConfig.extensionDescription,
         updateURL : packagingConfig.updateURL,
         version : packagingConfig.version
       };

     //put all of the existing information about packaging configuration into a map 'dialogArguments'
     var dialogArguments = {
       chickenfoot : Chickenfoot,
       createXpi : false,
       templateTags : templateTags,
       outputPath : undefined,
       mutatedAttributes : undefined,
       userFiles : userFiles,
       triggers : triggers,
       icon : iconPath,
       mainTrigger : mainTrigger
     };
     
     return dialogArguments;
   } //end compileDialogArguments()
   
   /**
    * This inner function updates the metadata in the main trigger file to reflect the new packaging configuration
    **/
   function updateMetadata() {
     //don't include the main trigger in the list of triggers in the metadata, only extra triggers
     metadataTPaths = new Chickenfoot.SlickSet();
     for(var m=0; m<dialogArguments.triggers.length; m++) {
       if(dialogArguments.triggers[m] == mainTrigger) { continue; }
       else { metadataTPaths.add(dialogArguments.triggers[m].path.leafName); }
     }

     //if file or folder included is not in the top level chickenfoot profile directory, still
     // add it to the extension, but don't add it to the metadata
     var metadataFPaths = new Chickenfoot.SlickSet();
     var CprofDir = Chickenfoot.gTriggerManager._getChickenfootProfileDirectory();
     for(var j=0; j<userFiles.length; j++) {
       var currentFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
       currentFile.initWithPath(userFiles[j]);
       if(CprofDir.contains(currentFile, false)) { metadataFPaths.add(currentFile.leafName); }
       else { continue; }
     }

     //if user specified an icon file that is not in the top level chickenfoot profile directory,
     // still use it for the extension, but don't add it to the metadata
     var iconFile = null; var iconPath = null;
     if(dialogArguments.icon) { 
       iconFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
       iconFile.initWithPath(dialogArguments.icon);
       if(iconFile) { iconPath = iconFile.path; }
       if(!CprofDir.contains(iconFile, false)) { iconFile = null; }
     }

     //put metadata in a map to send to updateAttributes
     var metadata = {
         extensionName : dialogArguments.templateTags.EXTENSION_DISPLAY_NAME,
         extensionAuthor : dialogArguments.templateTags.EXTENSION_AUTHOR,
         extensionDescription : dialogArguments.templateTags.DESCRIPTION,
         extensionGUID : dialogArguments.templateTags.GUID,
         version : dialogArguments.templateTags.VERSION,
         updateURL : dialogArguments.templateTags.EXTENSION_URL,
         file : undefined,
         trigger : undefined,
         extensionIcon : undefined
     };

     //only add metadata for non-empty fields
     var iconPath = dialogArguments.icon;
     if(iconFile) { metadata.extensionIcon = iconFile.leafName; iconPath = iconFile.path; }
     if(metadataTPaths.size() > 0) { metadata.trigger = metadataTPaths; }
     if(metadataFPaths.size() > 0) { metadata.file = metadataFPaths; }

     //update the metadata in the main trigger file
     var newTriggerCode = Chickenfoot.updateAttributes(mainTriggerCode, metadata);
     Chickenfoot.SimpleIO.write(mainTrigger.path, newTriggerCode);
     return metadata;
   } //end updateMetadata()
} //end packageSelectedTriggers()


/**
 * Take the currently selected trigger and publish it on the scripts wiki.
 * @param trigger : Trigger //the trigger to publish
 *
 * NOTE: Publishing a trigger script on the wiki involves manipulating (i.e clicking, inserting text) the
 * current HTML document in the browser window. Originally tried to do this directly from xul land, but
 * had problems with keeping a reference to the current HTML document, particularly when navigating from
 * one page to the next. Scripts written in the Chickenfoot buffer however, do not seem to have this problem.
 * So to work around this problem of keeping an up-to-date reference to the current HTML document, passed a
 * script directly to Chickenfoot.evaluate similar to the way code written in the Chickenfoot buffer is handled.
 */
function publishSelectedTrigger(/*Trigger*/ trigger) {
  //get index of selected trigger in gTriggerManager.triggers
  var triggerIndex = 0;
  var triggerList = Chickenfoot.gTriggerManager.triggers;
  for(var i=0; i<triggerList.length; i++) {
    if(triggerList[i].path.path == trigger.path.path) { triggerIndex = i; break; }
  }

  //get a string of the code to evaluate (see note in function documentation above)
  var code = "//get trigger to publish\n";
  code += "var trigger = Chickenfoot.gTriggerManager.triggers[" + triggerIndex + "];\n";
  code += "publishTrigger(trigger);\n";

  code += "function publishTrigger(/*Trigger*/trigger) {\n";
  
  code += "  //get name and description of trigger to publish\n";
  code += "  var name = trigger.name;\n";
  code += "  var description = trigger.description;\n";
  code += "  var currentScript = Chickenfoot.SimpleIO.read(trigger.path);\n";

  code += "  //-----------\n";

  code += "  //go to chickenfoot scripts wiki page if not already there\n";
  code += "  var currentPage = document.location;\n";
  code += "  var scriptsWiki = 'http://groups.csail.mit.edu/uid/chickenfoot/scripts/index.php/Main_Page';\n";
  code += "  if(document.location != scriptsWiki) { go(scriptsWiki); }\n";

  code += "  //go to script section and check if this script already exists there\n";
  code += "  //just put all scripts uner 'General Scripts' for now\n";
  code += "  var scriptSection = 'General Scripts';\n";
  code += "  click(scriptSection);\n";
  code += "  var existingLink = find(name + ' link');\n";
  code += "  var existingMatch = existingLink.hasMatch && (existingLink.text == name);\n";



  code += "  //there is already a trigger called this, ask the user if they want to replace it\n";
  code += "  var overwrite = false;\n";
  code += "  if(existingMatch) {\n";
  code += "    overwrite = window.wrappedJSObject.confirm('Are you sure you want to over-write this existing script?');\n";

  code += "    //if don't want to replace it, then return without doing anything\n";
  code += "    if(!overwrite) { return; }\n";

  code += "    //else open edit tab for just this section\n";
  code += "    else{ click(find(name + ' link').element.parentNode.previousSibling.previousSibling.childNodes[1]); }\n";
  code += "  }\n";

  code += "  //there is not a script already called this\n";
  code += "  else {\n";
  code += "    //open edit tab of entire script section\n";
  code += "    var editLink = find('edit');\n";
  code += "    while(editLink.next != Chickenfoot.EMPTY_MATCH) { editLink = editLink.next; }\n";
  code += "    click(editLink);\n";
  code += "  }\n";

  code += "  //if not logged in, follow the re-direct link to the login page, and leave the user there\n";
  code += "  var loginLink = find('login link');\n";
  code += "  if (loginLink.hasMatch) {\n";
  code += "    click('login link');\n";
  code += "    return;\n";
  code += "  }\n";

  code += "  //find editor box\n";
  code += "  var textbox = find('first textbox').element.wrappedJSObject;\n";

  code += "  //save existing text, so can add to it\n";
  code += "  var existingTxt = textbox.textContent;\n";
  code += "  if(overwrite) { existingTxt = ''; }\n";

  code += "  //get new text and insert into textarea\n";
  code += "  var newTxt = '\\n===[[' + name + ']] ===' + '\\n' + description;\n";
  code += "  if(overwrite) { newTxt = '=== [[' + name + ']] ===\\n' + description; }\n";

  code += "  var txtToInsert = existingTxt + newTxt;\n";
  code += "  textbox.textContent = txtToInsert; \n";

  code += "  //save the page and keep location so can go back to this page when done\n";
  code += "  click('save the page button');\n";
  code += "  var returnLocation = document.location.toString();\n";

  code += "  //-----------\n";

  code += "  //open edit tab for new page and find editor box\n";
  code += "  click('' + name + ' link');\n";
  code += "  textbox = find('first textbox').element.wrappedJSObject;\n";
  code += "  if(overwrite || !textbox.hasMatch) { \n";
  code += "    click('edit link');\n";
  code += "    textbox = find('first textbox').element.wrappedJSObject;\n";
  code += "  }\n";

  code += "  //replace the existing text with the current script on disk\n";
  code += "  textbox.textContent = '<pre>' + currentScript + '</pre>';\n";

  code += "  //save the page\n";
  code += "  click('save the page button');\n";

  code += "  //return to index page of scripts\n";
  code += "  go(returnLocation);\n";

  code += "}\n";
  
  //have Chickenfoot evaluate the code above
  //need to pass in a reference to the current HTML window, otherwise it defaults to the chromeWindow
  Chickenfoot.evaluate(chromeWindow, code, false, chromeWindow.content.wrappedJSObject);
  
}//end publishSelectedTrigger

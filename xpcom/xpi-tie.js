/**
 * @param triggerFiles {string array} the pathname of the trigger script that is going to be packaged as an XPI
 * @param templateTags {object} map of template tags, such as CHICKENFOOT_GUID,
 *     to template values
 * @param outputPath {string} the path where the XPI should be saved
 * @param userFiles {string array} the pathnames of other files to be included in the XPI
 * @param iconFile{string} the path for the icon for the extension
 */
function xpiTie(triggers, templateTags, outputPath, userFiles, iconFile) {
  var templateTagsArray = [];
  for (var t in templateTags) {
    templateTagsArray.push(t);
    templateTagsArray.push(templateTags[t]);
  }
  var len = templateTagsArray.length;
  var javaArray = java.lang.reflect.Array.newInstance(java.lang.String, len);
  
  // passing ['foo', 'bar'] as a parameter to a Java method does not seem to work,
  // so we need to populate a java.lang.String[] and pass that instead
  for (var i = 0; i < len; ++i) {
    javaArray[i] = templateTagsArray[i];
  }
  
  // convert all files that need to be written into the JAR(user included and trigger files)
  // to a Java string array and replace '\' with '\\' in file pathnames
  var numUserFiles = userFiles.length;
  var userFilesJava = java.lang.reflect.Array.newInstance(java.lang.String, numUserFiles);
  for (var j = 0; j < numUserFiles; ++j) {
    userFilesJava[j] = userFiles[j].replace("\\", "\\\\");
  }
    
  var exportXpiClass = getJavaClass("chickenfoot.ExportXpi");
  var xpiTieFunc = exportXpiClass.getMethod("xpiTie",
    [java.lang.String, java.lang.String, javaArray.getClass(), java.lang.String, javaArray.getClass(), java.lang.String]);  
  
  var guid = "{@GUID@}";
  var mgr = Components
       .classes["@mozilla.org/extensions/manager;1"]
       .getService(Components
       .interfaces.nsIExtensionManager);
  var loc = mgr.getInstallLocation("{@GUID@}");
  var file = loc.getItemLocation("{@GUID@}");  
  var extensionPath = file.path;
  
  var triggersXML = createTriggersXML(triggers);
  if (!iconFile) { iconFile = null; }
  
  // convert extensionPath to format java.io.File understands
  // remove leading file:///, if present
  var xpiPath = xpiTieFunc.invoke(null, [
   triggersXML,
   outputPath,
   javaArray,
   extensionPath,
   userFilesJava,
   iconFile
  ]);

  return ("" + xpiPath.toString()); // ensure this is a JS string, not a Java one
}

function createTriggersXML(triggers) {
  var domParser = Components.classes["@mozilla.org/xmlextras/domparser;1"].
                  getService(Components.interfaces.nsIDOMParser);
  var domSerializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].
                        getService(Components.interfaces.nsIDOMSerializer);
  
  var xmlString = '<triggers version="0.5"></triggers>';
  var xmlDoc = domParser.parseFromString(xmlString, "text/xml");
  var docElement = xmlDoc.documentElement;
  
  for(var g=0; g<triggers.length; g++) {
    gTriggerManager._appendTriggerXmlNode(xmlDoc, docElement, triggers[g]);
  }
  var xmlArray = new Array();
  gTriggerManager._prettyPrint(xmlDoc, "", xmlArray);
  xmlString = "";
  for(var i=0; i<xmlArray.length; i++) {
    xmlString += xmlArray[i];
  }
  //Converting javascript String to java String
  return xmlString;
}
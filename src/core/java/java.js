// Packages and java are not defined in the global namespace for XPCOM components,
// so we need to get them from a chrome window.  But getting them from the first
// chrome window (as setupWindow() does with other DOM classes, like Node) is a bad
// idea, because it forces Java to load during FF startup, a significant cost.
// So we fetch the Packages reference lazily.
this.Packages getter = function() {
  var chromeWindow = getAnyChromeWindow();
  if (!chromeWindow) throw new Error("can't find a Firefox window to get Packages from");

  var Packages = chromeWindow.Packages;
  
  // replace lazy getters with direct references
  delete this.Packages;
  delete this.java;
  this.Packages = Packages;
  this.java = Packages.java;
  
  // return the Packages reference
  return Packages;
}

this.java getter = function() {
  return this.Packages.java;
}


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
    return (max > 1 || (max === 1 && min >= 5));
  } catch (e) {
    return false;
  }
}


/**
 * JavaClassLoader represents a set of JAR files containing Java code.
 * Each JAR file is named by a URL, which can be a file: or http: URL (but not chrome:, because 
 * Java knows nothing about that protocol).
 *
 */
function JavaClassLoader(/*string[]*/ jarPaths) {
  var policy = JavaClassLoader.getJavaPolicy();
  var urls = [];
  for each (var jp in jarPaths) {
    var url = new Packages.java.net.URL(jp);
    policy.addURL(url);
    urls.push(url);
  }
  
  this._classLoader = Packages.java.net.URLClassLoader.newInstance(urls);

}

/*
 * Return a Java security policy that gives all permissions to a set of permitted URLs.
 * If the policy doesn't already exist, create it and install it into the Java runtime system.
 */
JavaClassLoader.getJavaPolicy = function() {
  if (JavaClassLoader._policy) return JavaClassLoader._policy;
  
  var jarPath = getExtensionFileUrl("{@GUID@}") + "java/chickenfoot-java.jar";
  var policyClassLoader = new Packages.java.net.URLClassLoader([ new Packages.java.net.URL(jarPath) ]);
  var policyClass = Packages.java.lang.Class.forName(
       "edu.mit.csail.simile.firefoxClassLoader.URLSetPolicy",
       true,
       policyClassLoader);
    
  var policy = policyClass.newInstance();
  policy.setOuterPolicy(Packages.java.security.Policy.getPolicy());
  Packages.java.security.Policy.setPolicy(policy);
  policy.addPermission(new Packages.java.security.AllPermission());
  JavaClassLoader._policy = policy;
  return policy;
}

/**
 * Return the Java Class object for a fully-qualified class name found in one of this
 * Java object's JAR files.
 */
JavaClassLoader.prototype.getClass = function getClass(/*string*/ className) {
  return Packages.java.lang.Class.forName(className, true, this._classLoader);
}


/**
 * Returns the directory where an extension is installed expressed as a file:
 * URL terminated by a slash.  The extension must be named by its GUID.
 */
function getExtensionFileUrl(guid) {
  var mgr = Components
       .classes["@mozilla.org/extensions/manager;1"]
       .getService(Components
       .interfaces.nsIExtensionManager);
  var loc = mgr.getInstallLocation(guid);
  var file = loc.getItemLocation(guid);
  var uri = Components.classes["@mozilla.org/network/protocol;1?name=file"]
                       .getService(Components.interfaces.nsIFileProtocolHandler)
                       .newFileURI(file)
  return uri.spec;
}

var ChickenfootJars = null;
function getChickenfootJars() {
  if (ChickenfootJars) return ChickenfootJars;
    
  var jars = [ getExtensionFileUrl("{@GUID@}") + "java/chickenfoot-java.jar" ];
  ChickenfootJars = new JavaClassLoader(jars);
  return ChickenfootJars;
}

/**
 * Get one of Chickenfoot's built-in classes.
 */
function getJavaClass(className) {
  return getChickenfootJars().getClass(className);
}

function showNeedsJavaDialog(/*Window*/ window) {
  window.openDialog("chrome://chickenfoot/content/needsJavaDialog.xul",
    "showmore",
    "chrome,modal,centerscreen,dialog,resizable",
    {})
}

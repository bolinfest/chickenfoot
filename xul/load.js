function loadHandler() {
  if (!Chickenfoot.restoreSidebarState(chromeWindow, sidebarWindow)) {
    new Buffer();
  }
  
  var firstInstall = true;
  var prefs = Chickenfoot.getPrefBranch();
  try {
    if (prefs.getBoolPref("installed")) firstInstall = false;
  } catch (e) {}
  if (firstInstall) {
    window.setTimeout(firstChickenfootUse, 0);
    prefs.setBoolPref("installed", true);
  }
  populateRunPopup();
  populateTemplatePopup();
  
  focusEditorWhenTabSelected();
  
  loadTriggersPane();
  
  startRecording();
  
//  setupShell();

  // fix tooltips for Mac
  if ((/^mac/i).test(window.navigator.platform)) {
    var replacements = {
      "cfRunButton" : "Alt"
    };
    for (var r in replacements) {
      var el = document.getElementById(r);
      var tooltiptext = el.getAttribute('tooltiptext');
      if (replacements[r] == "Alt") {
        tooltiptext = tooltiptext.replace("Alt", "Ctrl");
      } else {
        tooltiptext = tooltiptext.replace(/\(Ctrl-([A-Z])\)/, "\u2318$1");
      }
      el.setAttribute('tooltiptext', tooltiptext);
    }
  }
}

function unloadHandler() {
  unloadTriggersPane();

  // Workaround for bug #97: Firefox sidebar corrupted if Chickenfoot is uninstalled while the Chickenfoot sidebar is visible.      
  if (isChickenfootToBeUninstalled()) {
    deleteSavedSidebarSettings();
  }
  
  stopRecording();
}
  
// Detect whether Chickenfoot has been uninstalled by looking at the extension manager's RDF.
function isChickenfootToBeUninstalled() {
  try {
    var RDFService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
    var container = Components.classes["@mozilla.org/rdf/container;1"].getService(Components.interfaces.nsIRDFContainer);
    var extensionDS= Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).datasource;

    // Iterate over extensionDS to find the node X (representing an extension) such that
    //    (X,name,"Chickenfoot")
    //    (X,toBeUninstalled,"true")
    var root = RDFService.GetResource("urn:mozilla:extension:root");
    var nameArc = RDFService.GetResource("http://www.mozilla.org/2004/em-rdf#name");
    var toBeUninstalledArc = RDFService.GetResource("http://www.mozilla.org/2004/em-rdf#toBeUninstalled");

    container.Init(extensionDS, root);

    var elements = container.GetElements();
    while (elements.hasMoreElements()) {
      var element = elements.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
      var name = "";
      var toBeUninstalled = "";

      var target = extensionDS.GetTarget(element, nameArc ,true);
      if (target) {
          name = target.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
      }

      target = extensionDS.GetTarget(element, toBeUninstalledArc ,true);
      if (target) {
          toBeUninstalled=target.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
      }

      //If we find the right value, set the found flag to true.
      if (name == "Chickenfoot" && toBeUninstalled == "true") {
          return true;
      }
    }
  } catch (e) {
    // if anything failed, don't complain, because this is just
    // a workaround for a Firefox 1.0.x bug that's now fixed in Firefox 1.5
  }
  
  return false;
}

function deleteSavedSidebarSettings() {
  try {
    var RDFService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
    var localstore = RDFService.GetDataSource("rdf:local-store")

    var sidebar = RDFService.GetResource("chrome://browser/content/browser.xul#sidebar-box")

    // delete all statements of the form (sidebar,Y,Z).
    var predicates  = localstore.ArcLabelsOut(sidebar)
    while (predicates.hasMoreElements()){
      var predicate = predicates.getNext();
      var targets = localstore.GetTargets(sidebar, predicate, true)
      while (targets.hasMoreElements()) {
        var target = targets.getNext();

        // delete statement from the RDF database
        localstore.Unassert(sidebar, predicate, target)
      }
    }
  } catch (e) {
    // if anything failed, don't complain, because this is just
    // a workaround for a Firefox 1.0.x bug that's now fixed in Firefox 1.5
  }        
}

/**
 * These are the default script templates that come with Chickenfoot.
 * If the chickenfoot.templates preference gets corrupted,
 * the preference should be restored to this value.
 * Note that the preference is stored as JSON:
 * There is an array of template data (the order corresponds to the order
 * they are listed in on the popup menu) and each datum has at most
 * three properties: code, label, and isDefault. At most one datum
 * will have the isDefault property, indicating that it is the user's
 * default template.
 */
var DEFAULT_CHICKENFOOT_TEMPLATES = '([\
  {\
    code : "with(window) {\\n\\n__CF_CURSOR_POS__\\n\\n\\n} // closes with(window)",\
    label : "with(window) template"\
  },\
  {\
    code : "include(\\"greasemonkey.js\\");\\n\\n__CF_CURSOR_POS__\\n",\
    label : "Greasemonkey template"\
  }\
])';

/** @return an array with the template data */
function getTemplateData() {
  var prefs = Chickenfoot.getPrefBranch();
  var templates = [];
  try {
    templates = eval(prefs.getCharPref('templates'));
  } catch (e) {
    templates = eval(DEFAULT_CHICKENFOOT_TEMPLATES);
    prefs.setCharPref('templates', DEFAULT_CHICKENFOOT_TEMPLATES);
  }
  return templates;
}
/**
 * Populate the run dropdown under the run button
 */
function populateRunPopup() {
  var runPopup = document.getElementById('chickenfoot-run-popup');
  var runButton = document.getElementById('cfRunButton');
  while (runPopup.firstChild) {
    templatePopup.removeChild(runPopup.firstChild);
  }
  var normal = document.createElement('menuitem');
  normal.setAttribute('type', 'radio');
  normal.setAttribute('label', 'Run as Javascript');
  normal.setAttribute('checked', 'true');
  normal.id = 'normal-chickenfoot-eval';
  runPopup.appendChild(normal);
  normal.addEventListener('command', function() {
	runButton.setAttribute('style', jsIcon);
   	var buffer = Chickenfoot.getSidebarWindow(chromeWindow).getSelectedBuffer();
    buffer.useKeywordCommands(false);
  }, true); 
  var kwc = document.createElement('menuitem');
  kwc.setAttribute('type', 'radio');
  kwc.setAttribute('label', 'Run as Keyword');
  kwc.id = 'kwc-chickenfoot-eval';
  kwc.addEventListener('command', function () {
    if (Chickenfoot.hasJava()) {
      runButton.setAttribute('style', kwIcon);
   	  var buffer = Chickenfoot.getSidebarWindow(chromeWindow).getSelectedBuffer();
      buffer.useKeywordCommands(true);
    } else {
      Chickenfoot.showNeedsJavaDialog(chromeWindow)
    }
  }, true);
  
  runPopup.appendChild(kwc);
}

/**
 * Based on the user's template data,
 * populate the template dropdown under the new file button.
 */
function populateTemplatePopup() {
  var templates = getTemplateData();
  newFileTemplates = {};
  var templatePopup = document.getElementById('chickenfoot-template-popup');
  
  // remove all children
  while (templatePopup.firstChild) {
    templatePopup.removeChild(templatePopup.firstChild);
  }
  
  defaultTemplateId = undefined;
  for (var i = 0; i < templates.length; ++i) {
    var template = templates[i];
    var id = 'chickenfoot-template-' + i;
    var label = template.label;
    if (template.isDefault) {
      defaultTemplateId = id;
      label += ' [Default]';
    }
    var menuitem = document.createElement('menuitem');
    menuitem.setAttribute('label', label);
    menuitem.id = id;
    newFileTemplates[id] = template.code;
    templatePopup.appendChild(menuitem);
  }
  
  var menuseparator = document.createElement('menuseparator');
  templatePopup.appendChild(menuseparator);

  var customize = document.createElement('menuitem');
  customize.setAttribute('label', 'Customize templates...');
  customize.id = 'customize-chickenfoot-template';
  templatePopup.appendChild(customize);  
}

/**
 * Called when chromeWindow is closing.
 * @returns true if ok to close, false if close should be canceled.
 */
function windowIsClosing() {
  // FIX: should ask about all unsaved buffers in a single dialog
  var buffers = getAllBuffers();
  for (var i = 0; i < buffers.length; ++i) {
    if (!buffers[i].okToClose()) return false;
  }
  return true;
}

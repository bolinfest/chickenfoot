// This file provides functions for discovering the chrome window,
// sidebar window, html window, and html document.


/**
 * Get the Chickenfoot sidebar window for a Firefox chrome window.
 * (Use document property of this window to get the DOM for
 * sidebar.xul.)
 * Returns null if sidebar is hidden or some sidebar other 
 * than Chickenfoot is showing.
 */
function getSidebarWindow(/*ChromeWindow*/ chromeWindow) {
  var sbvbox = chromeWindow.document.getElementById("sidebar-box");
  if (sbvbox.hidden) {
    // no sidebar is visible
    return null;
  }
  
  var sb = chromeWindow.document.getElementById("sidebar");
  var src = sb.getAttribute("src");
  if (!src.match(/chrome:\/\/chickenfoot/)) {
    // a sidebar other than Chickenfoot is visible
    return null;
  }
  
  // if sidebar doesn't have a docShell property, then
  // it's not visible
  if (!sb.docShell) {
    return null;
  }
  
  return sb.contentWindow;
}

/**
 * Get the Firefox chrome window that contains the given 
 * Chickenfoot sidebar window.
 */
function getChromeWindow(/*SidebarWindow*/ sidebarWindow) {
  return sidebarWindow.parent;
}



/**
 * Get the tabbrowser XUL node for a Firefox chrome window.
 * Useful for attaching load and progress listeners.
 */
function getTabBrowser(/*ChromeWindow*/ chromeWindow) {
  return chromeWindow.getBrowser();
}

/**
 * Get the HTML Window of the visible tab in the given 
 * Firefox chrome window.
 * Note: don't use the document property of an HTML Window
 * directly.  Use getLoadedHtmlDocument(chromeWindow, win) instead, 
 * to ensure that it's loaded.
 */
function getVisibleHtmlWindow(/*ChromeWindow*/ chromeWindow) {
  return chromeWindow._content;
}


/**
 * Get the <tab> XUL object for an HTML Window.
 */
function getTab(/*HtmlWindow*/ htmlWindow) {
    // enumerate all the ChromeWindows
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    var e = wm.getEnumerator("navigator:browser");
  search:
    while (e.hasMoreElements()) {
      var chromeWindow = e.getNext();
      
      // enumerate the tabs within chromeWindow
      var tabBrowser = getTabBrowser(chromeWindow);
      var tabs = tabBrowser.mTabBox._tabs.childNodes;
      for (var i = 0; i < tabs.length; ++i) {
        var tab = tabs[i];
        var browser = tabBrowser.getBrowserForTab(tab);
        if (browser.contentWindow == htmlWindow) {
          return tab;
        }
      }
    }

    return null;    
}

/**
 * Get the chrome window containing an HTML window.
 */
function getChromeWindowOfHtmlWindow(/*HTML Window*/ win) {
  return getTab(win).ownerDocument.defaultView;
}

/**
 * Get the <browser> XUL object for an HTML Window.
 * @return Browser or null if not found.
 */
function getBrowser(/*HtmlWindow*/ htmlWindow) {
  var tab = getTab(htmlWindow);
  return tab ? tab.linkedBrowser : null;
}

/**
 * Get the WebProgess object for an HTML Window.
 * @return WebProgress or null if not found.
 */
function getWebProgress(/*HtmlWindow*/ htmlWindow) {
  var browser = getBrowser(htmlWindow);
  return browser ? browser.webProgress : null;
}

/**
 * Get the HTML Document for the given HTML Window.  If the document
 * is currently loading, then this function blocks until it is loaded.
 * @returns Document
 * @throws Error if document doesn't finish loading in 30 seconds
 */
function getLoadedHtmlDocument(/*ChromeWindow*/ chromeWindow, 
                               /*HtmlWindow*/ win) {
  var webProgress;
  try {
    webProgress = getWebProgress(win);
  } catch (e) {
    // TODO: getWebProgress throws an exception on Fennec.
    // Make it work correctly; in the meantime, just find the frontmost
    // tab's webProgress as shown here:
    webProgress = chromeWindow.getBrowser().webProgress;
  }
  
  // TODO: I (mbolin) believe that getWebProgress does not work when win
  // represents the contentWindow of an IFRAME
  // because getWebProgress(win) calls getBrowser(win) which returns null
  // For now:
  if (!webProgress) return win.document;
  
  const delay = 100;
  const maxDelay = 30000;
  const iterations = maxDelay/delay;
  var warningInterval = 5/delay;
  for (var i = 0; i < iterations; ++i) {
    checkForStop();
    if (!webProgress.isLoadingDocument) {
      recordCreatedRanges(win.document);
      return win.document;
    }
    sleepImpl(chromeWindow, delay);
  }
  throw new Error("never finished loading " + win.document.title);
}

/**
 * Tests whether the document in an HTML window is loaded.
 * @return true if loaded, false if currently loading.
 */
function isWindowLoaded(/*HtmlWindow*/ win) {
  return !getWebProgress(win).isLoadingDocument;
}


/**
    Finds a window owned by Firefox and returns it.
    Returns null if there are no such windows.
    
    @return             Returns a window.
*/
function /*Window*/ getAWindow() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator)
    var e = wm.getEnumerator(null)
    while (e.hasMoreElements()) {
        var w = e.getNext()
        return w
    }
    return null
}


function /*String*/ upperCaseOrNull(/*String*/ s) {
  if (s == null) return s;
  else return s.toUpperCase();
}


// HACK because accessors.js break in fennec

/**
 * Get the HTML Document for the given HTML Window.  If the document
 * is currently loading, then this function blocks until it is loaded.
 * @returns Document
 * @throws Error if document doesn't finish loading in 30 seconds
 */
function getLoadedHtmlDocument(/*ChromeWindow*/ chromeWindow, 
                               /*HtmlWindow*/ win) {
                               
  var webProgress = chromeWindow.getBrowser().webProgress;
  
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
    // checkForStop();
    if (!webProgress.isLoadingDocument) {
      // recordCreatedRanges(win.document);
      return win.document;
    }
    sleepImpl(chromeWindow, delay);
  }
  throw new Error("never finished loading " + win.document.title);
}

function getTabBrowser(/*ChromeWindow*/ chromeWindow) {
  return chromeWindow.getBrowser();
}
function /*String*/ upperCaseOrNull(/*String*/ s) {
  if (s == null) return s;
  else return s.toUpperCase();
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
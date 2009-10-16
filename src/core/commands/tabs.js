/**
 * Opens a new browser tab
 *
 * @param chromeWindow Firefox window in which to create the tab
 * @param url url to load in new tab
 * @param OPTIONAL bringToFront if true, brings the new tab to the front of the tab stack; default is false.
 * @param OPTIONAL invisible if true, the tab is initially hidden (used by fetch()).  Default is false.
 * @return Tab object
 */
function openTabImpl(/*ChromeWindow*/chromeWindow, 
                     /*String*/url, 
                     /*optional boolean*/bringToFront,
                     /*optional boolean*/invisible) {
  var tabbrowser = getTabBrowser(chromeWindow);
  var tab = tabbrowser.addTab(url ? url.toString() : "about:blank");
  var browser = tabbrowser.getBrowserForTab(tab);
  var win = browser.contentWindow;
  var tabObject = new Tab(win, tabbrowser, tab);

  if (bringToFront) {
    tabbrowser.selectedTab = tab;
  }
  if (invisible) {
    tab.setAttribute("collapsed", "true");
  }
  return tabObject;
}

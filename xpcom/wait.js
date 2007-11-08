/**
 * Finds a loaded tab.
 *   chromeWindow: browser window calling this function
 *   tabs: array of tabs or a single tab whose loaded status to check.  If not provided or null,
 *         then the current tab in chromeWindow is used.
 *   block: if true, then this function doesn't return until at least one tab in tabs is loaded.
 *
 * This function finds a tab in the tabs array that is fully loaded.  (If no such tab exists, 
 * then behavior depends on the block parameter.  If block is true, then the function waits until 
 * at least one tab is loaded; otherwise, it returns null immediately.)
 *
 * When a tab is loaded, the loaded tab is removed from the tabs array (using splice) and returned.
 * If more than one tab is loaded, then the choice of which to remove and return is arbitrary.
 */
function waitImpl(/*ChromeWindow*/ chromeWindow, /*optional Tab[]*/ tabs, /*boolean*/ block) {
  // If no tabs provided, assume current tab in chromeWindow
  if (!tabs) {
    tabs = [new Tab(getVisibleHtmlWindow(chromeWindow))];
  }

  // Check if tabs is already an array.
  if (!instanceOf(tabs, Array)) {
    tabs = [tabs];
  } 

  // return immediately if no tabs to look at
  if (!tabs.length) return null;

  // make sure all tabs are Tabs
  for (var i = 0; i < tabs.length; ++i) {
    if (!instanceOf(tabs[i], Tab)) {
      tabs[i] = new Tab(tabs[i]);
    }
  }

  // scan tabs looking for one that's loaded
  var count = 0;
  const delay = 0.100;
  const maxDelay = 30;
  const iterations = maxDelay/delay;
  for (var i = 0; i < iterations; ++i) {  
    for (var i = 0; i < tabs.length; ++i) {
      var tab = tabs[i];
      if (isWindowLoaded(tab._window)) {
        tabs.splice(i, 1)      
        return tab;
      }
    }
    
    if (!block) break;

    sleep(0.100);
  }

  return null;
}

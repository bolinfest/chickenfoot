/* Script to help run tests from the command line.
 *
 * Usage: firefox -cf-run allTestsCfRunner.js allTests.js output.txt
 *   "allTests.js" is the full path to that file
 *   "output.txt" is the full path to the file where test output will go
 */

chromeWindow.toggleSidebar('viewChickenfootSidebar', true)

include(arguments[0])

results = Chickenfoot.getLatestDebugEntry(Chickenfoot.getSidebarWindow(chromeWindow).document).innerHTML
Chickenfoot.SimpleIO.write(arguments[1], results)

// XXX only needed to avoid bug where -cf-run didn't let the window display before running
function quit() {
  var app = Components.classes['@mozilla.org/toolkit/app-startup;1']
  var appserv = app.getService(Components.interfaces.nsIAppStartup)
  appserv.quit(Components.interfaces.nsIAppStartup.eAttemptQuit)
}
setTimeout(quit, 1000)
/* Script to help run tests from the command line.
 * Testing scripts rely on being open in the GUI editor, so we have to
 * make that happen.
 *
 * Usage: firefox -cf-run allTestsCfRunner.js allTests.js output.txt
 *   "allTests.js" is the full path to that file
 *   "output.txt" is the full path to the file where test output will go
 */

// the build system will bootstrap us with the location of the tests and output
var alltests = Chickenfoot.SimpleIO.toFile(arguments[0])
var output = arguments[1]

// yield to the sidebar so it can get out ahead of us
setTimeout(openAndRun, 2000)

// load the script into the editor and run it
function openAndRun() {
  if ( ! Chickenfoot.getSidebarWindow(chromeWindow)) {
    chromeWindow.toggleSidebar('viewChickenfootSidebar')
    // wait again for the sidebar to open
    sleep(2)
  }
  Chickenfoot.getSidebarWindow(chromeWindow).newBufferWithFile(alltests)
  
  // give the buffer time to be created and selected
  setTimeout(runAndWrite, 2000)
}

// run the buffer, write out the results, and quit
function runAndWrite() {
  var code = Chickenfoot.getSidebarWindow(chromeWindow).getSelectedBuffer().text
  
  // evaluate is non-blocking, so we stuff this in along with the tests
  code += "\n var results = Chickenfoot.getLatestDebugEntry(sidebarWindow.document).innerHTML"
  code += "\n Chickenfoot.SimpleIO.write('" + output + "', results)"
  // then quit Firefox
  code += "\n var app = Components.classes['@mozilla.org/toolkit/app-startup;1']"
  code += "\n var appserv = app.getService(Components.interfaces.nsIAppStartup)"
  code += "\n appserv.quit(Components.interfaces.nsIAppStartup.eAttemptQuit)"

  Chickenfoot.evaluate(chromeWindow, code, true)
}
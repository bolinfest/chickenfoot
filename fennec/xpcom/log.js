/**
 * Logs a string into the Error Console
 */
function log(/*string*/ str) {
  // var ConsSrv = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
  // ConsSrv.logStringMessage(str);
}
function log2(/*string*/ str) {
  var ConsSrv = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
  ConsSrv.logStringMessage(str);
}

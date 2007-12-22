/*
 * Caveats:
 *
 * (1) This library uses fetch(), so currently, it only works on MS Windows.
 * (2) This library requires that you have a Google AJAX Search API license key,
 *     which you can get for free from http://code.google.com/apis/ajaxsearch/
 */

/**
 * Returns the Google AJAX Search API license key to be used by this library.
 * To obtain a license key, visit http://code.google.com/apis/ajaxsearch/
 *
 * You can either redefine this function to return the key or create a
 * preference in about:config named google.google.GoogleAjaxSearchLicenseKey whose value is the key.
 *
 * @return {string} license key, which looks something like:
 *     ABQIAAAAHNAg0mie90o9HZkujG4DkBT4MUuHIft4BOh_YXgQXu7MXMg36BSRzEZo9X7Mn6i8WNzoCyT0jnD0hA
 */
function getGoogleAjaxSearchLicenseKey() {
  var branch = Components.classes['@mozilla.org/preferences-service;1'].
               getService(Components.interfaces.nsIPrefService).
               getBranch('google.');
  if (branch.prefHasUserValue('GoogleAjaxSearchLicenseKey')) {
    return branch.getCharPref('GoogleAjaxSearchLicenseKey');
  }
  // TODO: implement this function so it returns your Google Web API license key
  throw new Error("need to override getGoogleAjaxSearchLicenseKey() or set " +
      "the google.GoogleAjaxSearchLicenseKey preference in about:config");
}

/**
 * Takes a URL that points to a JavaScript file, gets the JavaScript code,
 * and evaluates it in the context of the current window.
 */
function loadJavaScript(url) {
  var js = fetch(url).document.documentElement.textContent;
  eval.call(window, js);
}

/**
 * Overwrite document.write() so it behaves appropriately when the
 * JavaScript is evaluated.
 */
window.document.write = function(scriptTag) {
  var m = scriptTag.match(/src="([^"]*)"/);
  loadJavaScript(m[1]);
}

loadJavaScript("http://www.google.com/uds/api?file=uds.js&v=0.1&key=" +
    getGoogleAjaxSearchLicenseKey());

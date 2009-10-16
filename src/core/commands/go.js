
/**
 * CF_GO_REGEXP is a regexp that tries to match a valid URI
 * 
 * When a string is successfully matched against CF_GO_REGEXP,
 * it returns an array with the following elements:
 *
 * 0:  the original string
 * 1:  "http", "https", "ftp", "file", "chrome", "about", "moz-icon", or null
 * 2:  "://" if it exists, null otherwise
 * 3:  "www." if it exists, null otherewise
 * 4+: other possibly null strings -- this part of the spec may change,
 *     so do not rely on it
 */
const CF_GO_REGEXP = new RegExp(
  '^(https?|ftp|file|chrome|about|moz-icon)?(:\/\/)?(www\.)?(.*)'
);

/**
 * Tries to go to the provided url in the given window
 *
 * @param win window to load URL in
 * @param url the URL to go to
 * @param reload OPTIONAL force go() to refresh
 *   the page if document.location == url
 */
function goImpl(/*Window*/ win, /*String*/ url, /*Boolean*/reload) {
  if (url == null) return;
  url = url.toString(); // since it may be passed a document.location
  // do not follow javascript: links
  if (url.match(/^javascript:/)) return;
  var matches = url.match(CF_GO_REGEXP);
  if (matches && matches[1] == null) url = "http://" + url;
  if (!reload && win.location == url) return;
  win.location = url;
}

/** Test code for RegExp:
var arr = new Array();
re = new RegExp(
'^(https?|ftp|file|chrome|about|moz-icon)?(:\/\/)?(www\.)?(.*)'
);

arr.push( 'file:///c:/eclipse/workspace/chickenfoot/build/download.html' );
arr.push( 'http://yahoo.com' );
arr.push( 'https://www.yahoo.com/' );
arr.push( 'ftp://mozilla.org/' );
arr.push( 'www.bolinfest.com' );
arr.push( 'google.com' );
arr.push( 'about:blank' );
arr.push( 'chrome://googledominoes/content/search.html?q=search' );

for (var i = 0; i < arr.length; i++) {
  m = arr[i].match(re);
  debug(m[1]);
}
*/
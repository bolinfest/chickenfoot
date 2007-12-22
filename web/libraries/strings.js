/**
 * Takes a string and returns it with leading and trailing whitespace removed.
 *
 * If str is null, the empty string is returned.
 */
function trim(/*string*/ str) {
  if (str == null) return "";
  str = str.replace(/^\s+/, '');
  str = str.replace(/\s+$/, '');
  return str;
}

function escapeHtml(/*string*/ html) {

}

function unescapeHtml(/*string*/ html) {

}

function stripTags(/*string*/ html) {

}
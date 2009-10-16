/* This file contains a collection of string utility functions.
 */

function condenseSpaces (/*string*/ str, /*optional DeleteMap*/ map) {
  var totalDeletions = 0;
  if (str == null) return "";
  return str.replace(/\s+/gm, getReplacement);

  function getReplacement(/*String*/ spacesMatched,
                    /*int*/ offset,
                    /*String*/ originalString) {
    var replacement; // replacement for match
    var pos = offset; // position of deleted whitespace in original raw string
    var len = spacesMatched.length;  // length of deleted whitespace

    if (pos == 0) {
      // whitespace at start of string is removed entirely
      replacement = '';

      // map cooked offset 0 to after the deleted whitespace
      if (map) map.add(0, len);
    } else if (pos + len == originalString.length) {
      // whitespace at end of string is also removed, but
      // cooked position should map to just after last nonwhite char,
      // so don't add to map
      replacement = '';
    } else {
      // internal whitespace is replaced by a single space
      replacement = ' ';
      --len;

      // map cooked offset just after space to the length of the deleted whitespace
      if (map && len > 0) map.add((pos-totalDeletions)+1, len);
    }

    totalDeletions += len;

    return replacement;
  }
}

/**
 * DeleteMap keeps track of the deletions made by a function like condenseSpaces(),
 * so that offsets in the function's output string (the "cooked string") can
 * be mapped back to offsets in the function's longer input string (the "raw string").
 */
function DeleteMap() {
  this.map = [];
}

/**
 * Record a deletion in the map.  Used by condenseSpaces().
 */
DeleteMap.prototype.add = function(/*int*/ cooked, /*int*/ len) {
  this.map.push(cooked);
  this.map.push(len);
}

/**
 * Convert a cooked offset into a raw offset.  Used by clients of condenseSpaces().
 * @param offset in cooked text, 0 <= cooked <= cookedString.length
 * @returns corresponding offset in raw text, 0<=raw<=rawString.length
 */
DeleteMap.prototype.cookedToRaw = function(/*int*/ cooked) {
  var totalDeletions = 0;
  for (var i = 0; i < this.map.length; i += 2) {
    var posI = this.map[i];
    var lenI = this.map[i+1];
    if (posI <= cooked) {
      totalDeletions += lenI;
    } else {
      break;
    }
  }
  return cooked + totalDeletions;
}





/** place a backslash before every " in the string */
function backquote(/*string*/ str) {
  if (!str) return "";
  return str.replace(/\"/mg, '\\"');
}

function makeFirstLetterLowercase(/*string*/ s) {
  if (s.length == 0) {
    return s
  } else {
    return s.substring(0, 1).toLowerCase() + s.substring(1)
  }
}

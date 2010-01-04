goog.provide('ckft.util.strings');
goog.provide('ckft.util.strings.DeleteMap');

/**
 *  This file contains some string utility functions and classes.
 */


/**
 * Convert a string to upper case, passing through null unchanged.
 * Particularly useful for tagname comparisions, e.g. ckft.util.strings.upperCaseOrNull(node.tagName) == "SCRIPT".
 * @param {string} s
 * @return {string} s.toUpperCase if s is nonnull, otherwise null 
 */
ckft.util.strings.upperCaseOrNull = function(s) {
    return (s == null) ? null : s.toUpperCase();
}


/**
 * Regularize whitespace in a string.  Removes starting and ending whitespace entirely, 
 * and replaces internal runs of whitespace with a single space character.
 * Optionally records the locations of the removed whitespace in a DeleteMap, so
 * that an offset in the "cooked" output can be mapped to an offset in the
 * "raw" input.  This is useful when you apply a pattern match (like a regular expression) 
 * to the cooked output, because it allows you to map matching offsets back to a range
 * in the raw input.
 * @param {string} str  String to remove spaces from
 * @param {ckft.util.strings.DeleteMap=} map   Optional DeleteMap to record coordinate mapping
 *                                         between str and return value
 * @return {string} str with leading and trailing whitespace removed, and internal
 *                  whitespace replaced with a single space
 */
ckft.util.strings.condenseSpaces = function(/*string*/ str, /*optional DeleteMap*/ map) {
    var totalDeletions = 0;
    if (str == null) return "";
    return str.replace(/\s+/gm, getReplacement);

  /**
   * Function to apply to each run of whitespace in the string.
   * @param {string} spacesMatched   the run of whitespace
   * @param {int} offset  The offset where the run starts
   * @param {string} originalString  the entire string being condensed (the str parameter to condenseSpaces)
   * @return {string} string that should replace spacesMatched in originalString
   * @private
   */
    function getReplacement(spacesMatched, offset, originalString) {
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
 * @constructor
 */
ckft.util.strings.DeleteMap = function() {
    /**
     * map consists of 2n numbers, (coff_1,len_1,...,coff_n,len_n).
     * coff_i,len_i means that a substring of length len_i was deleted from the raw string
     * at offset coff_i in the cooked string.
     *   For example, if the raw string is "howdy world", and the cooked string is "hdy wd",
     *   then the map would be [1,2, 5,3]
     *          1,2 because the length-2 string "ow" is missing at offset 1 in "hdy wd"
     *          5,3 because the length-3 string "orl" is missing at offset 5 in "hdy wd" 
     * Invariant: 0 <= coff_1 <= ... <= coff_n; len_i >= 0.
     * @type {Array.number}
     * @private
     */
    this.map = [];
}

/**
 * Record that a substring was deleted from the raw string to produce the cooked string.
 * Requires cookedOffset >= any previous cookedOffset values passed to add(). 
 * @param {number} cookedOffset  offset in the cooked string where the deleted substring appeared
 * @param {number} len length of deleted substring
 */
ckft.util.strings.DeleteMap.prototype.add = function(/*int*/ cookedOffset, /*int*/ len) {
    this.map.push(cookedOffset);
    this.map.push(len);
}

/**
 * Convert a cooked offset into a raw offset.
 * For example, if the raw string is "howdy world", and the cooked string is "hdy wd",
 * then cookedToRaw(0) == 0   ("|hdy wd" => "|howdy world") 
 *      cookedToRaw(3) == 5   ("hdy| wd" => "howdy| world")
 *      cookedToRaw(5) == 10  ("hdy w|d" => "howdy worl|d")
 * @param {number} cooked   offset in cooked text, >= 0
 * @return {number} corresponding offset in raw text, >= 0
 */
ckft.util.strings.DeleteMap.prototype.cookedToRaw = function(/*int*/ cooked) {
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

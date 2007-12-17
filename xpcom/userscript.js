/**
 * Tools for handling Greasemonkey userscripts and Chickenfoot trigger scripts
 *
 * Can identify the ==UserScript== tag and attributes within it
 * 
 */

/**
 * Take a string of Chickenscratch and extract any information
 * inside any ==UserScript== tags.
 *
 * @param code {string}
 * @param keyValueHandler {function}
 * @param lineBuffer {string[]} 
 * @return {attributeName->attributeValue[]} keys are attribute names and values
 *   are arrays of values that correspond to that attribute.
 *   Some attributes, such as @exclude, can be repeated, which is why arrays are
 *   used as values for the map.
 */
function extractUserScriptAttributes(code,
                                     /*optional*/ keyValueHandler,
                                     /*optional*/ commentClosingHandler,
                                     /*optional*/ lineBuffer) {
  // this is a fairly simple implementation; it assumes that
  // each attribute name/value pair fit on one line
  var lines = code.split('\n');
  var inComment = false;
  var map = {};
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    if (!inComment) {
      if (line.match(/^\s*\/\/\s+==UserScript==\s*$/)) {
        inComment = true;
      }
      if (lineBuffer) lineBuffer.push(line);
    } else {
      if (line.match(/^\s*\/\/\s+==\/UserScript==\s*$/)) {
        inComment = false;
        if (commentClosingHandler) commentClosingHandler();
        if (lineBuffer) lineBuffer.push(line);
      } else {
        var match;
        if (match = line.match(/^\s*\/\/\s+@(\w+)\s+(.*)\s*$/)) {
          var k = match[1], v = match[2];
          var a = (k in map) ? map[k] : (map[k] = []);
          a.push(v);
          if (lineBuffer && (line = keyValueHandler(line, k, v))) {
            lineBuffer.push(line);
          }
        } else {
          if (lineBuffer) lineBuffer.push(line);
        }
      }
    }
  }  
  return map;
}

/**
 * This method takes a map of attributes and a string of code. It updates the
 * attributes in the code, and returns the new string. It does not overwrite any
 * existing attributes that are not being updated.
 * @param oldCode : string //the code to update
 * @param map : key->value attribute map //the attributes to update and their new values
 * @return a string of the updated code
 */
function updateAttributes(oldCode, map) {
  //get all the attributes in the existing code, and add all of the non-matching key->value
  // mappings to 'map' so that we don't overwrite any attributes that we don't want to update
  var existingAttMap = {};
  try { existingAttMap = extractUserScriptAttributes(oldCode); }
  catch(e) {}
  var code = removeExistingAttributes(oldCode);
  
  var lineBuffer = [];
  lineBuffer.push('// ==UserScript==');

  //put in all non-includes/excludes attributes
  for (var key in map) {
    try {
      var currentArray = map[key].toArray();
      if(currentArray.length == 0) { Chickenfoot.debug(currentArray); continue; }
      for(var i=0; i<currentArray.length; i++) {
        lineBuffer.push('// @' + key + ' ' + currentArray[i]);
      }
    }
    catch(e) { if(map[key]) { lineBuffer.push('// @' + key + ' ' + map[key]); } }
  }

  //put in all the non-updated attributes
  for(var key in existingAttMap) {
    if (!(key in map)) lineBuffer.push('// @' + key + ' ' + existingAttMap[key]);
  }
  
  lineBuffer.push('// ==/UserScript=='); 
  var newCode = lineBuffer.join('\n') + "\n\n" + code;

  return newCode;
}

function removeExistingAttributes(/*String*/code) {
  var codeStrings = [];
  
  var lines = code.split('\n');
  var inComment = false;
  for (var i=0; i<lines.length; i++) {
    var line = lines[i];
    if (!inComment && line.match(/^\s*\/\/\s+==UserScript==\s*$/)) { inComment = true; continue; }
    else if (line.match(/^\s*\/\/\s+==\/UserScript==\s*$/)) { inComment = false; continue; }
    else if (inComment && line.match(/^\s*\/\/\s+@(\w+)\s+(.*)\s*$/)) { continue; }
    else { codeStrings.push(line); }
  }
  
  var newCode = codeStrings.join('\n');
  return newCode;
}
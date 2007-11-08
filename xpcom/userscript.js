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

function updateAttributes(oldCode, map) {
   // keys that have already been read
  var readKeys = {
    includes : "",
    excludes : ""
  };
  var includes = map.includes;
  var excludes = map.excludes;  
  
  var code = removeExistingAttributes(oldCode);
  var lineBuffer = [];
  lineBuffer.push('// ==UserScript==');

  for (var key in map) {
    if (!(key in readKeys)) lineBuffer.push('// @' + key + ' ' + map[key]);
  }

  var includesArray = includes.toArray();
  for (var i = 0; i < includesArray.length; ++i) {
    lineBuffer.push('// @include ' + includesArray[i]);
  }

  var excludesArray = excludes.toArray();
  for (var i = 0; i < excludesArray.length; ++i) {
    lineBuffer.push('// @exclude ' + excludesArray[i]);
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
/**
 * Match is an iterator that returns the matches to a pattern,
 * with accessors for obtaining the matches in various forms
 * (as plain text, as HTML, as Node, as Range).
 */
function Match(/*string*/ html,
               /*Match*/ next,
               /*Element*/ element,
               /*Range*/ range,
               /*Document*/ document,
               /*int*/ index,
               /*boolean*/ hasMatch
               ) {
  this._html = html;
  this._count = (next) ? next.count + 1 : 0;
  this._next = next;
  this._element = element;
  this._range = range;
  if (!element && range) this._element = rangeToElement(range);
  if (!range && element) this._range = nodeToRange(element);
  this._document = document;
  this._index = index;
  this._hasMatch = !!hasMatch;
  
  if (!this._hasMatch) {this._text =  "no matches";}
  else if (this._range) {this._text = this._range.toString();}
  else {this._text = "";}
}

function winToMatch(/*win*/win) {
  var html = "chromeWindow"
  var range = null
  var doc = win.document
  return new Match(html, EMPTY_MATCH, win, range, doc, 0, true);
}

function nodeToMatch(/*Node*/ node) {
  return new Match((flattenDom(node))[0],
                              EMPTY_MATCH,
                              nodeToElement(node),
                              nodeToRange(node),
                              node.ownerDocument,
                              0,  
                              true);
}

function nodeToElement(/*Node*/ node) {
  return (node.nodeType == Node.ELEMENT_NODE) ? node : nodeToElement(node.parentNode);
}

function nodesToMatches(/*Node[]*/ nodes) {
  var lastMatch = EMPTY_MATCH;
  for (var i = nodes.length - 1; i >= 0; --i) {
    var match = nodeToMatch(nodes[i]);
    match._next = lastMatch;
    match._count = lastMatch.count + 1;
    match._index = i;
    lastMatch = match;
  }
  return lastMatch;
}

// Make a single-element Match iteration that consists of just the
// current Match element m, or EMPTY_MATCH if m is EMPTY_MATCH.
function oneMatch(/*Match*/ m) {
  if (!m.hasMatch) return EMPTY_MATCH;
  else return new Match(m.html,
                       EMPTY_MATCH,
                       m.element,
                       m.range,
                       m.document,
                       0,
                       true);
}

// Augment an Error thrown by a pattern-matching function (such as click())
// with the Match that caused the error, which also adds the ability 
// to highlight the Match in the web page for easier debugging.
function addMatchToError(/*Error*/error, /*Match*/ match) {
  error.match = match;
  error.toChickenfootDebugOutput = function(/*Node*/ debugEntry) {
    if (match.hasMatch) selectAll(match.document.defaultView, match);
    return this;
  }
  return error;
}

Match.prototype.find = function(pattern) {
  return Pattern.find(this._document, pattern, [], this.range);
}
Match.prototype.click = function(pattern) { 
  clickImpl(this._document, pattern, this.range); 
};
Match.prototype.enter = function(pattern, value) { 
  enterImpl(this._document, pattern, value, this.range); 
};
Match.prototype.reset = function(pattern) { 
  resetImpl(this._document, pattern, this.range); 
};
Match.prototype.pick = function(listPattern, choicePattern, checked) { 
  pickImpl(this._document, arguments, this.range); 
};
Match.prototype.keypress = function(keySequence, destination) { 
  keypressImpl(this._document, keySequence, destination); 
  };
Match.prototype.unpick = function(listPattern, choicePattern, checked) { 
  unpickImpl(this._document, arguments, this.range); 
};
Match.prototype.check = function(pattern,checked) { 
  checkImpl(this._document, pattern, this.range); 
};
Match.prototype.uncheck = function(pattern) { 
  uncheckImpl(this._document, pattern, this.range); 
};

try {
  // Iterators are only available in Firefox 2.0+.
  // If we're running in an older version of Firefox,
  // then this eval() will simply fail and we won't 
  // have an __iterator__ property on Match.
  Match.prototype.__iterator__ = 
    eval("function() { for (var m = this; m.hasMatch; m = m.next) yield m; }");
} catch (err) {
  // yield must have been a syntax error, so just don't support iterators
}

Match.prototype.__defineGetter__("hasMatch",
  function() { return this._hasMatch; });

Match.prototype.__defineGetter__("count",
  function() { return this._count; });
  
Match.prototype.__defineGetter__("next",
  function() { return this._next; });

Match.prototype.__defineGetter__("range",
  function() { return this._range; });

Match.prototype.__defineGetter__("content",
  function() {
    if (this._content) return this._content;
    else if (this._range) return this._content = this._range.cloneContents();
    // TODO set content sensibly when Range is null
    else return null;
  });

Match.prototype.__defineGetter__("element",
  function() { return this._element; });

Match.prototype.__defineGetter__("document",
  function() { return this._document; });

Match.prototype.__defineGetter__("text",
  function() { return this._text; });

Match.prototype.__defineGetter__("html",
  function() { return this._html; });

Match.prototype.__defineGetter__("index",
  function() { return this._index; });

Match.prototype.toString = function() {
  if (!this._hasMatch) {return "no matches";} 
  else {return "[object Match]";}
}


Match.prototype.isDomRange = function() {
  return (this.range != null);
}

// add every method of String as a method of Match that forwards to toString() 
Match.prototype.__defineGetter__("length",
  function() { return this.toString().length; });
// automatically generated forwarding methods
Match.prototype.anchor = function() { var str = this.toString(); return str.anchor.apply(str, arguments); } 
Match.prototype.big = function() { var str = this.toString(); return str.big.apply(str, arguments); } 
Match.prototype.blink = function() { var str = this.toString(); return str.blink.apply(str, arguments); } 
Match.prototype.bold = function() { var str = this.toString(); return str.bold.apply(str, arguments); } 
Match.prototype.charAt = function() { var str = this.toString(); return str.charAt.apply(str, arguments); } 
Match.prototype.charCodeAt = function() { var str = this.toString(); return str.charCodeAt.apply(str, arguments); } 
Match.prototype.concat = function() { var str = this.toString(); return str.concat.apply(str, arguments); } 
Match.prototype.fixed = function() { var str = this.toString(); return str.fixed.apply(str, arguments); } 
Match.prototype.fontcolor = function() { var str = this.toString(); return str.fontcolor.apply(str, arguments); } 
Match.prototype.fontsize = function() { var str = this.toString(); return str.fontsize.apply(str, arguments); } 
Match.prototype.indexOf = function() { var str = this.toString(); return str.indexOf.apply(str, arguments); } 
Match.prototype.italics = function() { var str = this.toString(); return str.italics.apply(str, arguments); } 
Match.prototype.lastIndexOf = function() { var str = this.toString(); return str.lastIndexOf.apply(str, arguments); } 
Match.prototype.link = function() { var str = this.toString(); return str.link.apply(str, arguments); } 
Match.prototype.localeCompare = function() { var str = this.toString(); return str.localeCompare.apply(str, arguments); } 
Match.prototype.match = function() { var str = this.toString(); return str.match.apply(str, arguments); } 
Match.prototype.replace = function() { var str = this.toString(); return str.replace.apply(str, arguments); } 
Match.prototype.search = function() { var str = this.toString(); return str.search.apply(str, arguments); } 
Match.prototype.slice = function() { var str = this.toString(); return str.slice.apply(str, arguments); } 
Match.prototype.small = function() { var str = this.toString(); return str.small.apply(str, arguments); } 
Match.prototype.split = function() { var str = this.toString(); return str.split.apply(str, arguments); } 
Match.prototype.strike = function() { var str = this.toString(); return str.strike.apply(str, arguments); } 
Match.prototype.sub = function() { var str = this.toString(); return str.sub.apply(str, arguments); } 
Match.prototype.substr = function() { var str = this.toString(); return str.substr.apply(str, arguments); } 
Match.prototype.substring = function() { var str = this.toString(); return str.substring.apply(str, arguments); } 
Match.prototype.sup = function() { var str = this.toString(); return str.sup.apply(str, arguments); } 
Match.prototype.toLocaleLowerCase = function() { var str = this.toString(); return str.toLocaleLowerCase.apply(str, arguments); } 
Match.prototype.toLocaleUpperCase = function() { var str = this.toString(); return str.toLocaleUpperCase.apply(str, arguments); } 
Match.prototype.toLowerCase = function() { var str = this.toString(); return str.toLowerCase.apply(str, arguments); } 
Match.prototype.toSource = function() { var str = this.toString(); return str.toSource.apply(str, arguments); } 
//Match.prototype.toString = function() { var str = this.toString(); return str.toString.apply(str, arguments); } 
Match.prototype.toUpperCase = function() { var str = this.toString(); return str.toUpperCase.apply(str, arguments); } 
Match.prototype.valueOf = function() { var str = this.toString(); return str.valueOf.apply(str, arguments); } 

// Does not seem to work correctly when listed before complete prototype
EMPTY_MATCH = new Match();
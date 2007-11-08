/**
 * Insert, remove, replace
 */

/**
 * Deletes the first instance of pattern
 * from the current web page.
 * Returns the contents of the pattern as it's return value
 * Returns null if you try to remove a pattern that does not exist on the page
 */
function removeImpl(/*HtmlDocument*/ doc, /*Pattern*/ pattern) {
  var range = patternAsRange(pattern, doc);
  if (!range) return null;
  var rangeContents = range.extractContents();
  range.deleteContents();
  Test.assertTrue(range.collapsed, "range must be collapsed to be a Position")
  return rangeContents;
}

/**
* Special form of remove that is called internally be replace.
* Deletes the first instance of pattern
* from the current web page.
* Returns the range (which is a position) of the pattern's starting point. 
* Returns null if the pattern was not found.
**/
function removeImplForReplace(/*HtmlDocument*/ doc, /*Pattern*/ pattern) {
  var range = patternAsRange(pattern, doc);
  if (!range) return null;
  range.deleteContents();
  Test.assertTrue(range.collapsed, "range must be collapsed to be a Position");
  return range;
}


/**
 * Replaces the first occurrence of a pattern with a different chunk of HTML.
 * Returns the inserted chunk.
 * Returns null if the pattern was not found.
 */
function replaceImpl(/*HtmlDocument*/ doc, /*Pattern*/ pattern, /*Chunk*/ replacement) {
  var range = removeImplForReplace(doc, pattern);
  if (!range) return null;
  return insertImpl(doc, range, replacement);
}

//ranges created around anonymous nodes cannot create a new node that
//is visible to the DOM using createContextualFragment.
//so, work around this by first inserting the chunk before the parentBinding
//then replacing the anonymous node with this already formed node
function insertForAnonNodes(/*document*/ doc, /*Range*/ range, /*Chunk*/ newText) {
  if (doc.getBindingParent(range.startContainer)) {
    nearestRealNode = doc.getBindingParent(range.startContainer) }
  else {nearestRealNode = range.startContainer}
  var tempPosition = beforeImpl(doc, nearestRealNode);
  insertImpl(doc, tempPosition, newText);
  //find the temporary node by iterating through a deepTreeWalker
  //until the currentNode.nextSibling is the parentBinding
  var treeWalker = Chickenfoot.createDeepTreeWalker(doc, NodeFilter.SHOW_ALL);
  var nodeToInsert = treeWalker.currentNode; 
  while (!(nodeToInsert.nextSibling && nodeToInsert.nextSibling == nearestRealNode)) {
    nodeToInsert = treeWalker.nextNode(); }    
  return replaceImpl(doc, range, nodeToInsert);}

/**
 * @param position a Pattern that indicates where the insertion occurs
 * @param newText a Chunk that should be inserted
 * @return the Node version of the Chunk that was inserted
 */
function insertImpl(/*HtmlDocument*/ doc, /*Pattern*/ position, /*Chunk*/ newText) {
  var range = patternAsRange(position, doc);
  if (!range.collapsed) throw Error("position does not identify a point in the document")

  // since range is collapsed, does not matter if we use start or end
  var container = range.startContainer;
  var offset = range.startOffset;

  var startRanges = (container.startRanges) ? container.startRanges : [];
  var endRanges = (container.endRanges) ? container.endRanges : [];
  
  var newNode = chunkAsNode(newText, range);
  if (newNode == 'anonymous content') {
    return insertForAnonNodes(doc, range, newText);
  }

  if (container.nodeType == Node.TEXT_NODE) {
    // record ranges whose start offset will need to be updated
    var range2startOffset = new SlickMap/*<Range,int>*/();
    for (var i = 0; i < startRanges.length; i++) {    
      var r = startRanges[i];
      if (r.startOffset > offset) {
        range2startOffset.put(r, r.startOffset);
        startRanges.splice(i--, 1);
      }
    }
    // record ranges whose end offset will need to be updated    
    var range2endOffset = new SlickMap/*<Range,int>*/();
    for (var i = 0; i < endRanges.length; i++) {
      var r = endRanges[i];
      if (r.endOffset > offset) {
        range2endOffset.put(r, r.endOffset);
        endRanges.splice(i--, 1);
      }
    }

    // save nextSibling for the insertion
    var newTextNode = container.nextSibling;

    // do the insertion
    range.insertNode(newNode);
    
    // if had nextSibling, the newTextNode is the now the previousSibling of that node
    // if no nextSibling, then newTextNode is last child of parentNode
    newTextNode = (newTextNode)
      ? newTextNode.previousSibling
      : container.parentNode.childNodes.item(
          container.parentNode.childNodes.length - 1
        );
    
    // FIX UP RANGES

    // extend ends of ranges before starts 
    var endEntries = range2endOffset.entries();
    newTextNode.endRanges = (newTextNode.endRanges) ? newTextNode.endRanges : [];
    for (var i = 0; i < endEntries.length; i++) {
      var r = endEntries[i].key;
      var diff = endEntries[i].value - container.nodeValue.length;      
      r.setEnd(newTextNode, diff);
      newTextNode.endRanges.push(r);
    }
    range2endOffset.clear();

    var startEntries = range2startOffset.entries();
    newTextNode.startRanges = (newTextNode.startRanges) ? newTextNode.startRanges : [];
    for (var i = 0; i < startEntries.length; i++) {
      var r = startEntries[i].key;
      var diff = startEntries[i].value - container.nodeValue.length;      
      r.setStart(newTextNode, diff);
      newTextNode.startRanges.push(r);
    }
    range2startOffset.clear();

  } else { // presumably element node
    // record ranges whose start offset will need to be updated
    var range2diff = new SlickMap/*<Range,int>*/();
    for (var i = 0; i < startRanges.length; i++) {
      var r = startRanges[i];
      if (r.startOffset == range.startOffset) {
        range2diff.put(r, r.endOffset);        
      }
    }
    // do the insertion
    range.insertNode(newNode);
    // FIX UP RANGES
    var entries = range2diff.entries();
    for (var i = 0; i < entries.length; i++) {
      var r = entries[i].key;
      var diff = r.endOffset - entries[i].value;
      r.setStart(container, diff);
    }
    range2diff.clear();
  }
  
 // FIX: should return a Match here,
 // but simply calling nodeToMatch() breaks because
 // of bug #128.
 return newNode;
}

/**
 * Changes a document so that all ranges created from it
 * are memoized, so that insert() can fix them up properly.
 */
function recordCreatedRanges(/*HtmlDocument*/ doc) {
/*
  TODO restore this once insert.js code is ready to actually use these
  ranges
  
  if ("_MozillaDocumentCreateRange" in doc) return doc; // already instrumented
  
  doc._MozillaDocumentCreateRange = doc.createRange;
  doc.ranges = new SlickSet();  
  doc.createRange = function() {
    var range = this._MozillaDocumentCreateRange();      
    this.ranges.add(range);
    
    // TODO add listeners and whatnot
    return range;
  };
*/
}

/**
 * Takes a pattern and returns a Range
 * that represents the point just before it.
 * The range returned will be collapsed.
 */
function beforeImpl(/*HtmlDocument*/ doc, pattern) {
  var range = patternAsRange(pattern, doc);
  range = range.cloneRange();
  range.collapse(true);
  return range;
}

/**
 * Takes a pattern and returns a Range
 * that represents the point just after it
 * The range returned will be collapsed.
 */
function afterImpl(/*HtmlDocument*/ doc, pattern) {
  var range = patternAsRange(pattern, doc);
  range = range.cloneRange();
  range.collapse(false);
  return range;
}

/**
 * A pattern is:
 * (1) Match
 * (2) Node
 * (3) Range
 * (4) Keyword/TC string
 * (5) Link
 * (6) Button
 *
 * patternAsRange may return null 
 */
function patternAsRange(pattern, doc) {
  if (!pattern) throw Error("null argument passed to patternAsRange");
  if (instanceOf(pattern, DocumentFragment)) {
    var doc = pattern.ownerDocument;
    var range = doc.createRange();
    range.setStart(pattern.firstChild.parentNode, getChildIndex(pattern.firstChild));
    range.setEnd(pattern.lastChild.parentNode, getChildIndex(pattern.lastChild) + 1);
    return range;
  } else if (instanceOf(pattern, Node)) {
    return nodeToRange(pattern);
  } else if (instanceOf(pattern, Link) || instanceOf(pattern, Button)) {
    throw new Error("pattern as LinkOrButton is not supported yet");
  } else if (instanceOf(pattern, Range)) {
    return pattern;
  } else if (instanceOf(pattern, Match)) {
    // TODO handle case where Match.range is null
    return pattern.range;
  } else {
    var mozMatch = Pattern.find(doc, pattern);
    if (!mozMatch) return null;
    // TODO handle case where Match.range is null
    return mozMatch.range;
  }
}

/**
 * A pattern is:
 * (1) Match
 * (2) Node
 * (3) Range
 * (4) Keyword/TC string
 * (5) Link
 * (6) Button
 *
 * patternAsNode may return null 
 */
function patternAsNode(pattern, doc) {
  if (!pattern) throw Error("null argument passed to patternAsNode");
  if (instanceOf(pattern, DocumentFragment)) {
    return pattern;
  } else if (instanceOf(pattern, Node)) {
    return pattern;
  } else if (instanceOf(pattern, Link) || instanceOf(pattern, Button)) {
    throw new Error("pattern as LinkOrButton is not supported yet");
  } else if (instanceOf(pattern, Range)) {
    throw new Error("pattern as Range not supported yet"); 
  } else if (instanceOf(pattern, Match)) {
    // TODO handle case where Match.range is null
    return pattern.element;
  } else {
    var match = Pattern.find(doc, pattern);
    return match.element;
  }
}

/**
 * A chunk is:
 * (1) Match
 * (2) Node
 * (3) Range
 * (4) DocumentFragment
 * (5) Link, Button, or any class that implements a method toNode(Range)
 * (6) String
 *
 * The range parameter should correspond to where the returned node
 * will be inserted in the document, so that chunkAsNode can create
 * a ndoe appropriate to the context..
 */
function chunkAsNode(chunk, range) {
  if (!chunk) throw Error("null argument passed to chunkAsNode()");
  
  if (typeof chunk == "object") {
    if (instanceOf(chunk, Match)) {
      // TODO handle case where Match.range is null
      // return chunk.range.cloneContents();
      return chunk.content;
    } else if (instanceOf(chunk, Node)) { // includes DocumentFragment
      return chunk;
    } else if (instanceOf(chunk, Range)) {
      return chunk.cloneContents();
    } else if ("toNode" in chunk) {
      // provided by, e.g. Button and Link
      return chunk.toNode(range);
    }
  }

  // otherwise, treat it as a string
  try {
    return range.createContextualFragment(chunk.toString()); }
  catch(err) {
    return 'anonymous content' }
}
/**
 * Regular expression pattern matching on DOM text.
 *
 * Searches text blobs inside root for the given regular expression.
 * (Match can't cross text blob boundaries.)
 */
function findRegexp(/*Document*/ doc, /*RegExp*/ pattern, /*optional Range*/ context) {
  var root = doc;
  if (context) {
    // FIX: really should search only inside range
    root = rangeToContainer(context);
    doc = root.ownerDocument;
  }
  var iter = new RegexpIterator(root, pattern);  
  var range;
  var ranges = [];
  while (range = iter.next()) {
    ranges.push(range);
  }
  
  var lastMatch = EMPTY_MATCH;
  for (var i = ranges.length-1; i >= 0; --i) {
    range = ranges[i];
    //debug(range.toString());
    lastMatch = new Match(range.toString(), // FIX: need to return HTML if range spans several nodes
                          lastMatch,
                          null,
                          range,
                          doc,
                          i,  
                          true);
    // transfer paren group matches from Range to Match object
    lastMatch.groups = [];
    for (var j = 0; j < range.length; ++j) {
      lastMatch.groups.push(range[j]);
    }
  }
  return lastMatch;
}

 
/*
 * Iterator that yields a Range object r for each match, which is further
 * augmented so that r[0] = text of full match, r[1] = text of first parenthesized expr,
 * etc.
 *
 * Example: finding email addresses:
 *   var iter = new RegexpIterator(document, /(\W+)@(\W+)/);
 *   var range;
 *   while (range = iter.next()) {
 *     var emailAddress = range[0]); // e.g. "rcm@mit.edu"
 *     var username = range[1]; // e.g. "rcm"
 *     var hostname = range[2]; // e.g. "mit.edu"
 *   }
 */
function RegexpIterator(/*Document|Node*/ root, /*RegExp*/ regexp) {
  // make sure regexp is a global
  if (!regexp.global) {
    regexp = new RegExp(regexp.source, "g" + (regexp.ignoreCase ? "i" : ""));
  }
  this.regexp = regexp;
  this.iter = makeBlobIterator(root);
  this.doc = this.iter.root.ownerDocument;
  this.iteratorDone = false;
  this.blob = null;  
}

RegexpIterator.prototype.next = function() {
  if (this.iteratorDone) return null;
  
  while (true) {
    if (!this.blob) {
      this.blob = this.iter.next();
      if (!this.blob) {
        iteratorDone = true;
        return null;
      }
      
      this.node = null;
      this.iNode = -1;
      this.iLastNode = this.blob._nodes.length - 1;
      this.rawStartOfNode = 0;
      this.rawEndOfNode = 0;
    }
    
    var m = this.regexp.exec(this.blob.value);
    if (!m) {
      this.blob = null;
    } else {
      var len = m[0].length;
      if (!len) ++this.regexp.lastIndex; // make sure we don't loop forever
      
      //debug(m);
      var startOffset = this.cookedToNodeOffset(m.index, true);
      var startNode = this.node;
      //debug(startNode + "@" + startOffset);
      var endOffset = this.cookedToNodeOffset(m.index + len, !len);
      var endNode = this.node;
      //debug(endNode + "@" + endOffset);

      var range = this.doc.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);

      // copy group matches into returned range
      for (var i = 0; i < m.length; ++i) {
        range[i] = m[i];
      }
      range.length = m.length;

      return range;
    }
  }
}

RegexpIterator.prototype.cookedToNodeOffset = function(/*int*/ cooked, /*boolean*/ roundUp) {
  //debug("cooked=" + cooked);
  var raw = this.blob._map.cookedToRaw(cooked);
  //debug("raw=" + raw);
  while ((raw > this.rawEndOfNode || (roundUp && raw == this.rawEndOfNode))
         && this.iNode < this.iLastNode) {
    //debug(rawStartOfNode + "-" + rawEndOfNode);
    this.node = this.blob._nodes[++this.iNode];
    this.rawStartOfNode = this.rawEndOfNode;
    this.rawEndOfNode += this.node.nodeValue.length;
  }
  if (raw > this.rawEndOfNode)
    raw = this.rawEndOfNode;
  return raw - this.rawStartOfNode;
}

/**
 * Make an iterator over the text blobs in the DOM, recording
 * extra information so that regexp matches can be
 * translated to Ranges.
 */
function makeBlobIterator(/*Document|Node*/ root) {
  var iter = new TextBlobIterator(root);

  // override iterator's template methods to record
  // extra info we need in the blob:
  //    _map: a DeleteMap recording where spaces were removed by condenseSpaces()
  //    _nodes: array of all text nodes that contributed to the blob, in order
  
  var superMakeBlob = iter._makeBlob;
  iter._makeBlob = function() {
    var blob = superMakeBlob();
    blob._nodes = [];
    return blob;
  }

  iter._getTextOfNode = function(/*Node*/ node) {
    // only use text nodes for regexp searching
    if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
    else return null;
  }    

  var superAddNodeToBlob = iter._addNodeToBlob;
  iter._addNodeToBlob = function(/*TextBlob*/blob, /*String*/ text, /*Node*/ node) {
    superAddNodeToBlob(blob, text, node);
    blob._nodes.push(node);
  }


  iter._finishBlob = function(/*TextBlob*/blob) {
    blob._map = new DeleteMap();
    blob.value = condenseSpaces(blob._stringBuffer.toString(), blob._map);
    //delete blob._stringBuffer;
  }

  return iter;
}

/*
var iter = new Chickenfoot.RegexpIterator(document, /|/);
var r;
while (r = iter.next()) {
  output(r);
  output(r[1]);
  output(r[2]);
}
*/

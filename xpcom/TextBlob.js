goog.require('goog.string');

/**
 * A TextBlob is a sequence of text nodes that are
 * delimited by block tags (like <p> or <div>)
 * but not by flow tags (like <a> or <b> or <span>)
 * and appearing in the <BODY> element of the page.
 * 
 * Value is the concatenation of the text node values, 
 * but also:
 * - omits leading and trailing whitespace 
 * - compresses runs of whitespace into a single space char
 * - omits text from text nodes inside SCRIPT or STYLE elements
 *
 * Its properties are:
 *  value  (the string value)
 *  firstNode  (the first text node in the sequence)
 *  lastNode   (the last text node in the sequence)
 *
 */
function TextBlob(/*String*/ value, /*Node*/ firstNode, /*optional Node*/ lastNode) {
  this.value = value;
  this.firstNode = firstNode;
  this.lastNode = lastNode ? lastNode : firstNode;  
}

/** @return {Node} least common ancestor of this.firstNode and this.lastNode */
TextBlob.prototype.getContainer = function() {
  if (this.firstNode === this.lastNode) return this.firstNode;
  var firstIndex = getChildIndex(this.firstNode);
  var lastIndex = getChildIndex(this.lastNode);
  var range = this.firstNode.ownerDocument.createRange();
  range.setStart(this.firstNode.parentNode, firstIndex);
  range.setEnd(this.lastNode.parentNode, lastIndex + 1);
  return rangeToContainer(range);
}

TextBlob.prototype.toString = function() {
  return this.value;
}

TextBlob.isFlowTag = {
// elements chosen based on HTML 4.01 spec
// http://www.w3.org/TR/REC-html40/struct/text.html

// Section 9.2.1 Phrase elements
'EM' : 1,
'STRONG' : 1,
'CITE' : 1,
'DFN' : 1,
'CODE' : 1,
'SAMP' : 1,
'KBD' : 1,
'VAR' : 1,
'ABBR' : 1,
'ACRONYM' : 1,

// Section 9.2.3 Subscripts and superscripts
'SUB' : 1,
'SUP' : 1,

// Section 15.2.1 Font style elements
'TT' : 1,
'I' : 1,
'B' : 1,
'BIG' : 1,
'SMALL' : 1,
'STRIKE' : 1,
'S' : 1,
'U' : 1,

// Section 15.2.2 Font modifier elements
'FONT' : 1,
'BASEFONT' : 1,

// Others that I think belong
'SPAN' : 1,
'A' : 1,
// 'BR : 1  // not sure about this one
};


/**
 * TextBlobIterator converts a Document or subtree of a Document into a 
 * stream of TextBlobs.
 *
 * Properties:
 *   root   Node used as root of iteration
 *   blob   last blob returned by next()
 *          (undefined before first call to next(); 
 *           null after next() returns null)
 *
 * Example:
 *   var iter = new TextBlobIterator(document);
 *   while (blob = iter.next()) {
 *      output(blob);
 *   }
 */
function TextBlobIterator(/*Document|Node*/ root) {
  if (root.body) {root = root.body}
  this.root = root;
  this._iterator = createTreeWalker(root, NodeFilter.SHOW_ALL);
  this._iteratorDone = false;
}

/**
 * Get the next blob in the iteration.
 * First call to this method returns the first blob;
 * returns null after the last blob has been yielded.
 */
TextBlobIterator.prototype.next = function() {
  var iterator = this._iterator;
  var blob = null;
  var iteratorDone = this._iteratorDone;
  var blobDone = false;

  while (!iteratorDone && !blobDone) {
    node = iterator.currentNode;
    //debug("looking at " + node);
    
    if (node.nodeType == Node.ELEMENT_NODE
        && !TextBlob.isFlowTag[upperCaseOrNull(node.tagName)]
        && blob) {
      // we're entering a new block element, so close off the blob
      break;
    }

    var text = this._getTextOfNode(node);
    if (text
           // check if text is all whitespace; if it is,
           // we don't start a new blob, but we do add it to an existing blob.
        && (blob || goog.string.trim(text))) {
      if (!blob) blob = this._makeBlob();
      this._addNodeToBlob(blob, text, node);
    }
    
    // advance iterator to next node in preorder
    var next = null;
    
    // visit children only if current node isn't hidden (like SCRIPT or STYLE) 
    if (this._isElementIncluded(node)) {
      next = iterator.firstChild();
    }
    if (!next) {
      next = iterator.nextSibling();
    }
    while (!iteratorDone && !next) {
      iteratorDone = !iterator.parentNode();
      if (!iteratorDone) {
        node = iterator.currentNode;
        if (blob && !TextBlob.isFlowTag[upperCaseOrNull(node.tagName)]) {
          // we're leaving a block element, so close off the blob
          blobDone = true;
        }
        next = iterator.nextSibling();
      }
    }
  }

  this._iteratorDone = iteratorDone;
  if (blob) {
    this._finishBlob(blob);
  }
  return blob;
}

/** returns false if the node parameter should not be included in a text blob iterator,
true otherwise */
TextBlobIterator.prototype._isElementIncluded = function(/*Node*/ node) {
    var hiddenElements = { STYLE:1, SCRIPT:1, NOSCRIPT:1 };
    
    if (node.tagName && hiddenElements[upperCaseOrNull(node.tagName)]) {
        return false;
    }
       
    if (node.nodeType == Node.ELEMENT_NODE) {
        var style = node.ownerDocument.defaultView.getComputedStyle(node, "");
        
        if (style.getPropertyValue("visibility") == "hidden" || style.getPropertyValue("display") == "none") {
            return false;
        }
    }
    
    return true;
}

/**
 * Make a new TextBlob for iterator.  
 * Overridden by subclasses of TextBlobIterator.
 */
TextBlobIterator.prototype._makeBlob = function() {
  var blob = new TextBlob();
  blob._stringBuffer = new StringBuffer();
  return blob;
}

/**
 * Get the visible text out of a node.
 * Overridden by subclasses of TextBlobIterator.
 * @return string of text or null if node type offers no visible text.
 */
TextBlobIterator.prototype._getTextOfNode = function(/*Node*/ node) {
  if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
  
  if (node.nodeType == Node.ELEMENT_NODE) {      
    if (upperCaseOrNull(node.tagName) == 'INPUT'
        && (node.type == 'submit'
            || node.type == 'button'
            || node.type == 'reset'
            || node.type == 'image')
        && node.value) {
      // labels of buttons (BUTTON elements have their labels as text nodes, so that's
      // handled above)
      return node.value;
    }
    
    if (node.tagName == 'description') {
      return node.textContent; }
    
    if (node.tagName == 'label') {
      if (node.getAttribute('value')) {return node.getAttribute('value');}
      else {return node.textContent; }
      }
    
    if (node.tagName == 'textbox'
        || node.tagName == 'xul:textbox'
        || node.tagName == 'listbox') {
      return node.id; }
      
    if (node.tagName == 'button'
       || node.tagName == 'toolbarbutton'
       || node.tagName == 'checkbox'
       || node.tagName == 'radio'
       || node.tagName == 'menulist') {
      return (node.id + " " + node.getAttribute('label') + " " + node.tooltiptext + " " + node.label);}
    
    if ((node.tagName == 'menu')
       || (node.tagName == 'tab')
       || (node.tagName == 'menuitem')
       || (node.tagName == 'listitem')
       || (node.tagName == 'xul:toolbarbutton')
       || (node.tagName == 'caption')) {
      return (node.getAttribute('label') + " " + node.label); }
    
    if ('alt' in node) {
      // ALT attributes for images
      return node.alt; }
    
    
  }
  
  // otherwise
  return null;
}

/**
 * Add a text node to the blob.
 * Overridden by subclasses of TextBlobIterator.
 */
TextBlobIterator.prototype._addNodeToBlob = function(/*TextBlob*/blob, /*String*/ text, /*Node*/ node) {
  if (!blob.firstNode) blob.firstNode = node;
  blob.lastNode = node;
  blob._stringBuffer.append(text);
}

/**
 * Close off the blob.
 * Overridden by subclasses of TextBlobIterator.
 */
TextBlobIterator.prototype._finishBlob = function(/*TextBlob*/blob) {
  blob.value = condenseSpaces(blob._stringBuffer.toString());
  delete blob._stringBuffer; // don't need it anymore, reclaim it
}

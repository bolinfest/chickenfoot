goog.provide('ckft.dom.Box');

/**
 * Box is a simple class that represents a box
 * with its upper-left corner at (x,y)
 * and a width of w and a height of h.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @constructor
 */
ckft.dom.Box = function(x, y, w, h) {
    /** @type {number} */ 
    this.x = x;
    /** @type {number} */ 
    this.y = y;
    /** @type {number} */ 
    this.w = w;
    /** @type {number} */ 
    this.h = h;
    /** @type {number} */ 
    this.width = w;
    /** @type {number} */ 
    this.height = h;  
    /** @type {number} */ 
    this.x1 = x;
    /** @type {number} */ 
    this.y1 = y;
    /** @type {number} */ 
    this.x2 = x + w;
    /** @type {number} */ 
    this.y2 = y + h;
}

/**
 * A dimensionless box at (0,0)
 * @type {ckft.dom.Box}
 */
ckft.dom.Box.ZERO = new ckft.dom.Box(0, 0, 0, 0);

/** 
 * @return {string} human-readable x,y,w,h for Box.
 */
ckft.dom.Box.prototype.toString = function() {
  return '<box x="' + this.x + '" y="' + this.y + 
         '" w="'+ this.w + '" h="' + this.h + '" />';
}

/**
 * Determine whether this box is left, right, above, or below 
 * another box.
 * @param {ckft.dom.Box} b other box
 * @param {number} tolerance 
 * @return {string} "left" if this is left of b
 *          "right" if this is right of b
 *          "above" if this is above b
 *          "below" if this is below b
 *          "intersects" if this intersects b
 *          null if this is unrelated to b
 */
ckft.dom.Box.prototype.relatedTo = function(b, tolerance) {
  if (!tolerance) tolerance = 0;
  
  var overlapsVertically = (this.y1 < b.y2+tolerance) && (b.y1 < this.y2+tolerance);
  var overlapsHorizontally = (this.x1 < b.x2+tolerance) && (b.x1 < this.x2+tolerance);

  if (overlapsVertically && overlapsHorizontally) {
    return "intersects";
  } else if (overlapsVertically /* but not horizontally */) {
    return (this.x1 < b.x1+tolerance) ? "left" : "right";
  } else if (overlapsHorizontally /* but not vertically */) {
    return (this.y1 < b.y1+tolerance) ? "above" : "below";
  } else {
    return null;
  }
}

/**
 * Get bounding box of a DOM node.
 * Reliable results for Element nodes;
 * heuristic guess for Text nodes (since Firefox doesn't provide the bbox
 * directly);  other kinds of nodes return Box.ZERO.
 * @param {Node} node
 * @return {ckft.dom.Box} bounding box of node
 */ 
ckft.dom.Box.forNode = function(node) {
  if (!node) return ckft.dom.Box.ZERO;

  if (node.nodeType == Node.ELEMENT_NODE) {
    return ckft.dom.Box.forElement_(node);
  }
  
  if (node.nodeType == Node.TEXT_NODE) {
    var boxParent = ckft.dom.Box.forNode(node.parentNode);

    // find next and previous sibling Element
    function getSiblingElement(/*Node*/node, /*nextSibling|previousSibling*/ direction) {
      do {
        node = node[direction];
      } while (node != null && node.nodeType != Chickenfoot.Node.ELEMENT_NODE);
      return node;
    }
    var prev = getSiblingElement(node, "previousSibling");
    var next = getSiblingElement(node, "nextSibling");

    var boxPrev = prev ? ckft.dom.Box.forNode(prev) : null;
    var boxNext = next ? ckft.dom.Box.forNode(next) : null;
    //debug(boxParent + ": " + boxPrev+ "->" + boxNext);

    // it's more convenient to compute the
    // two corners of the bounding box, (x1,y1) and (x2, y2).
    // By default, assume our parent's bounding box, and
    // and make further adjustments below.
    var x1 = boxParent.x1;
    var y1 = boxParent.y1;
    var x2 = boxParent.x2;
    var y2 = boxParent.y2;

    if (prev && next) {
      // if prev and next overlap vertically,
      // and prev precedes next horizontally,
      // then assume node is sandwiched between them
      // horizontally.
      if (boxNext.y < boxPrev.y + boxPrev.height
          && boxNext.x > boxPrev.x) {
        x1 = boxPrev.x2;
        y1 = boxPrev.y1;
        x2 = boxNext.x1;
        y2 = boxNext.y2;
      } else {
        // assume node starts on same line as prev,
	// and ends on same line as next
        x1 = boxPrev.x2;
        y1 = boxPrev.y1;
        x2 = boxNext.x1;
        y2 = boxNext.y2;
        
      }
    } else if (next /* && !prev */) {
      y2 = boxNext.y2;
    } else if (prev /* && !next*/) {
      y1 = boxPrev.y1;
    }

    if (boxPrev) {
      // If boxPrev is flush with right of parent (modulo 5 pixels), node lies entirely below it.
      if (boxPrev.x2 >= boxParent.x2 - 5) y1 = boxPrev.y2;
      // If boxPrev is flush with bottom of parent (modulo 5 pixels), node lies entirely right of it.
      if (boxPrev.y2 >= boxParent.y2 - 5) x1 = boxPrev.x2;
    }

    if (boxNext) {
      // If boxNext is flush with left of parent (modulo 5 pixels), node lies entirely above it.
      if (boxNext.x1 <= boxParent.x1 + 5) y2 = boxNext.y1;
  
      // If boxNext is flush with top of parent (modulo 5 pixels), node lies entirely left of it.
      if (boxNext.y1 <= boxParent.y1 + 5) x2 = boxNext.x1;
    }

    box = new ckft.dom.Box(x1, y1, x2-x1, y2-y1);
  
    // error below occurs when Text node is a direct
    // descendant of BODY, so something needs to
    // be done to fix this in general
    
    //try {
    //  var p = box.x;
    //} catch (e) {
    //  debug('did not find box for ' + node);
    //  debug('parent was: ' + node.parentNode);
    //}
  
    return box;
  
  }
  
  // otherwise, we don't know how to find bbox for 
  // this type of node
  return ckft.dom.Box.ZERO;
}

/**
 * Get bounding box of a DOM element.  Used internally by
 * Box.forNode().
 * @private
 * @param {Element} node
 * @return {ckft.dom.Box} bounding box of node
 */ 
ckft.dom.Box.forElement_ = function(elt) {
    // dynamically choose the right implementation
    // on first call
    if (elt.ownerDocument.getBoxObjectFor) {      
      // FF 3.0-3.5
      ckft.dom.Box.forElement_ = function(/*Element*/ elt) {
        var b = elt.ownerDocument.getBoxObjectFor(elt);
        return new ckft.dom.Box(b.x, b.y, b.width, b.height);
      }
    } else {
      // FF 3.6+
      ckft.dom.Box.forElement_ = function(/*Element*/ elt) {
          var b = elt.getBoundingClientRect();    
          var win = elt.ownerDocument.defaultView;
          return new ckft.dom.Box(Math.round(b.left + win.pageXOffset),
			                      Math.round(b.top + win.pageYOffset),
			                      Math.round(b.width),
			                      Math.round(b.height));
      }
    }
    
    // call the implementation we just chose
    return ckft.dom.Box.forElement_(elt);
}
 
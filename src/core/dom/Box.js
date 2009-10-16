/**
 * Box is a simple class that represents a box
 * with its upper-left corner at (x,y)
 * and a width of w and a height of h.
 *
 * It also has accessors for its corners:
 *  (x1,y1) is upper-left corner
 *  (x2,y2) is lower-right corner
 */
function Box(x, y, w, h) {
  this.x = this.x1 = x;
  this.y = this.y1 = y;
  this.w = this.width = w;
  this.h = this.height = h;  
  this.x2 = x + w;
  this.y2 = y + h;
}

/**
 * A dimensionless box at (0,0) 
 */
Box.ZERO = new Box(0, 0, 0, 0);

/** toString() displays x,y,w,h data for Box */
Box.prototype.toString = function() {
  return '<box x="' + this.x + '" y="' + this.y + 
         '" w="'+ this.w + '" h="' + this.h + '" />';
}

/**
 * Determine whether this box is left, right, above, or below 
 * another box.
 * @param b other box
 * @param tolerance 
 * @returns "left" if this is left of b
 *          "right" if this is right of b
 *          "above" if this is above b
 *          "below" if this is below b
 *          "intersects" if this intersects b
 *          null if this is unrelated to b
 */
Box.prototype.relatedTo = function(/*Box*/ b, /*int*/ tolerance) {
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
 */ 
Box.forNode = function(/*Node*/ node) {
  if (!node) return Box.ZERO;

  if (node.nodeType == Node.ELEMENT_NODE) {
    var b = node.ownerDocument.getBoxObjectFor(node);
    return new Box(b.x, b.y, b.width, b.height);
  }
  
  if (node.nodeType == Node.TEXT_NODE) {
    var boxParent = Box.forNode(node.parentNode);

    // find next and previous sibling Element
    function getSiblingElement(/*Node*/node, /*nextSibling|previousSibling*/ direction) {
      do {
        node = node[direction];
      } while (node != null && node.nodeType != Chickenfoot.Node.ELEMENT_NODE);
      return node;
    }
    var prev = getSiblingElement(node, "previousSibling");
    var next = getSiblingElement(node, "nextSibling");

    var boxPrev = prev ? Box.forNode(prev) : null;
    var boxNext = next ? Box.forNode(next) : null;
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
        y1 = boxPrev.y1;
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

    box = new Box(x1, y1, x2-x1, y2-y1);
  
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
  return Box.ZERO;
}

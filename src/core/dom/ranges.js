/** Utilities for Range objects.
 */

/** Create a Range that spans a Node.
 */
function nodeToRange(/*Node*/ node) {
    var doc = node.ownerDocument;
    //will throw an error if node is anonymous content AND
    //the node's parent doesn't know about its existence.
    //some anonymous nodes' parents do know about their
    //child's existence, but not all, and this is impossible
    //to determine just by looking at the page
    try {
      var index = getChildIndex(node);
      var range = doc.createRange();
      range.setStart(node.parentNode, index);
      range.setEnd(node.parentNode, index + 1);}
      //so catch the error and return the range for the nearest
      //binding up the DOM tree, for which a range can be defined
      //do this recursively until a valid range is defined
      catch(err) {nodeToRange(doc.getBindingParent(node));}
    return range;
}

/** Get the index of a node in its parent.
 *  Returns i such that node.parentNode.childNodes[i] == node.
 */
function getChildIndex(/*Node*/node) {
  var children = node.parentNode.childNodes;
  var index = -1;
  for (var i = 0; i < children.length; i++) {
    if (children.item(i) == node) {
      index = i;
      break;
    }
  }
  if (index < 0) throw new Error("node not found in parent");
  return index;
}


/**
 * Test whether a Range contains (all of) a Node.
 * (If you just want to test for intersection with
 * any part of the node, use range.intersectsNode(node)).
 */
function isNodeInRange(/*Node*/ node, /*Range*/ range) {
  var parent = node.parentNode;
  var offset = getChildIndex(node);
  return range.isPointInRange(parent, offset) && range.isPointInRange(parent, offset+1);
}


/**
 * Get the single element represented by a range, which could be either an
 * inner element (the range completely covers the element) or an outer
 * element (the range completely covers all the element's children).
 * If both inner and outer elements are found, the inner element is returned.
 * @param range Range
 * @returns If range = [<elem>...</elem>], returns elem;
 *          otherwise if range = <elem>[...]</elem>, returns elem;
 *          otherwise returns null.
 *
 *  Examples (where [ ] delimits the range):
 *       <A>[<B>x</B><C></C>]</A>  => A element
 *       <A>[<B>x</B>]<C></C></A>  => B element
 *       <A><B>[x]</B><C></C></A>  => B element
 *       <A><B>[x</B><C>]</C></A>  => null
 *       <A><B>[x</B>]<C></C></A>  => null
 */
function rangeToElement(/*Node*/range) {
  if (!range) return null;
  
  var startContainer = range.startContainer;
  var startOffset = range.startOffset;
  if (startContainer.nodeType == Node.TEXT_NODE) {
    // move startpoint from <A>[text...  to [<A>text...
    if (startOffset > 0) return null; // no outer element, there's text in the way
    startOffset = getChildIndex(startContainer);
    startContainer = startContainer.parentNode;
  }
  
  var endContainer = range.endContainer;
  var endOffset = range.endOffset;
  if (endContainer.nodeType == Node.TEXT_NODE) {
    // move endpoint from text...]</A>  to text...</A>]
    if (endOffset < endContainer.nodeValue.length) return null; // no outer element, there's text in the way
    endOffset = getChildIndex(endContainer) + 1;
    endContainer = endContainer.parentNode;
  }

  if (startContainer !== endContainer) return null;
  
  // inner element case: [<a>...</a>]
  if (endOffset - startOffset == 1) {
    var node = startContainer.childNodes[startOffset];
    if (node.nodeType == Node.ELEMENT_NODE)
      return node;
  }
  
  // outer element case: <a>[...]</a>
  if (startOffset == 0 && endOffset == startContainer.childNodes.length) {
    return startContainer;
  }

  // otherwise, no such element
  return null;
}

/**
 * Get the smallest single node that contains the given range.
 * Doesn't have to be an element.
 */
function rangeToContainer(/*Node*/range) {
  // first try rangeToElement, since it's usually smaller
  // than commonAncestorContainer
  var element = rangeToElement(range);
  if (element) return element;
  else return range.commonAncestorContainer;
}

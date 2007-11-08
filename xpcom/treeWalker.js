
/**
 * createTreeWalker()
 *    Creates a TreeWalker that filters a subtree of the DOM.
 *
 * createTreeWalker(root, whatToShow, [acceptNode], [expandEntityReferences])
 *
 * Parameters:
 *   root
 *     DOM node, root of subtree to be walked
 *
 *   whatToShow 
 *     node types that should be returned by the TreeWalker, OR'ed together:
 *       NodeFilter.SHOW_ELEMENT
 *       NodeFilter.SHOW_TEXT
 *       NodeFilter.SHOW_ATTRIBUTE
 *       NodeFilter.SHOW_COMMENT
 *       NodeFilter.SHOW_ALL (for all DOM nodes)
 *
 *   acceptNode     
 *     optional user-defined filter function of type 
 *     DOMNode -> oneof(NodeFilter.FILTER_ACCEPT, NodeFilter.FILTER_SKIP, NodeFilter.FILTER_REJECT)
 *     Nodes that pass the whatToShow filter are passed to this acceptNode function.
 *     acceptNode may return one of three values:
 *       FILTER_ACCEPT to make the TreeWalker return the node
 *       FILTER_SKIP to make TreeWalker skip the node, but still consider its children
 *       FILTER_REJECT to make TreeWalker skip the node AND all its descendents
 *  expandEntityReferences
 *    optional boolean flag, not used in HTML
 *
 */

/**********************************************
 * Examples of createTreeWalker
 *
    // get all text nodes inside first link in document 
    var walker = createTreeWalker(document.links[0], NodeFilter.SHOW_TEXT);
 
    // find all images in document
    var walker = createTreeWalker
        (document,
         NodeFilter.SHOW_ELEMENT, 
         function(node) { 
           return (node.tagName=="img") 
             ? NodeFilter.FILTER_ACCEPT
             : NodeFilter.FILTER_SKIP;
         });
         
 
 ************************************************
 * Patterns for iterating over the resulting TreeWalker:
 *
   // Process nodes in filtered subtree 
   // (EXCLUDING the subtree root):
   while ((node = walker.nextNode()) != null) {
     ... use node here
   }

   // Same as above, but avoids a temp variable:
   while (walker.nextNode()) {
     ... use walker.currentNode here
   }
   
   // Process the root of the subtree 
   // as well as its descendents:
   // (This includes the root node even if it does not satisfy the filter.)
   do {
     ... use walker.currentNode here
   } while (walker.nextNode());
      
   // Process the filtered tree recursively:
   function recursive_algorithm(walker) {
     ... use walker.currentNode here if you want to
         process the root of the subtree + descendents
     
     if (walker.firstChild()) {
       do {
         ... use walker.currentNode here to skip the root
              and handle only the filtered descendents
         recursive_algorithm(walker);
       } while (tw.nextSibling());
       tw.parentNode();
     }
  }

* See http://www.mozilla.org/docs/dom/samples/treewalkerdemo.xml
* for more examples of using TreeWalker recursively
*********************************************/


// createTreeWalker works around a bug in Firefox.
//
//   When the whatToShow filter fails to match any of the descendents of the root,
//   Firefox's TreeWalker returns nodes *after* the root (outside the
//   root's subtree), instead of simply returning no nodes at all.
//   
//   We work around this bug by wrapping the TreeWalker with a wrapper that checks
//   the first valid node returned (by any of TreeWalker's methods) to make sure it's
//   in the root's subtree.  If it is, then we don't have to check any of the other
//   nodes returned by the TreeWalker, so we pay for this check only on the first node.
//   If it isn't, then we return null (no nodes).
//
function createTreeWalker(node, whatToShow, acceptNode, expandEntityReferences) {
  // acceptNode and expandEntityReferences are optional
  if (acceptNode === undefined) {
    acceptNode = null;
  }
  if (expandEntityReferences === undefined) {
    expandEntityReferences = false;
  }
  
  if (instanceOf(node, Document)) {
    node = node.documentElement;
  }
  var doc = node.ownerDocument;
  var walker = doc.createTreeWalker(node, whatToShow, acceptNode, expandEntityReferences);
  var wrapper = new TreeWalkerWrapper(walker);
  return wrapper;
}

function TreeWalkerWrapper(walker) {
  this.walker = walker;
  this.root = walker.root;
  this.whatToShow = walker.whatToShow;
  this.acceptNode = walker.acceptNode;
  this.expandEntityReferences = walker.expandEntityReferences;
  this.currentNode = walker.currentNode;
  this.alreadyChecked = false;
}

TreeWalkerWrapper.prototype.check = function(node) {
  if (!node) {
    //debug("check: node is null");
    return node;
  } else if (this.alreadyChecked) {
    //debug("check: already safe");
    return (this.currentNode = node);
  } else if (!this.isAncestorOf(this.root, node)) {
    //debug("check: caught bug, returning null");
    return null;
  } else {
    //debug("check: checked ancestry, safe");
    this.alreadyChecked = true;
    return (this.currentNode = node);
  }
}

TreeWalkerWrapper.prototype.isAncestorOf = function(ancestor, node) {
  while (node) {
    if (node === ancestor) {
      return true;
    } else {
      node = node.parentNode;
    }
  }
  return false;
}

TreeWalkerWrapper.prototype.firstChild = function() {
  return this.check(this.walker.firstChild());
}
TreeWalkerWrapper.prototype.lastChild = function() {
  return this.check(this.walker.lastChild());
}
TreeWalkerWrapper.prototype.nextNode = function() {
  return this.check(this.walker.nextNode());
}
TreeWalkerWrapper.prototype.nextSibling = function() {
  return this.check(this.walker.nextSibling());
}
TreeWalkerWrapper.prototype.parentNode = function() {
  return this.check(this.walker.parentNode());
}
TreeWalkerWrapper.prototype.previousNode = function() {
  return this.check(this.walker.previousNode());
}
TreeWalkerWrapper.prototype.previousSibling = function() {
  return this.check(this.walker.previousSibling());
}

//
// Tests.
//

/*
// Run this test on a page whose first link is simple text.
var link = document.links[0];
var walker = createTreeWalker(link, NodeFilter.SHOW_ELEMENT);
var node = walker.nextNode();
if (node != null && node.parentNode !== link) {
  alert("Test failed: TreeWalker returned an element outside the root's subtree");
}
*/

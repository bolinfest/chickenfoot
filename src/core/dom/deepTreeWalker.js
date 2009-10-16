/**
 * createDeepTreeWalker()
 *    Creates a deepTreeWalker that filters a subtree of a XUL DOM tree.
 *
 * createDeepTreeWalker(root, whatToShow, [acceptNode])
 *
 * Parameters:
 * - root
 *     XUL DOM node, root of subtree to be walked
 * - whatToShow 
 *     node types that should be returned by the TreeWalker, OR'ed together:
 *       NodeFilter.SHOW_ELEMENT
 *       NodeFilter.SHOW_TEXT
 *       NodeFilter.SHOW_ATTRIBUTE
 *       NodeFilter.SHOW_COMMENT
 *       NodeFilter.SHOW_ALL (for all DOM nodes)
 * - [predicate]
 *     optional user-defined filter function of type 
 *     DOMNode -> oneof(NodeFilter.FILTER_ACCEPT, NodeFilter.FILTER_SKIP)
 *     Nodes that pass the whatToShow filter are passed to this predicate function.
 *     predicate may return one of two values:
 *       true to make the TreeWalker return the node
 *       false to make TreeWalker skip the node, but still consider its children
 * - [searchAllXULDocs]
 *     optional boolean value that tells whether to search all XUL documents or not
 *     useful for searching chromeWindow, and want to include other chromeWindows in search,
 *       such as chickenfoot script editor chromeWindow
 */

function createDeepTreeWalker(node, whatToShow, predicate, searchAllXULDocs) {  
  // predicate is optional
  if ((predicate === undefined) || !predicate) {
    predicate = function () {return true};
  }
  
  if (searchAllXULDocs && (searchAllXULDocs == true)) {var docs = getAllXULDocuments(node, []);}
  else {var docs = null;}
  
  var deepTreeWalker = Components.classes["@mozilla.org/inspector/deep-tree-walker;1"]
                    .createInstance(Components.interfaces.inIDeepTreeWalker);
  deepTreeWalker.showAnonymousContent = true;
  deepTreeWalker.init(node, whatToShow);
  
  //impossible to pass a filter to deepTreeWalker, so this wrapper
  //does the filtering itself, and returns the nextNode() that passes
  //the filter, not just the nextNode() in the XUL DOM tree
  var wrapper = new deepTreeWalkerWrapper(deepTreeWalker, predicate, docs);
  return wrapper;
}

function deepTreeWalkerWrapper(walker, predicate, docs) {
  this.predicate = predicate;
  this.walker = walker;
  this.root = walker.root;
  this.whatToShow = walker.whatToShow;
  this.currentNode = walker.currentNode;
  this.XULDocs = docs;
  this.XULDocCounter = 0;
}

deepTreeWalkerWrapper.prototype.nextNode = function() {
  var next = this.walker.nextNode();
  
  while (next && (!this.predicate(next)) && (!this.predicate(next.wrappedJSObject))) {
    next = this.walker.nextNode()
  }
  
  if (!next && this.XULDocs && this.XULDocs[this.XULDocCounter]) {
    this.walker = createDeepTreeWalker(this.XULDocs[this.XULDocCounter], this.whatToShow, this.predicate, false);
    this.XULDocCounter += 1;
    next = this.walker.nextNode();
  }

  return next;
}

deepTreeWalkerWrapper.prototype.parentNode = function() {
  return this.currentNode.parentNode();
}

function getAllXULDocuments (/*XUL Document or Element*/ root, /*Array*/ docs) {
  var predicate = 
    function (node) {
      return (node && ((node.nodeName == 'xul:browser') 
                       || (node.nodeName == 'browser') 
                       || (node.tagName == 'iframe'))); }
  var treewalker = createDeepTreeWalker(root, NodeFilter.SHOW_ELEMENT, predicate);
  var current = treewalker.nextNode();
  while(current) {
    try {
    if (instanceOf(current.contentDocument, XULDocument)) {
      if (current.contentDocument.wrappedJSObject) {docs.push(current.contentDocument.wrappedJSObject);}
      else {docs.push(current.contentDocument);}
      getAllXULDocuments(current.contentDocument, docs);
    }
    if (instanceOf(current.document, XULDocument)) {
      if (current.document.wrappedJSObject) {docs.push(current.document.wrappedJSObject);}
      else {docs.push(current.document);}
      getAllXULDocuments(current.document, docs);
    }
    }
    catch(err) {}
    current = treewalker.nextNode();
  }
  return docs;
}
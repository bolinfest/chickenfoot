goog.require('goog.dom');
goog.require('goog.style');

// Functions for fields (textboxes, buttons, checkboxes, radiobuttons, lists, etc.)
//
// Added conditions to extend existing fields to xul, and added menu and menuitem fields.

/**
 * Takes a node that is an input field
 * Returns a string with the text or null
 */
function extractTextFromField(/*Node*/node) {
  if (!node) return null;
  if (upperCaseOrNull(node.tagName) == 'BUTTON') {
    return node.textContent;
  } else if (isClickable(node) && 'value' in node) {
    return node.value;
  } else if (upperCaseOrNull(node.tagName) == 'SELECT') {
    var sb = new StringBuffer();
    var options = node.options;
    for (var i = 0; i < options.length; ++i) {
      sb.append(options[i].text + " ");
    }
    return sb.toString();
  }
  return null;
}

/**
 * Iterate through elements in a DOM that match a predicate.
 * (Simplified interface for constructing a TreeWalker.)
 * @param root Document to iterate; or Node to iterate a subtree
 * @param predicate  function:node->boolean selects which nodes to return.
 *    Good choices are isClickable, isTextbox, isCheckbox, isRadiobutton, isVisible, etc.
 * @return a TreeWalker; see treeWalker.js for examples of how to iterate it.
 */
function findElements(/*Document|Node*/ root, /*optional function*/ predicate) {
  if (instanceOf(root, Document)) {
    root = Pattern.getFindRoot(root);
  }
  var filter = 
    predicate ? function(node) { return predicate(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; }
              : null;
  if ((instanceOf(root, XULElement)) || (instanceOf(root, XULDocument))) {
  //use a deepTreeWalker if a XUL Element or Document
    return createDeepTreeWalker(root, NodeFilter.SHOW_ELEMENT, predicate, true);
    }
    //use a normal treeWalker if an HTML document
  else {return createTreeWalker(root, NodeFilter.SHOW_ELEMENT, filter);}
 }

/** @return true if the node is visible on the page */
function isVisible(/*Node*/ node) {
  if (isMenuItem(node)) {return isVisible(node.parentNode);}
  if (node.tagName == 'menupopup') {
    if (node.parentNode.open == true) {return true;}
    else if (node.parentNode.wrappedJSObject && node.parentNode.wrappedJSObject.open == true) {
      return true;}
    else {return false;}}

  if (node.nodeType == Node.TEXT_NODE) node = node.parentNode; 
  if (upperCaseOrNull(node.tagName) in isVisible.INVISIBLE_TAGS) return false;
  
  var doc = node.ownerDocument
  if (doc.wrappedJSObject) {doc = doc.wrappedJSObject;}
  if (doc.firstChild.tagName && doc.firstChild.tagName == 'prefwindow') {
    return ((node.getAttribute("pane")) ||
        goog.dom.contains(doc.firstChild.currentPane, node));
  }

  // this isn't reliable -- e.g., the links to result pages (and even the Next link) on Google search
  // results have 0-width and 0-height box.
  var box = Box.forNode(node);
  if (!box.width && !box.height && !box.x && !box.y) return false;
  
  //this is only reliable in xul, so far
  if ((instanceOf(node.ownerDocument, XULElement))
      && node.boxObject
      && node.boxObject.height == 0
      && node.boxObject.width == 0) {return false;}
  
  // this is unfortunately slow
  return goog.style.getComputedStyle(node, 'visibility') == 'visible';
}


// DEPRECATED: on FF 3.6, inVisibleFrame() generates security exceptions for
// frames that are from a different domain than their parent.  The errors seem
// to be caused by moving upward, from node (in domain A) to frame to frameElement (from domain B), 
// and then asking for the width of frameElement.  But it seems to be OK to traverse downward,
// so instead we do the visibility check in getAllVisibleFrameDocuments(). 
//
// /** @return true if the node is in a frame that is visible */
// function inVisibleFrame(/*Node|Document*/ node) {
//  var nodeFrame = (node.ownerDocument ? node.ownerDocument : node).defaultView;
//
//  nodeFrame = nodeFrame.wrappedJSObject || nodeFrame;
//  // if no frameElement, then not in an IFRAME
//  var frameElement;
//  if (!(frameElement = nodeFrame.frameElement)) return true;
//  frameElement = frameElement.wrappedJSObject || frameElement;
//  // frameElement is a FRAME or an IFRAME
//  // oftentimes, an IFRAME is enclosed by a DIV
//  // (I can't remember why -- it may have to do with how IE6 handles them)
//  // So we test that both the IFRAME and its parent have a nonzero Box
//  return Box.forNode(frameElement).width;
//}

isVisible.INVISIBLE_TAGS = {
  HEAD : 1,
  SCRIPT : 1,
  STYLE : 1,
  NOSCRIPT : 1,
};

/** @return true iff node is a clickable button */
function isClickable(/*Node*/ node) {
  return instanceOf(node, Node)
    && node.nodeType == Node.ELEMENT_NODE 
    && (upperCaseOrNull(node.tagName) == 'BUTTON'
        || (node.tagName == 'button')
        || (node.tagName == 'toolbarbutton')
        || (node.tagName == 'xul:toolbarbutton')
        || (node.tagName == 'xul:button')
        || (upperCaseOrNull(node.tagName) == 'INPUT'
            && 'type' in node
            && (node.type == 'submit'
                || node.type == 'button'
                || node.type == 'reset'
                || node.type == 'image')));
}


/** @return true iff node is a hyperlink  */
function isLink(/*Node*/ node) {
  return instanceOf(node, Node)
    && node.nodeType == Node.ELEMENT_NODE 
    && ((upperCaseOrNull(node.tagName) == 'A'
          && (node.hasAttribute('href') || node.hasAttribute('onclick')))
        || node.className == 'text-link');
}

/**
 * A text input is a <TEXTAREA>
 * or <INPUT type="text|password">
 *
 * @return true if the node is a text input
 */
function isTextbox(/*Node*/ node) {
  if (!instanceOf(node, Node)) return false;
  if (node.tagName == 'textbox') return true;
  if (upperCaseOrNull(node.tagName) == 'TEXTAREA') return true;
  if (node.tagName == 'xul:textbox') return true;
  if (node.className == 'text-input') return true;
  if ('type' in node && upperCaseOrNull(node.tagName) == 'INPUT') {
    var type = node.type;
    if (type == 'text'
        || type == 'password'
        || type == 'file') {
      return true;
    }
  }
  return false;
}


/**
 * A listbox is a
 * <SELECT> element.
 *
 * @return true if the node is a pickable input
 */
function isListbox(/*<Node>*/ node) {
  if (!instanceOf(node, Node)) return false;
  return ((upperCaseOrNull(node.tagName) == 'SELECT') 
         || (node.tagName == 'menulist')
         || (node.tagName == 'listbox'));
}

function isCheckbox(node) {
  if (!instanceOf(node, Node)) return false;
  return ((upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'checkbox') || (node.tagName == 'checkbox'));
}

function isRadioButton(node) {
  if (!instanceOf(node, Node)) return false;
  return ((upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'radio') || (node.tagName == 'radio'));
}

function isListitem(/*Node*/ node) {
    if (!instanceOf(node, Node)) return false;
    return ((upperCaseOrNull(node.tagName) == 'OPTION')
           || (upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'option')
           || (node.tagName == 'menuitem')
           || (node.tagName == 'listitem'));
}

function isMenu(/*Node*/ node) {
    if (!instanceOf(node, Node)) return false;
    return (node.tagName == 'menu');
}

function isMenuItem(/*Node*/ node) {
    if (!instanceOf(node, Node)) return false;
    return (node.tagName == 'menuitem')
}

function isTab(/*Node*/ node) {
    if (!instanceOf(node, Node)) return false;
    return (node.tagName == 'tab' || node.tagName == 'xul:tab' || node.tagName == 'panelTab');
}

/**
 * Returns true iff node is an image element of reasonable size.
 */
function isSignificantImage(node) {
  if (!instanceOf(node, Node)) return false;
  return upperCaseOrNull(node.tagName) == 'IMG'
         && node.width > 1 && node.height > 1;
}

/**
 * If there are multiple forms in a page, then it
 * is possible for there to be multiple <input> elements
 * with the same name, so an array of Node objects
 * is returned rather than a single (possibly null) Node.
 *
 * The user may optionally pass the name of the <form>
 * to specify which <form> to look in for the <input>.
 *
 * @return Node[] (possibly empty)
 */
function getFormElements(/*<String>*/eleName, /*<String>*/ formName) {
  if (!eleName) return [];
  var forms;
  if (formName) {
    forms = [ this.doc.forms[formName] ];
  } else {
    forms = this.doc.forms;
  }
  nodes = [];
  for (var i = 0; i < forms.length; i++) {  
    for (var j = 0; j < forms[i].elements.length; j++) {
      if (getInputName(forms[i].elements[j]) == eleName) nodes.push(forms[i].elements[j]);
    }
  }
  return nodes;
}

function getInputName(/*Node*/ node) {
  if (!node) {
    return null;
  } else if (node.type == 'radio') {
    return node.value;
  } else {
    return node.name;
  }
}

/**
 * Get all documents in a DOM, including its frames, 
 * but only frames that are visible (nonzero width).
 *
 * @param doc Document to iterate
 * @return Document[] = [doc, f1,f2,...,fn] where doc is the parameter
 *     and fi are the documents of all FRAME and IFRAME elements in doc
 *     and any other fi.
 */
function getAllVisibleFrameDocuments(/*Document*/ doc) {
  var docs = [];
  traverseDoc(doc);
  return docs;
  
  function traverseDoc(/*Document*/ doc) {
    if (!doc) return;
    docs.push(doc);
    traverseFrames(doc.getElementsByTagName("frame"));
    traverseFrames(doc.getElementsByTagName("iframe"));
  }
  function traverseFrames(/*FrameNode[]*/ frames) {
    for (var i = 0; i < frames.length; ++i) {
      
      traverseDoc(frames[i].contentDocument);
    }
  }
}

goog.require('goog.string');
goog.require('goog.style');
goog.require('ckft.dom.Box');
goog.require('ckft.util.strings');

// don't attempt labelling if node count exceeds this
const RECORDER_NODE_THRESHOLD = 2200; 

/**
 * Returns the total number of nodes in the document, including nodes in other
 * frames in the document.
 * @param doc Document
 * @return int total number of nodes
 */
function getDocumentNodeCount(/*Document*/ doc) {
  var allDocuments = getAllVisibleFrameDocuments(doc);
  var nodeCount = 0;
  for (var i = 0; i < allDocuments.length; i++) {
    nodeCount += allDocuments[i].evaluate(
      'count(//node())', allDocuments[i], null, XPathResult.ANY_TYPE, null)
      .numberValue;
  }
  return nodeCount;
}


/**
 * Takes an event that occurs on an HTML node, and generates an object describing the event.
 * Throws an exception if the event is unknown.
 */
function generateCommandDetails(/*Element*/ e, /*String*/ eventType) {
  var action = null;
  var label = null;
	var value = null;
	var xpath = null;
  var targetType = null;
	var location = null;
	var ordinal = null;
  
  if (eventType == "click") {
    e = getClickableTarget(e);
    action = Command.CLICK_COMMAND;
    if (ElementTypes.getType(e) == ElementTypes.OTHER) {
      e = getContainedTextOrImage(e);
    }
  } else if (eventType == "change") {
    if (!ElementTypes.isTextbox(e) && !ElementTypes.isRadioButton(e) 
        && !ElementTypes.isCheckbox(e) && !ElementTypes.isListbox(e)) {
		  while (e.nodeName != "BODY") {
		    var forNodeId = e.getAttribute ? e.getAttribute("for") : null;
		    if (forNodeId) {
		      e = e.ownerDocument.getElementById(forNodeId);
		      break;
		    }
		      e = e.parentNode;
		    }
		}
    if (ElementTypes.isTextbox(e)) {
        action = Command.ENTER_COMMAND;
        value = e.value;
		} else if (ElementTypes.isRadioButton(e)) {
		    action = Command.CHECK_COMMAND;
		    value = "true";
		} else if (ElementTypes.isCheckbox(e)) {
		    action = Command.CHECK_COMMAND;
		    value = e.checked + "";
		} else if (ElementTypes.isListbox(e)) {
		    action = Command.CHOOSE_COMMAND;
		    value = e.options[e.selectedIndex].textContent;
		}	
  } else if (eventType == "load") {
      var doc = e.ownerDocument
      if (!doc) throw new Error("not an HTML document load")
      var url = getVisibleHtmlWindow(doc.defaultView).location.toString();
      action = Command.GO_COMMAND;
      value = url;
  } else if (eventType == "keypress") {
      action = Command.KEYPRESS_COMMAND;
  } else {
      throw new Error("unknown command type: " + eventType);
  }
    
  if (eventType != "load") {
    targetType = ElementTypes.getType(e);
    xpath = generateXPath(e).xpathExpression;
        
    // get number of nodes in DOM
    var nodeCount = getDocumentNodeCount(e.ownerDocument);
    
    // skip recorderFind and labelling if DOM has too many nodes
    if (nodeCount <= RECORDER_NODE_THRESHOLD) {
      label = getLabelForElement(e);
      var nodes = 
        recorderFind(e.ownerDocument, label, targetType, null, true, false);
      if (nodes.length > 1) {
        for (var i=0; i<nodes.length; i++) {
          if (nodes[i].element == e) {
            ordinal = i+1;
            break;
          }
        }
      }
    }       
  } 
  return {action: action, label : label, value : value, targetXPath: xpath, 
          targetType : targetType, ordinal : ordinal};
}

/* takes a DOM Element node and an event type, and returns a keyword command
string that would correspond to an eventType event on node */
function generateKeywordCommand(/*Element*/ e, /*String*/ eventType) {
    var details = generateCommandDetails(e, eventType);
    return generateKeywordCommandFromDetails(details);
}

/* takes a DOM Element node and an event type, and returns a chickenfoot command
string that would correspond to an eventType event on node (if checkCorrectness is true then
it also checks that the generated command will match the correct node in e's document... if it
doesn't, the chickenfoot command will use e's xpath */
function generateChickenfootCommand(/*Element*/ e, /*String*/ eventType, /*Boolean*/ checkCorrectness) {
    if (checkCorrectness == undefined) checkCorrectness = true;
    
    var details = generateCommandDetails(e, eventType);
    var c = generateChickenfootCommandFromDetails(details);

    if (checkCorrectness) {
        var label = getLabel(details);
        var m = Pattern.find(e.ownerDocument, label);

        if (m.count == 1) {
          // one of the ancestors or siblings is the right node
          // hack-ish because e and m.element don't match because of text labels
          // assuming good labelling
          var currentNode = e;
          
          // check siblings
          var siblings = currentNode.parentNode.childNodes;
          for (var i = 0; i < siblings.length; i++) {
            if (siblings[i] == e) {
              return c;
            }
          }
          
          // check ancestors
          while (currentNode) {
            if (currentNode == m.element) {
              return c;
            } else {
              currentNode = currentNode.parentNode;
            }
          }
        }
        details.label = "";
        return generateChickenfootCommandFromDetails(details);
    }
    
    return c;
    
    function getLabel(/*CommandDetails*/ details) {
        var label = "";
        
        if (details.label == "") {
	        label = "new XPath(" + toQuotedJavascriptString(details.targetXPath) + ")";
    	  } else {
    	    label = details.label;
    	    
    	    if (details.ordinal) label = getOrdinalText(details.ordinal) + " " + label;

          if (details.action == Command.CLICK_COMMAND && details.targetType == ElementTypes.BUTTON) label += " button";
            else if (details.action == Command.CLICK_COMMAND && details.targetType == ElementTypes.LINK) label += " link";
            else if (details.action == Command.ENTER_COMMAND) label += " textbox";
        	else if(details.targetType == ElementTypes.RADIO_BUTTON) label += " radiobutton";
        	else if(details.targetType == ElementTypes.CHECK_BOX) label += " checkbox";
        	else if (details.action == Command.CHOOSE_COMMAND) label += " listbox";
    	}
    	
    	return label;
    }
}

function generateChickenfootCommandFromDetails(/*CommandDetails*/ details) {
  var command = null;
	var label;
	
	if (details.label == "") {
	    label = "new XPath(" + toQuotedJavascriptString(details.targetXPath) + ")";
	}
	else {
	    label = details.label;
        if (!label) label = "";
	    if (details.ordinal) label = getOrdinalText(details.ordinal) + " " + label;
	    if (details.action == Command.CLICK_COMMAND && details.targetType == ElementTypes.BUTTON) label += " button";
	    if (details.action == Command.CHOOSE_COMMAND) label += " listbox";
	    label = toQuotedJavascriptString(label);
	}
	
	if (details.action == Command.CLICK_COMMAND) {
        command = "click(" + label + ")";
    }
    else if (details.action == Command.ENTER_COMMAND) {
		command = "enter(" + label + ", " + toQuotedJavascriptString(details.value) + ")";
    }
	else if(details.targetType == ElementTypes.RADIO_BUTTON) {
	    command = "check(" + label + ")";
	}
	else if(details.targetType == ElementTypes.CHECK_BOX) {
        if (details.value == "true") command = "check(" + label + ")";
        else command = "uncheck(" + label + ")";
	}
	else if (details.action == Command.CHOOSE_COMMAND) {
		command = "pick(" + label + ", " + toQuotedJavascriptString(details.value) + ")";
    }
    else if (details.action == Command.GO_COMMAND) {
        command = "go(" + toQuotedJavascriptString(details.value) + ")";
    }
    
    if (!command) throw new Error("unable to generate keyword command from details: " + details);
    
    return command;
}

function generateKeywordCommandFromDetails(/*CommandDetails*/ details) {
	var command = null;
	var label = details.label == "" ? details.targetXPath : details.label;
	
	if (details.ordinal) label = getOrdinalText(details.ordinal) + " " + label;
	
	if (details.action == Command.CLICK_COMMAND) {
        command = "click " + label;
    }
    else if (details.action == Command.ENTER_COMMAND) {
        var val = details.value;
		command = "type " + toQuotedJavascriptString(val) + " into " + label + " textbox";
    }
	else if(details.targetType == ElementTypes.RADIO_BUTTON) {
	    command = "check " + label;
	}
	else if(details.targetType == ElementTypes.CHECK_BOX) {
        if (details.value == "true") command = "check " + label;
        else command = "uncheck " + label;
	}
	else if (details.action == Command.CHOOSE_COMMAND) {
		command = "choose " + details.value + " from " + label + " listbox";
    }
    else if (details.action == Command.GO_COMMAND) {
        command = "go to " + details.value;
    }
    
    if (!command) throw new Error("unable to generate keyword command from details: " + details);

	return command;
}

/** if node is not clickable but is nested inside a clickable element, return the clickable element ancestor;
otherwise return node */
function getClickableTarget(/*Element*/ e) {
    var currentNode = e;
    
    while (currentNode && currentNode.nodeName != "BODY") {
        if (ElementTypes.isClickable(currentNode)) {
            return currentNode;
        }
            
        currentNode = currentNode.parentNode;
    }
    
    return e;
}

function getContainedTextOrImage(/*Element*/ e) {
    var r = xpath(".//text() | .//img", e);
    var node = r.iterateNext();
    
    while (node) {
        if (node.textContent.match(/\S/)) {
            return node;
        }
        else if (node.getAttribute && node.getAttribute("alt") && node.getAttribute("alt").match(/\S/)) {
            return node;
        }       
        else if (node.getAttribute && node.getAttribute("title") && node.getAttribute("title").match(/\S/)) {
            return node;
        }  
        node = r.iterateNext();
    }
    
    return e;
    
    function xpath(x, root) {
        return root.ownerDocument.evaluate(x, root, null, null, null);
    }
}

function getOrdinalText(/*Number*/ pos) {
    if (pos == 1) return "first";
    else if (pos == 2) return "second";
    else if (pos == 3) return "third";
    else if (pos == 4) return "fourth";
    else if (pos == 5) return "fifth";
    else if (pos == 6) return "sixth";
    else if (pos == 7) return "seventh";
    else if (pos == 8) return "eigth";
    else if (pos == 9) return "ninth";
    else if (pos == 10) return "tenth";
    else if (pos % 10 == 1) return pos + "st";
    else if (pos % 10 == 2) return pos + "nd";
    else if (pos % 10 == 3) return pos + "rd";
    else return pos + "th";
}

function getLabelForElement(/*Element*/ e) {
    var type = ElementTypes.getType(e);
    var label = "";
  
    if (type == ElementTypes.TEXT) {
        if (e.textContent.match(/\S/)) label = e.textContent;
    }
    else if (type == ElementTypes.LINK) {
        if (e.textContent.match(/\S/)) label = e.textContent;
    }
    else if (type == ElementTypes.LIST_ITEM) {
        if (e.textContent.match(/\S/)) label = e.textContent;
    }
    else if (type == ElementTypes.BUTTON) {
        if (e.textContent.match(/\S/)) label = e.textContent;
        else if (e.getAttribute("value") && e.getAttribute("value").match(/\S/)) label = e.getAttribute("value")
        else if (e.getAttribute("title") && e.getAttribute("title").match(/\S/)) label = e.getAttribute("title");
    }
    else if (type == ElementTypes.IMAGE) {
        var alt = e.getAttribute("alt");
        var title = e.getAttribute("title");
        if (alt && alt.match(/\S/)) label = alt;
        else if (title && title.match(/\S/)) label = title;
    }
    else if (type == ElementTypes.RADIO_BUTTON || type == ElementTypes.CHECK_BOX) {
        //var r = xpath("following::text()[..[name() !='SCRIPT'] and ..[name()!='OPTION']]", e);
        //var r = xpath("following::text()[..[name() !='SCRIPT'] and ..[name()!='OPTION']]", e);
        var r = xpath("following::text()", e);

        var l = r.iterateNext();

        while (l) {
            if (l.textContent.match(/\S/) && l.parentNode.nodeName != "SCRIPT" && l.parentNode.nodeName != "OPTION") {
                label += l.textContent + " ";
                break;
            }
            l = r.iterateNext();
        }
        
        l = l.nextSibling ? l.nextSibling : l.parentNode.nextSibling;
        
        while (l) {
            if (l.nodeType == Node.TEXT_NODE && l.textContent.match(/\S/)) {
                label += l.textContent + " " ;   
            }
            else if (!TextBlob.isFlowTag[l.nodeName] && l.nodeName != "LABEL") {
                break;
            }
            
            if (l.childNodes.length > 0 && l.textContent.match(/\S/)) l = l.childNodes[0];
            else if (l.nextSibling) l = l.nextSibling;
            else {
                var newl = l.parentNode.nextSibling;
                
                while (!newl) {
                    if (!l.parentNode) break;
                    l = l.parentNode;
                    newl = l.nextSibling;
                }
                
                l = newl;
           }
        }
        
    }
    else if (type == ElementTypes.TEXT_BOX || type == ElementTypes.LIST_BOX || type == ElementTypes.PASSWORD_BOX) {
        var l = getClosestLabelTo(e);
        if (l != "") label = l;
    }
    else if (ElementTypes.isClickable(e)) {
        var node = getContainedTextOrImage(e);

        if (node) {
            if (ElementTypes.isText(node)) {
                if (node.textContent.match(/\S/)) label = node.textContent;
            }
            else if (node.getAttribute("alt") && node.getAttribute("alt").match(/\S/)) {
                label = node.getAttribute("alt");
            }       
            else if (node.getAttribute("title") && node.getAttribute("title").match(/\S/)) {
                label = node.getAttribute("title");
            } 
        } 
    }
    
    label = removeExtraWhitespace(label);
    
    return label;
    
    function xpath(x, root) {
        return root.ownerDocument.evaluate(x, root, null, null, null);
    }
}

/**
 * Returns the offset of the center of the given element with respect to the root document
 * @param Element element 
 * @return int[] = [offsetLeft, offsetTop]
 */
function getElementOffsets(/*Element*/ e) {
  var currentElement = e;
  var offsetLeft = 0;
  var offsetTop = 0;
  do {
    offsetLeft += currentElement.offsetLeft;
    if (currentElement.scrollLeft) offsetLeft-=currentElement.scrollLeft;
    offsetTop += currentElement.offsetTop;
    if (currentElement.scrollTop) offsetTop-=currentElement.scrollTop;
  } while (currentElement = currentElement.offsetParent); // assignment, not ==
  return [(offsetLeft+e.offsetWidth)/2,(offsetTop+e.offsetHeight)/2];
}

function getSquaredPixelDistance(/*Element*/ e1, /*Element*/ e2) {
  var e1Offsets = getElementOffsets(e1);
  var e2Offsets = getElementOffsets(e2);
  return Math.pow(e1Offsets[0]-e2Offsets[0],2) 
         + Math.pow(e1Offsets[1]-e2Offsets[1],2);
}

function getClosestLabelTo(/*Element*/ e) {
    var cur = e;
    while (cur && cur.nodeName != "BODY") {
  
        if (cur.previousSibling) {
            cur = cur.previousSibling

            if (cur.textContent.match(/\S/)) {
                var s = "";
 
                var x = "descendant-or-self::text()[..[name() !='SCRIPT'] and ..[name()!='OPTION']]";
                var result = e.ownerDocument.evaluate(x, cur, null, null, null);
            
                var text = result.iterateNext();
                while(text) {
                    s += " " + text.textContent;
                    text = result.iterateNext();
                }

                if (s.match(/\S/) && getSquaredPixelDistance(e,cur) <= 9000) {
                    return s;
                }
            }
        } 
        else {
            cur = cur.parentNode
        }
    }
    
    return "";
}

function removeExtraWhitespace(/*String*/ s) {
    s = goog.string.trim(s); 
    s = s.replace(/[\t\n\r ]+/g, " ");

    return s;
}

function toQuotedJavascriptString(/*String*/ s) {
    if (!s) return '""';
    return '"' + s
        .replace(/\r/g,"\\r")
        .replace(/\n/g,"\\n")
        .replace(/"/g,"\\\"")
        + '"'
}

var ElementTypes = new Object();
ElementTypes.TEXT_BOX = "text box";
ElementTypes.PASSWORD_BOX = "password box";
ElementTypes.CHECK_BOX = "check box";
ElementTypes.RADIO_BUTTON = "radio button";
ElementTypes.LIST_ITEM = "list item";
ElementTypes.LIST_BOX = "list box";
ElementTypes.BUTTON = "button";
ElementTypes.LINK = "link";
ElementTypes.IMAGE = "image";
ElementTypes.TEXT = "text";
ElementTypes.OTHER = "other";

ElementTypes.getType = function(/*Element*/ node) {
    if (ElementTypes.isPassword(node)) return ElementTypes.PASSWORD_BOX;
	else if (ElementTypes.isTextbox(node)) return ElementTypes.TEXT_BOX;
	else if (ElementTypes.isCheckbox(node)) return ElementTypes.CHECK_BOX;
	else if (ElementTypes.isRadioButton(node)) return ElementTypes.RADIO_BUTTON;
	else if (ElementTypes.isListitem(node)) return ElementTypes.LIST_ITEM;
	else if (ElementTypes.isListbox(node)) return ElementTypes.LIST_BOX;
	else if (ElementTypes.isButton(node)) return ElementTypes.BUTTON;
	else if (ElementTypes.isLink(node)) return ElementTypes.LINK;
	else if (ElementTypes.isImage(node)) return ElementTypes.IMAGE;
	else if (ElementTypes.isText(node)) return ElementTypes.TEXT;
	else return ElementTypes.OTHER;
}

/** @return true iff node is a button */
ElementTypes.isButton = function(/*Node*/ node) {
  return instanceOf(node, Node)
    && node.nodeType == Node.ELEMENT_NODE 
    && (ckft.util.strings.upperCaseOrNull(node.tagName) == 'BUTTON'
        || (ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT'
            && 'type' in node
            && (node.type == 'submit'
                || node.type == 'button'
                || node.type == 'reset')));
}

/** @return true iff node is a hyperlink  */
ElementTypes.isLink = function(/*Node*/ node) {
  return instanceOf(node, Node)
    && node.nodeType == Node.ELEMENT_NODE 
    && ckft.util.strings.upperCaseOrNull(node.tagName) == 'A';
}

/** @return true iff node is clickable (or at least likely to be */
ElementTypes.isClickable = function(/*Node*/ node) {
    return instanceOf(node, Node)
        && node.nodeType == Node.ELEMENT_NODE
        && (ElementTypes.isButton(node) 
            || ElementTypes.isLink(node)
            || (ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'image')
            || node.hasAttribute('onclick')
            || goog.style.getComputedStyle(node, "cursor") == "pointer");
}

/** @return true if the node is a text input */
ElementTypes.isTextbox = function(/*Node*/ node) {
  if (!instanceOf(node, Node) || node.nodeType != Node.ELEMENT_NODE) return false;
  if (ckft.util.strings.upperCaseOrNull(node.tagName) == 'TEXTAREA') return true;
  if ('type' in node && ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT') {
    var type = node.type;
    if (type == 'text'
        || type == 'password'
        || type == 'file') {
      return true;
    }
  }
  return false;
}

/** @return true if node is a password input */
ElementTypes.isPassword = function(/*Node*/ node) {
    if (!instanceOf(node, Node) || node.nodeType != Node.ELEMENT_NODE) return false;
    if ('type' in node && ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'password') return true;
    return false;
}

/** @return true iff the node is a listbox (select) */
ElementTypes.isListbox = function(/*<Node>*/ node) {
  if (!instanceOf(node, Node) || node.nodeType != Node.ELEMENT_NODE) return false;
  return (ckft.util.strings.upperCaseOrNull(node.tagName) == 'SELECT');
}

/** @return true iff the node is a checkbox */
ElementTypes.isCheckbox = function(node) {
  if (!instanceOf(node, Node) || node.nodeType != Node.ELEMENT_NODE) return false;
  return ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'checkbox';
}

/** @return true iff the node is a radio button */
ElementTypes.isRadioButton = function(node) {
  if (!instanceOf(node, Node) || node.nodeType != Node.ELEMENT_NODE) return false;
  return ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'radio';
}

/** @return true iff the node is a listitem (option) */
ElementTypes.isListitem = function(/*Node*/ node) {
    if (!instanceOf(node, Node) || node.nodeType != Node.ELEMENT_NODE) return false;
    return (ckft.util.strings.upperCaseOrNull(node.tagName) == 'OPTION') || (ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT' && node.type == 'option');
}

/** @return true iff node is an image element */
ElementTypes.isImage = function(node) {
    return instanceOf(node, Node)
        && node.nodeType == Node.ELEMENT_NODE 
        && (ckft.util.strings.upperCaseOrNull(node.tagName) == 'IMG'
            || (ckft.util.strings.upperCaseOrNull(node.tagName) == 'INPUT'
                && 'type' in node
                && node.type == 'image'));
}

/** @return true iff node is a non-whitespace text element */
ElementTypes.isText = function(node) {
    if (!instanceOf(node, Node)) return false;
    return node.nodeType == Node.TEXT_NODE && node.textContent.match(/\S/);
}

var Command = new Object();
Command.GO_COMMAND = "go";
Command.CLICK_COMMAND = "click";
Command.ENTER_COMMAND = "enter";
Command.CHECK_COMMAND = "check";
Command.CHOOSE_COMMAND = "choose";
Command.KEYPRESS_COMMAND = "keypress";
Command.REQUEST_COMMAND = "request";

function recorderFind(/*Document*/ doc, /*String*/ label, /*String*/ type, /*Element*/ context, /*Boolean*/ exact, /*Boolean*/ all) {
    if (exact == undefined) exact = false;
    if (all == undefined) all = true;
    if (!context) context = doc.getElementsByTagName("body")[0];
    
    var matches = new Array();
    var best = new Array();
    var bestStrength = 0;
 
    var iframes = context.getElementsByTagName("iframe");
    
    findInContext(context);
    
    for (var i=0; i<iframes.length; i++) {
        var c = iframes[i].contentDocument.getElementsByTagName("body")[0];
        findInContext(c);
    }

    if (all) matches.sort();
    return all ? matches : best;
    
    function findInContext(/*Element or Document*/ context) {
        var nodes = exact ? getElementsOfType(type, context, label) : getElementsOfType(type, context);
        
        //debug("find: " + label + " " + type);
        var n = nodes.iterateNext();
        while(n) {
            if (n.nodeType == Node.TEXT_NODE && n.parentNode.nodeName == "SCRIPT") {
                n = nodes.iterateNext();
                continue;
            }
            
            var box = ckft.dom.Box.forNode(n);
            if (box.w != 0 && box.h != 0) { 
                var l = getLabelForElement(n);
        
                if (l.match(/\S/)) {
                    var strength = evaluateMatchStrength(l, label, exact);
                    //debug("try: " + strength + " " + l);
                    if (strength > 0) {
                        var m = new RMatch(n, strength, l);
                        matches.push(m);
                        
                        if (strength == bestStrength) best.push(m);
                        else if (strength > bestStrength) {
                            best = new Array();
                            best.push(m);
                            bestStrength = m.strength;
                        }
                    }
                }
            }
    
            n = nodes.iterateNext();
        }
    }
    
    function xpath(x, root) {
        return root.ownerDocument.evaluate(x, root, null, null, null);
    }
}

function getElementsOfType(/*String*/ type, /*Document or Element*/ context, /*String*/ label) {
    var doc = context.ownerDocument ? context.ownerDocument : context;
    var x;
    
    if (type == ElementTypes.TEXT_BOX) {
        x = ".//textarea | .//input[@type='text' or @type='file' or @type='password' or not(@type)]";
    }
    else if (type == ElementTypes.PASSWORD_BOX) {
        x = ".//input[@type='password']";
    }
    else if (type == ElementTypes.CHECK_BOX) {
        x = ".//input[@type='checkbox']";
    }
    else if (type == ElementTypes.RADIO_BUTTON) {
        x = ".//input[@type='radio']";
    }
    else if (type == ElementTypes.LIST_ITEM) {
        x = ".//option | .//input[@type='option']";
    }
    else if (type == ElementTypes.LIST_BOX) {
        x = ".//select";
    }
    else if (type == ElementTypes.BUTTON) {
        x = ".//button | .//input[@type='button' or @type='submit' or @type='reset']";
    }
    else if (type == ElementTypes.LINK) {
        x = ".//a";
    }
    else if (type == ElementTypes.IMAGE) {
        x = ".//img | .//input[@type='image']";
    }
    else if (type == ElementTypes.TEXT) {
        x = label ? ".//text()[.='" + label + "']" : ".//text()";
    }
    else {
        if (label) x = ".//text()[.='" + label + "'] | .//*[@alt='" + label + "' or @title='" + label + "']";
        else x = ".//text() | .//*[@alt or @title]";
    }

    return doc.evaluate(x, context, null, null, null);
}

function compareStringsByEditDistance(/*String*/ s1, /*String*/ s2) {
	var len1 = s1.length;
	var len2 = s2.length;
	var m = new Array(len1+1);
	
	for (var i=0; i<=len1; i++) {
	    m[i] = new Array(len2+1);
	    m[i][0] = i;
	}
	
	for (var j=1; j<=len2; j++) {
	    m[0][j] = j;
    }
	
	for (var i=1; i<=len1; i++) {
		for (var j=1; j<=len2; j++) {
			var num1 = m[i-1][j-1] + (s1.charAt(i-1) == s2.charAt(j-1) ? 0 : 1);
			var num2 = m[i-1][j] + 1;
			var num3 = m[i][j-1] + 1;
			
			m[i][j] = Math.min(num1, num2, num3);
		}
	}

	return 1.0 - ((m[len1][len2]) / Math.max(len1, len2));
}

function compareStringsByLCS(/*String*/ s1, /*String*/ s2) {
    var len1 = s1.length;
    var len2 = s2.length;
    var m = new Array(len1+1);
    var z = 0;
    var start = -1;
    var end = -1;
    
    for (var i=0; i<=len1; i++) {
	    m[i] = new Array(len2+1);
	    m[i][0] = 0;
	}
	
	for (var j=1; j<=len2; j++) {
	    m[0][j] = 0;
    }
    
    for (var i=1; i<=len1; i++) {
        for (var j=1; j<=len2; j++) {
            if (s1.charAt(i-1) == s2.charAt(j-1)) {
                m[i][j] = m[i-1][j-1] + 1;
                
                if (m[i][j] > z) {
                    z = m[i][j];
                    start = end = -1;
                }
                
                if (m[i][j] == z) {
                    start = i-z+1;
                    end = i;
                }
            }
            else m[i][j] = 0;
        }
    }

    return (end-start+1)/Math.max(len1,len2); 
}

function evaluateMatchStrength(/*String*/ testLabel, /*String*/ baseLabel, /*Boolean*/ exact) {
    var strength;
    
    if (exact) strength = baseLabel == testLabel ? 1.0 : 0;
    else strength = compareStringsByLCS(baseLabel, testLabel);
    
    return strength;
}

function RMatch(/*Element*/ e, /*Number*/ strength, /*String*/ label) {
    this.element = e;
    this.strength = strength;
    this.label = label;
}

RMatch.prototype.compare = function(/*Match*/ a, /*Match*/ b) {
    if (b.strength > a.strength) return -1;
    else if (b.strength < a.strength) return 1;
    else return 0;
}

RMatch.prototype.toString = function() {
    return "[" + this.label + ", " + this.strength + "]";
}
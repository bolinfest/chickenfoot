/**
 * Makes a selection from a listbox, dropdown, set of radio buttons,
 * or checkbox.
 * Two arguments are bound up into a list (for the convenience of pick()):
 *    choicePattern is required
 *    checked indicates whether the choice should be selected or unselected.  May be omitted, defaults to true.
 * Throws exception if ambiguity or failure to match.
 */
function checkImpl(/*Document*/doc, /*choicePattern*/choicePattern, /*optional Range*/ context) {
  doCheck(doc, choicePattern, true, context);
}

function uncheckImpl(/*Document*/doc, /*choicePattern*/choicePattern, /*optional Range*/ context) {
  doCheck(doc, choicePattern, false, context);
}

function doCheck (/*Document*/doc, 
                 /*Pattern*/choicePattern, 
                 /*boolean*/ value,
                 /*optional Range*/ context) {
  var bestMatch = null;
  // find best option, radio button, or checkbox in the whole document
  var m = Pattern.find(doc, choicePattern, [Pattern.CHECKBOX, Pattern.RADIOBUTTON], context);
  if (m.count == 0) {
    throw addMatchToError(new Error("No match for " + commandName + "(" + choicePattern + ")"), m);
  } else if (m.count > 1) {
    throw addMatchToError(new Error("More than one best match for " + commandName + "(" + choicePattern + ")"), m);
  }    
  bestMatch = m;
  
  simulateCheck(bestMatch.element, value);
}

/**
 * Simulate a selection of a radio button, or checkbox.
 * Changes the value of the selection, and fires mouse events and change events.
 */
function simulateCheck(/*RadioButton or Checkbox Node*/ node, /*boolean*/ value) {
  if (node.wrappedJSObject) {node = node.wrappedJSObject;}
  //selected or checked as a property in XUL covers most
  //radiobuttons and checkboxes
  if ((instanceOf(node.ownerDocument, XULDocument))
     && ((("selected" in node) && (value != node.selected))
       || (("checked" in node) && (value != node.checked))
       || (isListitem(node))
       || (isMenuItem(node)))) {
    //a direct click() event is fired to the node to reach anonymous content
    //which seems to be unaffected by firing mouse events at it
     node.click() }
  
  //for xul radiobuttons with selected only as an attribute
  else if ((instanceOf(node.ownerDocument, XULDocument))
         && (node.hasAttribute('selected'))
         && (value != (node.getAttribute('selected')))) {
         node.click();
         node.setAttribute('selected', value); }
         
  //for xul checkboxes with checked only as an attribute
  else if ((instanceOf(node.ownerDocument, XULDocument))
          && (node.hasAttribute('checked'))
          && (value != (node.getAttribute('checked')))) {
          node.click();
          node.setAttribute('checked', value); }
  
  //for html elements that do not need a click event to be sent at all        
  //select the option
  else {
    if ("selected" in node) {
    node.selected = value;
    } else if ("checked" in node) {
    node.checked = value;
    } else {
    throw addMatchToError(new Error("Don't know how to check " + node), nodeToMatch(node));
    } 
  }
  
  // simulate the change event
  fireEvent('change', node);
}
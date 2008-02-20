
/**
 * Makes a selection from a listbox, dropdown, set of radio buttons,
 * or checkbox.
 * Three arguments are bound up into a list (for the convenience of pick()):
 *    listPattern describes the listbox.  It can be omitted if choicePattern is found in 
 *           only one listbox on the page, or if choicePattern describes a radiobutton or checkbox instead.
 *    choicePattern is required
 *    checked indicates whether the choice should be selected or unselected.  May be omitted, defaults to true.
 * Throws exception if ambiguity or failure to match.
 */
function pickImpl(/*Document*/doc, /*listPattern,choicePattern,checked*/args, /*optional Range*/ context, /*optional function*/ feedbackHandler) {
  args = expandArguments(args, true);
  doPick(doc, args[0], args[1], args[2], "pick", context, feedbackHandler);
}

function expandArguments(/*listPattern,choicePattern,checked*/args, /*boolean*/ defaultChecked) {
  switch (args.length) {
    case 0:
      throw new Error("pick() must have at least one argument");
    case 1:
      return [undefined, args[0], defaultChecked];
    case 2:
      if (typeof args[1] == "boolean") {
        return [undefined, args[0], args[1]];
      } else {
        return [args[0], args[1], defaultChecked];
      }
    default:
      return args;
  }      
}

/**
 * Unselects a listbox item, dropdown item, or a checkbox.
 * Throws exception if ambiguity or failure to match.
 */
function unpickImpl(/*Document*/doc, /*listPattern,choicePattern,checked*/args, /*optional Range*/ context, /*optional function*/ feedbackHandler) {
  args = expandArguments(args, false);
  doPick(doc, args[0], args[1], args[2], "unpick", context, feedbackHandler);
}

function doPick (/*Document*/doc, 
                 /*optional Pattern*/listPattern, 
                 /*Pattern*/choicePattern, 
                 /*boolean*/ value,
                 /*string*/ commandName, 
                 /*optional Range*/ context,
                 /*optional function*/ feedbackHandler) {
  var bestMatch = null;
  
  if (listPattern === undefined) {
    // find best option, radio button, or checkbox in the whole document
    var m = Pattern.find(doc, choicePattern, [Pattern.CHECKBOX, Pattern.RADIOBUTTON, Pattern.LISTITEM], context);
    if (m.count == 0) {
      throw addMatchToError(new Error("No match for " + commandName + "(" + choicePattern + ")"), m);
    } else if (m.count > 1) {
      throw addMatchToError(new Error("More than one best match for " + commandName + "(" + choicePattern + ")"), m);
    }
    
    bestMatch = m;
    
  } else {
    // STEP 1: find the <SELECT> node that best matches listPattern
    var m = Pattern.find(doc, listPattern, [Pattern.LISTBOX], context);
    if (m.count == 0) {
      throw addMatchToError(new Error("No match for " + commandName + "(" + listPattern + ")"), m);
    } else if (m.count > 1) {
      throw addMatchToError(new Error("More than one best match for " + commandName + "(" + listPattern + ")"), m);
    }

    // STEP 2: find best <OPTION> within the <SELECT>
    var m2 = Pattern.find(doc, choicePattern, [Pattern.LISTITEM], m.range);
    if (m2.count == 0) {
      throw addMatchToError(new Error("No match for " + commandName + "(" + choicePattern + ")"), m);
    } else if (m2.count > 1) {
      throw addMatchToError(new Error("More than one best match for " + commandName + "(" + choicePattern + ")"), m);
    }
    
    bestMatch = m2;    
  }
  Test.assertTrue(bestMatch, "bestMatch was not assigned");

  var node = bestMatch.element;
    
  if (feedbackHandler) feedbackHandler(node, doThePick);
  else doThePick();
  
  function doThePick() {  
      simulatePick(node, value);
  }
}

/**
 * Simulate a selection of a list option, radio button, or checkbox.
 * Changes the value of the selection, and fires mouse events and change events.
 */
function simulatePick(/*Option or RadioButton or Checkbox Node*/ node, /*boolean*/ value) {
  if (node.wrappedJSObject) {node = node.wrappedJSObject;}
  //selected or checked as a property in XUL covers some
  //radiobuttons, checkboxes, and listitems
  if ((instanceOf(node.ownerDocument, XULDocument))
     && ((("selected" in node) && (value != node.selected))
       || (("checked" in node) && (value != node.checked))
       || (isListitem(node))
       || (isMenuItem(node)))) {
    //a direct click() event is fired to the node to reach anonymous content
    //which seems to be unaffected by firing mouse events at it
     node.click() }
  //fireMouseEvent('mousedown', node);
  //fireMouseEvent('mouseup', node);
  //fireMouseEvent('click', node); }
  
  //for xul radiobuttons and listitems with selected only as an attribute
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
  // select the option
  else {
    if ("selected" in node) {
    // it's an OPTION element
    node.selected = value;
  } else if ("checked" in node) {
    node.checked = value;
  } else {
    throw addMatchToError(new Error("Don't know how to pick " + node), nodeToMatch(node));
  } }
  
  // simulate the change event
  fireEvent('change', node);
}

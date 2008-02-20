
/**
 * Finds the text input that is most closely linked
 * to 'pattern' and sets the value of the input to 'value'
 */
function enterImpl(/*Document*/ doc, /*string*/pattern, /*string*/value, /*optional Match*/ context, /*optional function*/ feedbackHandler) {
  if (value === undefined) {
    value = pattern;
    pattern = null;
  }
  var m = Pattern.find(doc, pattern, [Pattern.TEXTBOX], context);

  // make sure exactly one best match
  if (m.count == 0) {
    throw addMatchToError(new Error("No match for enter(" + pattern + ")"), m);
  } else if (m.count > 1) {
    throw addMatchToError(new Error("More than one best match for enter(" + pattern + ")"), m);
  }
  
  // use the one best match
  var node = m.element;
  
  if (feedbackHandler) feedbackHandler(node, doEnter);
  else doEnter();
  
  function doEnter() {
      if ("value" in node) {
        node.value = value}
        //this works on wrapped xul objects and some anonymous nodes
        else if ("value" in node.wrappedJSObject) {
               node.wrappedJSObject.value = value}
             else {
               throw addMatchToError(new Error("Don't know how to enter text into " + node), m);
          }
      
      // simulate events to trigger Javascript handlers on this node
      fireEvent('change', node);
  }
}

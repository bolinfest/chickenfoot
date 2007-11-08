
/**
 * Finds the form that is most closely linked
 * to 'pattern' and resets the value of the form to
 * its original value
 */
function resetImpl(/*Document*/ doc, /*string*/pattern) {

  var m = Pattern.find(doc, pattern);

  // make sure exactly one best match
  if (m.count == 0) {
    throw addMatchToError(new Error("No match for reset(" + pattern + ")"), m);
  } else if (m.count > 1) {
    throw addMatchToError(new Error("More than one best match for reset(" + pattern + ")"), m);
  }
  
  // use the one best match
  var node = m.element;  
  node.reset();
  
}
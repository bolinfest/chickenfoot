// Test whether an object is an instance of a class.
// We use this function in preference to the builtin Javascript
// instanceof operator for two reasons:
// 
// 1. The builtin Javascript classes are different in different
// Javascript namespaces.  So if you create a String s in one
// XPCOM namespace (say, Chickenfoot), and try to test it with 
// "s instanceof String" in another XPCOM namespace, it will return false.  
// This function gets around
// that by comparing class *names* instead of class *objects*, so
// instanceOf(obj, String) will return true for *any* obj created from
// a constructor named "String".  This is a stronger condition than 
// the true Javascript instanceof, but it suffices for our purposes.
//
// 2. There was a bug in instanceof in Firefox 1.0.3: The code
//   <obj> instanceof <type> 
// throws an exception whenever <obj> comes from the browser content 
// (like the document or a node) and <type> is not actually its type.
// The exeption thrown is "Illegal operation on WrappedNative prototype 
// object"  nsresult: "0x8057000c (NS_ERROR_XPC_BAD_OP_ON_WN_PROTO)".
// This instanceOf() function does not throw an exception, but instead
// quietly returns false.
//

function instanceOf(value, type) {
//  return value instanceof type;

  var result;
  try {
    // first try built-in test -- if it succeeds, we're golden.
    result = value instanceof type;
  } catch (exception) {
    if (exception instanceof TypeError) {
      throw exception; // indicates that "type" is not a type
    }
    // Otherwise, assume the exception was caused by 
    // the Firefox 1.0.3 bug.  Work around it.
    return (type === Object);
  }
  if (result) {
    return true;
  }

  // instanceof operator returned false.

  // Make sure value is an object, because instanceof
  // should be false if it's not.
  var valueType = typeof value;
  if (value == null
      || (valueType != "object" && valueType != "function")) {
    return false;
  }

  // Try comparing class names.
  try {
    var typeName = type.name;
    var valueClassName = value.constructor.name;

    if (typeName == "Object") {
      // already checked that value is an object, so
      // this must be true
      return true; 
    }

    if (!valueClassName || !typeName) return false;
    
    return valueClassName == typeName;

  } catch (exception) {
    return false;
  }
}



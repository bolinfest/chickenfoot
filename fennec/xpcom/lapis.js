//
// Connection to LAPIS.
//

// Reference to Lapis-Chickenfoot bridge XPCOM object.
var LapisChickenfoot;

// When user first tries to reference the TC pattern constructor, we search for the LAPIS-Chickenfoot bridge.
// If we find it, we return its TC constructor; otherwise we return a constructor that throws an exception.
TC getter = function() {
  // connect to LAPIS, if installed
  var cls = Components.classes["@uid.csail.mit.edu/lapis-chickenfoot/;1"];
  var constructor;
  
  if (cls) {
    LapisChickenfoot = cls.getService(Components.interfaces.nsISupports).wrappedJSObject;
    LapisChickenfoot.setupFromChickenfoot(Chickenfoot);
    constructor = LapisChickenfoot.TC;
  } else {
    constructor = function() {
      throw new Error("TC patterns are not available.  You need to install the LAPIS-Chickenfoot bridge.");
    };
  }
  
  delete TC;
  TC = constructor;
  return constructor;
}



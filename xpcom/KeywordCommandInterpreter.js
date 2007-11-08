
/**
    Takes a keyword command and an html document,
    and returns some interpretations in rank order of how likely they are.
    <p>
    The interpretations are listed in an array,
    and each entry is an object with the following keys:
        text - a human readable representation of the interpretation
        execute - a javascript function that will carry out the effect
        node - the node that is about to be acted upon
            (or null if this command will not act on a node, e.g., "go to google.com")
    
    @param  doc             The HTMLDocument object associated with a webpage
                            (provides context for the keyword command).
    @param  keywordCommand  The keyword command itself (e.g. "click search button").
    @param	xmlFuncString	(Optional) An XML string describing the functions in the API.
    @return                 An array of interpretations.
*/
//
// Connection to LAPIS.
//

// Reference to Keyword Command Interpreter XPCOM object.
var KCI;

// When user first tries to reference the TC pattern constructor, we search for the LAPIS-Chickenfoot bridge.
// If we find it, we return its TC constructor; otherwise we return a constructor that throws an exception.
Chickenfoot.interpretKeywordCommand getter = function() {
  // connect to LAPIS, if installed
  var cls = Components.classes["@uid.csail.mit.edu/kci/;1"];
  var fn;
  
  if (cls) {
    KCI = cls.getService(Components.interfaces.nsISupports).wrappedJSObject;
    KCI.setupFromChickenfoot(Chickenfoot);
    fn = KCI.interpretKeywordCommand;
  } else {
    constructor = function() {
      throw new Error("Keyword commands are not available.  You need to install the Keyword Command Interpreter extension.");
    };
  }
  
  delete Chickenfoot.interpretKeywordCommand;
  Chickenfoot.interpretKeywordCommand = fn;
  return fn;
}

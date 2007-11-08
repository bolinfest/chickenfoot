
/**
 * Creates a new, random GUID
 */
function generateRandomGuid() {
  var guidClass = getJavaClass("chickenfoot.RandomGUID");
  var guidCreateFunc = guidClass.getMethod("createRandomGUID", []);
  var guid = guidCreateFunc.invoke(null, [ ]);

  // make sure guid is a JS string instead of a Java string
  return ("" + guid.toString());
}
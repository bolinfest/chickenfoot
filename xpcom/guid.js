
/**
 * Creates a new, random GUID
 *
 */

function generateRandomGuid() {
  var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
        .getService(Components.interfaces.nsIUUIDGenerator);
  var guid = "" + uuidGenerator.generateUUID();
  return guid.substring(1, 37);
}
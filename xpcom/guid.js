
/**
 * Creates a new, random GUID
 *
 */

function generateRandomGuid() {
  var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
        .getService(Components.interfaces.nsIUUIDGenerator);
  return "" + uuidGenerator.generateUUID();
}

/**
 * returns the hash of the given string
 */
function hash(/*string*/ hashMe, /*optional string*/ algorithmName) {
  if (!algorithmName) {
    algorithmName = "SHA1";
  }

  var stringStream = Components.
    classes["@mozilla.org/io/string-input-stream;1"].
    createInstance(Components.interfaces.nsIStringInputStream);
  var hasher = Components.
    classes["@mozilla.org/security/hash;1"].
    getService(Components.interfaces.nsICryptoHash);
  // TODO(glittle): please document how this number was chosen;
  // is it random or is it significant?
  var PR_UINT32_MAX = 4294967295;
    
  stringStream.setData(hashMe, -1);
  hasher.initWithString(algorithmName);
  hasher.updateFromStream(stringStream, PR_UINT32_MAX);
  return hasher.finish(true);
}

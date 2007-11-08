
localUrl_secretNumber = Math.random();

/**
 * creates a url that can access a local file despite Firefox's security protocol
 */
function localUrlImpl(/*string*/ url) {
  return "chicken-bypass-@GUID@:" + 
    hash(url + localUrl_secretNumber).substring(0, 6) + ":" + url;
}

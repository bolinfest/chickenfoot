/**
 * Chickenfoot JavaScript client library for the Facebook API.
 *
 * To use this library, you must first obtain a developer key
 * for a _Desktop_ application from Facebook:
 *
 * http://developers.facebook.com/account.php
 *
 * Once you have a developer key, you can start using this library
 * in the following way using Chickenfoot:
 *
 * Sample usage:
 * <pre>
 * include("facebook.js");
 * var apiKey = "d52b9...";
 * var secret = "1e68f...";
 * var client = new facebook.FacebookRestClient(apiKey, secret);
 * client.createToken();
 *
 * // createToken() opens Facebook login page in a tab
 * // need to block until user has entered login info
 *
 * client.getSession();
 * var doc = client.callMethod("friends.get");
 * var result = doc.evaluate("/result/result_elt/text()",
 *     doc, null, XPathResult.ANY_TYPE, null);
 * var node;
 * while (node = result.iterateNext()) {
 *   // print out the ids of all of your friends
 *   output(node.textContent);
 * }
 * </pre>
 *
 * To see what other methods you can call, explore the documentation
 * for the Facebook API:
 *
 * http://developers.facebook.com/documentation.php
 *
 * To see more examples of how to use this library from Chickenfoot,
 * look under the "Libraries" link on the Chickenfoot web site:
 *
 * http://groups.csail.mit.edu/uid/chickenfoot/libraries/facebook.html
 */

var facebook = {};

facebook.FacebookRestClient = function(apiKey, secret, opt_serverUrl) {
  this.apiKey = apiKey;
  this.secret = secret;
  this.serverUrl = opt_serverUrl || "https://api.facebook.com/restserver.php";
}

facebook.FacebookRestClient.prototype.createToken = function() {
  var params = [
    'api_key=' + this.apiKey,
    'method=auth.createToken'
  ];
  this.generateSig_(params, this.secret);
  var postData = params.join("&");
  var xhr = this.postRequest_(postData);
  this.token = this.xpathGetText_("/result/token/text()", xhr);
  var loginUrl = "http://api.facebook.com/login.php?api_key=" +
    this.apiKey + "&auth_token=" + this.token;
  openTab(loginUrl, true);
}

facebook.FacebookRestClient.prototype.getSession = function() {
  var params = [
    'api_key=' + this.apiKey,
    'auth_token=' + this.token,
    'method=auth.getSession'
  ];
  this.generateSig_(params, this.secret);
  var postData = params.join("&");
  var xhr = this.postRequest_(postData);
  this.sessionKey = this.xpathGetText_("/result/session_key/text()", xhr);
  this.secret = this.xpathGetText_("/result/secret/text()", xhr);
}

/**
 * @param method {string}
 * @param params {array<string>}
 * @return {XMLDocument}
 */
facebook.FacebookRestClient.prototype.callMethod =
    function(method, opt_params) {
  var params = [];
  // make a typesafe copy of the params
  if (opt_params) {
    for (var i = 0; i < opt_params.length; ++i) {
      params[i] = opt_params[i];
    }
  }
  params.push("api_key=" + this.apiKey);
  params.push("session_key=" + this.sessionKey);
  params.push("call_id=" + (new Date()).getTime());
  params.push("method=" + method);
  this.generateSig_(params, this.secret);
  var postData = params.join("&");
  var xhr = this.postRequest_(postData);
  return xhr.responseXML;
}

facebook.FacebookRestClient.prototype.postRequest_ = function(postData) {
  var xhr = new XMLHttpRequest();
  var asynchronous = false;
  xhr.open("POST", this.serverUrl, asynchronous);
  xhr.setRequestHeader("content-type",
                       "application/x-www-form-urlencoded");
  xhr.send(postData);
  this.validate_(xhr);
  return xhr;
}

/**
 * Convienience method to extract a single piece of text using XPath
 * @param xpath {string} XPath expression that returns text, such as:
 *   "/result/token/text()"
 * @param xhr {XMLHttpRequest} containing the XML document
 *   (via the responseXML property) to query with the xpath expression
 * @private
 */
facebook.FacebookRestClient.prototype.xpathGetText_ = function(xpath, xhr) {
  var doc = xhr.responseXML;  
  return doc.evaluate(xpath, doc, null,
      XPathResult.STRING_TYPE, null).stringValue;
}

/**
 * Validate the response in an XMLHttpRequest:
 * <ul>
 *  <li>Make sure the readyState is 4
 *  <li>Make sure the status is in the 200s
 *  <li>Make sure it does not contain a Facebook error
 * </ul>
 * @param xhr {XMLHttpRequest}
 * @throws Error if the response is not valid
 * @private
 */
facebook.FacebookRestClient.prototype.validate_ = function(xhr) {
  if (xhr.readyState != 4) {
    throw new Error("Ready state is: " + xhr.readyState);
  } else if (xhr.status < 200 || xhr.status >= 300) {
    throw new Error("Bad status code: " + xhr.status);
  }
  var doc = xhr.responseXML;
  var result = doc.evaluate("count(//fb_error)",
      doc, null, XPathResult.NUMBER_TYPE, null);
  if (result.numberValue > 0) {
    var code = this.xpathGetText_("//fb_error/code/text()", xhr);
    var msg = this.xpathGetText_("//fb_error/msg/text()", xhr);
    throw new Error("Facebook error #" + code + ": " + msg);
  }
}

/**
 * !!!This function mutates the params argument!!!
 * The elements in params may be reordered and
 * "sig=THE_SIG" will be added to params.
 *
 * @param params is an array where each element is
 *   a string of the form "arg=val"
 * @param secret is the string used to sign calls
 * @private
 */
facebook.FacebookRestClient.prototype.generateSig_ = function(params, secret) {
  params.sort();
  var buffer = "";
  for (var i = 0; i < params.length; ++i) {
    buffer += params[i];
  }
  buffer += secret;

  // from http://developer.mozilla.org/en/docs/nsICryptoHash
  var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  converter.charset = "UTF-8";

  var cryptoHash = Components.classes["@mozilla.org/security/hash;1"].createInstance();
  cryptoHash.QueryInterface(Components.interfaces.nsICryptoHash);
  cryptoHash.init(cryptoHash.MD5);
  var data = converter.convertToByteArray(buffer, {});
  cryptoHash.update(data, data.length);
  binaryHashData = cryptoHash.finish(false);

  var sig = "";
  for (var i = 0; i < binaryHashData.length; ++i) {
    sig += ("0" + binaryHashData.charCodeAt(i).toString(16)).slice(-2);
  }
  params.push("sig=" + sig);
  return sig;
}

/**
 * An implementation of the Greasemonkey API that can be include()'d in Chickenfoot:
 *
 * include("greasemonkey.js");
 *
 * This library could use some work, preferably by someone who has a great
 * deal of experience using Greasemonkey and understands the nuances of the API.
 * If you have suggestions, then please email: chickenfoot-developers@lists.csail.mit.edu
 */

/**
 * Instead of outputting to the JavaScript console like in Greasemonkey,
 * this will print the arguments in Chickenfoot's Output pane.
 */
var GM_log;

/**
 * Currently, this function is a NOOP in Chickenfoot. It prints out a warning
 * saying that the command is not implemented. To disable this warning, go to
 * about:config, create the following boolean pref, and set its value to true:
 *
 * chickenfoot.greasemonkey-ignore-GM_registerMenuCommand-warning
 *
 * When running a Greasemonkey script that has not been tested in Chickenfoot before,
 * it is a good idea to have this warning turned on -- if the Greasemonkey script
 * depends on the functionality of GM_registerMenuCommand(), then the warning
 * may help you discover why the Greasemonkey script is not working in Chickenfoot.
 */
var GM_registerMenuCommand;

/**
 * @param details is an object that may contain these properties:
 * <ul>
 *  <li>method
 *  <li>url
 *  <li>headers
 *  <li>data
 *  <li>onload
 *  <li>onerror
 *  <li>onreadystatechange
 * </ul>
 * @return the XMLHttpRequest that was created
 */
var GM_xmlhttpRequest;

/**
 * @throw Error (not implemented)
 */
var GM_setValue;

/**
 * @throw Error (not implemented)
 */
var GM_getValue;

/**
 * Opens the specified URL in a new tab.
 */
var GM_openInTab;

/**
 * Adds a string of CSS to the document.
 * @throw Error (not implemented)
 */
var GM_addStyle;

/**
 * A reference to the content document's javascript window object.
 * This is where the content document's global variable and functions are defined.
 */
var unsafeWindow;

(function() {

  GM_log = function(message, level) {
    output(message);
  }

  var ignoreWarningPrefName = 'greasemonkey-ignore-GM_registerMenuCommand-warning';  
  var chickenfootPrefs = Components.classes['@mozilla.org/preferences-service;1'].
                         getService(Components.interfaces.nsIPrefService).
                         getBranch('chickenfoot.');
  var ignoreWarning = chickenfootPrefs.prefHasUserValue(ignoreWarningPrefName)
                      && chickenfootPrefs.getBoolPref(ignoreWarningPrefName);

  GM_registerMenuCommand = function() {
    var ignoreWarning = chickenfootPrefs.prefHasUserValue(ignoreWarningPrefName)
                        && chickenfootPrefs.getBoolPref(ignoreWarningPrefName);
    if (!ignoreWarning) {
      output("WARNING! Unsupported operation: GM_registerMenuCommand()");
    }
  }

  GM_xmlhttpRequest = function(details) {
    // how Mozilla shows how to use XMLHttpRequest:
    // http://developer.mozilla.org/en/docs/AJAX:Getting_Started
    var request = new XMLHttpRequest();
    var addXmlHttpRequestListener = function(/*XMLHttpRequest*/ request,
                                             /*String*/ eventName,
                                             /*Function*/ callback) {
      request[eventName] = function(event) {
        var responseDetails = {
          responseText: request.responseText,
          readyState: request.readyState,
          responseHeaders: (request.readyState == 4 ? request.getAllResponseHeaders() : ''),
          status: request.readyState == 4 ? request.status : 0,
          statusText: request.readyState == 4 ? request.statusText : ''
        };
        callback.call(null, responseDetails);
      }
    };
  
    var recognizedEvents = {
      onload : null,
      onerror : null,
      onreadystatechange : null
    };
  
    // add event listeners
    for (var eventName in recognizedEvents) {
      if (details[eventName]) {
        addXmlHttpRequestListener(request, eventName, details[eventName]);
      }
    }
  
    // open the connection
    request.open(details.method, details.url, true);
    
    // set the headers
    if (details.headers) {
      for (var header in details.headers) {
        request.setRequestHeader(header, details.headers[header]);
      }
    }
    
    // send the data
    request.send(details.data);
    return request;
  }

  // The values set by GM_setValue() are stored in a hash serialized as JSON
  // in the preference "chickenfoot.greasemonkey_value_store"
  var chickenfootPrefBranch = Components.classes['@mozilla.org/preferences-service;1'].
                                  getService(Components.interfaces.nsIPrefService).
                                  getBranch('chickenfoot.');
  var GM_VALUE_STORE_KEY = 'greasemonkey_value_store';
  var JSON = {};
  include('json.js', JSON);
  var json;
  if (chickenfootPrefBranch.prefHasUserValue(GM_VALUE_STORE_KEY)) {
    json = chickenfootPrefBranch.getCharPref(GM_VALUE_STORE_KEY);
  } else {
    json = "{}";
  }
  var values;
  try {
    values = JSON.deserialize(json);
  } catch (e) {
    values = {};
  }
  
  GM_setValue = function(key, val) {
    // TODO(mbolin): make this function fault-tolerant
    if (typeof key !== 'string') throw new Error('key must be a string!');
    var oldValue = values[key];
    if (oldValue !== val) {
      values[key] = val;
      json = JSON.serialize(values);
      chickenfootPrefBranch.setCharPref(GM_VALUE_STORE_KEY, json);
    }
    return oldValue;
  }
  
  GM_getValue = function(key,/*optional*/ defaultValue) {
    if (key in values) {
      return values[key];
    } else {
      return defaultValue;
    }
  };
  
  GM_openInTab = function(url) {
    return openTab(url);
  };
  
  /**
   * addGlobalStyle(css) copied with permission of its author, Mark Pilgrim, from
   * http://diveintogreasemonkey.org/patterns/add-css.html
   * Thanks Mark!
   */
  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }
  
  GM_addStyle = function(css) {
    addGlobalStyle(css);
  };
  
  unsafeWindow = window.wrappedJSObject;

})();

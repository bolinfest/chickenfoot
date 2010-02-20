/**
 * @fileoverview Simple authentication library for working with GData. Also
 * provides JS analogues for the following GData Java classes:
 * <ul>
 *   <li>com.google.gdata.data.docs.DocumentListEntry
 *   <li>com.google.gdata.data.docs.DocumentListFeed
 * </ul>
 * @see http://code.google.com/apis/gdata/javadoc/
 */
include('closure-lite.js');

goog.provide('gdata.auth');
goog.provide('gdata.auth.ServiceName');
goog.provide('gdata.auth.User');
goog.provide('gdata.docs.DocumentListFeed');
goog.provide('gdata.docs.DocumentType');
goog.provide('gdata.docs.DocumentListEntry');

goog.require('goog.json');
goog.require('goog.string');


/**
 * Values taken from http://code.google.com/apis/base/faq_gdata.html#clientlogin
 * @enum {string}
 */
gdata.auth.ServiceName = {
  ANALYTICS: 'analytics',
  APPS_PROVISIONING: 'apps',
  BASE: 'gbase',
  SITES: 'jotspot',
  BLOGGER: 'blogger',
  BOOK_SEARCH: 'print',
  CALENDAR: 'cl',
  CODE_SEARCH: 'codesearch',
  CONTACTS: 'cp',
  DOCUMENTS_LIST: 'writely',
  FINANCE: 'finance',
  GMAIL_ATOM: 'mail',
  HEALTH: 'health',
  MAPS: 'local',
  PICASA_WEB_ALBUMS: 'lh2',
  SIDEWIKI: 'annotateweb',
  SPREADSHEETS: 'wise',
  WEBMASTER_TOOLS: 'sitemaps',
  YOUTUBE: 'youtube'
};


/**
 * Authenticates the user using the supplied password.
 * If successful, the existing authToken associated with the service will be
 * overwritten (if it exists).
 * This method is synchronous, so if authentication fails, an error is thrown.
 * @param {string} email
 * @param {string} password
 * @param {gdata.auth.ServiceName} service
 * @throws Error if authentication is unsuccessful.
 */
gdata.auth.authenticate = function(email, password, service) {
  var authToken = null;
  var loginUrl = 'https://www.google.com/accounts/ClientLogin';
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open('POST', loginUrl, asynchronous);

  var params = 'accountType=GOOGLE&Email=' + goog.string.urlEncode(email) +
      '&Passwd=' + goog.string.urlEncode(password) + '&service=' + service;
  request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  request.setRequestHeader('GData-Version', '3.0');
  request.setRequestHeader('Connection', 'close');
  request.send(params);

  if (request.status == 200) {
    var data = request.responseText;
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i];
      var match = line.match(/^Auth=([\w-]+)$/);
      if (match) {
        authToken = match[1];
        break;
      }
    }
    if (!authToken) {
      throw new Error('No "Auth=" found in response from ClientLogin.');
    }
  } else {
    throw new Error('Login error: ' + request.status + ' ' +
        request.statusText);
  }

  gdata.auth.writeAuthToken(email, service, authToken);
};


/**
 * @param {string} email
 * @param {gdata.auth.ServiceName} service
 * @param {string} authToken
 * @private
 */
gdata.auth.writeAuthToken = function(email, service, authToken) {
  try {
    var prefBranch = Chickenfoot.getPrefBranch();
    var prefName = gdata.auth.getAuthTokenPrefName_(email, service);
    prefBranch.setCharPref(prefName, authToken);
  } catch (e) {
    // Ignore; prefs are funny sometimes.
  }
};


/**
 * @param {string} email
 * @param {gdata.auth.ServiceName} service
 * @return {string?}
 */
gdata.auth.lookupAuthToken = function(email, service) {
  try {
    var prefBranch = Chickenfoot.getPrefBranch();
    var prefName = gdata.auth.getAuthTokenPrefName_(email, service);
    return prefBranch.getCharPref(prefName);
  } catch (e) {
    // Ignore; prefs are funny sometimes.
  }
  return null;
};


/**
 * @param {string} email
 * @param {gdata.auth.ServiceName} service
 */
gdata.auth.deleteAuthToken = function(email, service) {
  try {
    var prefBranch = Chickenfoot.getPrefBranch();
    var prefName = gdata.auth.getAuthTokenPrefName_(email, service);
    // This does not actually delete the entry from about:config; it just sets
    // its value to the empty string.
    prefBranch.clearUserPref(prefName);
  } catch (e) {
    // Ignore; prefs are funny sometimes.
  }
};


/**
 * Gets the name of the pref that would identify the user's authToken if it
 * exists in Firefox's preference store.
 * @return {string}
 * @private
 */
gdata.auth.getAuthTokenPrefName_ = function(email, service) {
  return 'gdata:' + email + ':token:' + service;
};


/**
 * @type {Object}
 * @private
 */
// TODO(mbolin): Copy more URLs from http://code.google.com/apis/base/faq_gdata.html#AuthScopes
gdata.auth.urlPrefixMap_ = {
  'http://www.google.com/calendar': gdata.auth.ServiceName.CALENDAR,
  'http://docs.google.com': gdata.auth.ServiceName.DOCUMENTS_LIST,
  'http://maps.google.com/maps': gdata.auth.ServiceName.MAPS,
  'http://spreadsheets.google.com': gdata.auth.ServiceName.SPREADSHEETS,
  'http://sites.google.com/feeds/': gdata.auth.ServiceName.SITES
};


/**
 * @param {string} url
 * @return {gdata.auth.ServiceName} service
 * @private
 */
gdata.auth.getServiceForUrl_ = function(url) {
  var index = url.indexOf('/feeds/');
  if (index < 0) {
    throw new Error('Cannot determine service for URL: ' + url);
  }
  var urlPrefix = url.substring(0, index);
  var service = gdata.auth.urlPrefixMap_[urlPrefix];
  if (!service) {
    throw new Error('Cannot determine service for URL: ' + url);
  }
  return service;
};


/**
 * @param {string} email
 * @param {string} url
 * @return {string}
 * @private
 */
gdata.auth.getAuthTokenForUrl_ = function(email, url) {
  var service = gdata.auth.getServiceForUrl_(url);
  var authToken = gdata.auth.lookupAuthToken(email, service);
  if (!authToken) {
    throw new Error('No authToken for user: ' + email);
  }
  return authToken;
};


/**
 * Performs an authenticated GET request to a Google Docs GData URL.
 * @param {string} email Address for the user on whose behalf the request is
 *     being made.
 * @param {string} url Feed URL being requested.
 * @param {function(string)} callback That is called with the responseText if
 *     the GET is successful.
 * @param {function(XMLHttpRequest)} errorCallback That is called with the XHR
 *     if the GET is unsuccessful.
 */
gdata.auth.doGet = function(email, url, callback, errorCallback) {
  // Make sure an authToken exists before creating the request.
  var authToken = gdata.auth.getAuthTokenForUrl_(email, url);

  var xhr = new XMLHttpRequest();

  // Set up the callbacks.
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        callback(xhr.responseText);
      } else {
        errorCallback(xhr);
      }
    }
  };

  var asynchronous = true;
  // Add a GET parameter to the URL so the output is in JSON.
  url += (url.indexOf('?') < 0 ? '?' : '&') + 'alt=json';
  xhr.open('GET', url, asynchronous);
  
  xhr.setRequestHeader('GData-Version', '3.0');
  xhr.setRequestHeader('Authorization', 'GoogleLogin auth=' + authToken);
  xhr.send(null);
};


/**
 * The boundary in the multipart payload must be END_OF_PART.
 * @param {string} email
 * @param {string} url
 * @param {string} payload
 * @param {function(string)} callback
 * @param {function(XMLHttpRequest)} errorCallback
 */
gdata.auth.doMultipartPut = function(email, url, payload, callback, errorCallback) {
  // Make sure an authToken exists before creating the request.
  var authToken = gdata.auth.getAuthTokenForUrl_(email, url);

  var xhr = new XMLHttpRequest();

  // Set up the callbacks.
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        callback(xhr.responseText);
      } else {
        errorCallback(xhr);
      }
    }
  };

  var asynchronous = true;
  xhr.open('PUT', url, asynchronous);
  xhr.setRequestHeader('GData-Version', '3.0');
  xhr.setRequestHeader('Authorization', 'GoogleLogin auth=' + authToken);
  xhr.setRequestHeader('Content-Length', payload.length);
  xhr.setRequestHeader('Content-Type', 'multipart/related; boundary=END_OF_PART');
  xhr.setRequestHeader("If-Match", "*");
  xhr.setRequestHeader("Connection", "close");
  xhr.send(payload);
};


/**
 * @param {string} user
 * @constructor
 */
gdata.auth.User = function(email) {
  /**
   * @param {string}
   * @private
   */
  this.email_ = email;
};


/**
 * @return {string} this user's email address
 */
gdata.auth.User.prototype.getEmail = function() {
  return this.email_;
};


/**
 * Logs the user into one or more services.
 * @param {string} password
 * @param {gdata.auth.ServiceName|Array.<gdata.auth.ServiceName>} services may
 *     be a single service or a list of services.
 * @throws Error if login is unsuccessful.
 */
gdata.auth.User.prototype.login = function(password, services) {
  if (typeof services == 'string') {
    services = [services];
  }
  for (var i = 0; i < services.length; ++i) {
    gdata.auth.authenticate(this.email_, password, services[i]);
  }
};


/**
 * Determines whether the user has an authToken for the specified service.
 * @param {gdata.auth.ServiceName} service
 * @return {boolean}
 */
gdata.auth.User.prototype.isAuthenticated = function(service) {
  return !!gdata.auth.lookupAuthToken(this.email_, service);
};


/**
 * Delete the user's authToken associated with the specified service.
 * @param {gdata.auth.ServiceName} service
 */
gdata.auth.User.prototype.logoutFromService = function(service) {
  gdata.auth.deleteAuthToken(this.email_, service);
};


/**
 * Removes any authTokens the user has for GData services.
 */
gdata.auth.User.prototype.logout = function() {
  for (var service in gdata.auth.ServiceName) {
    this.logoutFromService(gdata.auth.ServiceName[service]);
  }
};


/**
 * @param {string} url
 * @param {function} callback
 * @param {function} errorCallback
 */
gdata.auth.User.prototype.doGet = function(url, callback, errorCallback) {
  gdata.auth.doGet(this.email_, url, callback, errorCallback);
};


/**
 * @param {string} url
 * @param {string} payload
 * @param {function(string)} callback
 * @param {function(XMLHttpRequest)} errorCallback
 */
gdata.auth.User.prototype.doMultipartPut =
    function(url, payload, callback, errorCallback) {
  gdata.auth.doMultipartPut(this.email_, url, payload, callback, errorCallback);
};
  
  
/**
 * Document list for a Google Docs account associated with the specified user.
 * @param {gdata.auth.User} user
 * @constructor
 */
gdata.docs.DocumentListFeed = function(user) {
  /**
   * @type {gdata.auth.User}
   * @private
   */
  this.user_ = user;
};


/**
 * @param {function(Array.<gdata.docs.DocumentListEntry>)} callback
 * @param {function(string)} errorCallback That is called with an error message
 *     if the documents cannot be fetched.
 */
gdata.docs.DocumentListFeed.prototype.fetchDocuments = function(callback, errorCallback) {
  // TODO(mbolin): Need a way to cache results.
  var user = this.user_;
  user.doGet('http://docs.google.com/feeds/default/private/full',
      function (jsonAsString) {
        // Use goog.json.unsafeParse because the JSON can be trusted and
        // goog.json.unsafeParse is faster.
        var json = goog.json.unsafeParse(jsonAsString);
        var entries = json['feed']['entry'];
        var documents = [];
        for (var i = 0; i < entries.length; ++i) {
          var entry = entries[i];
          documents.push(new gdata.docs.DocumentListEntry(user, entry));
        }
        callback(documents);
      },
      function(xhr) {
        var msg = 'ERROR: (' + xhr.status + ') ' + xhr.responseText;
        errorCallback(msg);
      });
};


// TODO(mbolin): Missing folder, pdf, and photo types.
/**
 * @enum {string}
 */
gdata.docs.DocumentType = {
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet', // forms are apparently classified as spreadsheets
  PRESENTATION: 'presentation'
};


/**
 * An entry representing a single document of any type within a
 * gdata.docs.DocumentListFeed.
 * @param {gdata.auth.User} user
 * @param {Object} json
 * @constructor
 */
gdata.docs.DocumentListEntry = function(user, json) {
  this.user_ = user;
  this.json_ = json;

  /**
   * @type {gdata.docs.DocumentType}
   * @private
   */
  this.documentType_ = gdata.docs.DocumentListEntry.getTypeForJson_(json);
};


/**
 * @type {Object}
 * @private
 */
gdata.docs.DocumentListEntry.labelToDocumentTypeMap_ = {};
new function() {
  for (var documentType in gdata.docs.DocumentType) {
    var label = gdata.docs.DocumentType[documentType];
    gdata.docs.DocumentListEntry.labelToDocumentTypeMap_[label] = documentType;
  }
}


/**
 * @param {Object} json With property "category"
 * @return {gdata.docs.DocumentType}
 * @private
 */
gdata.docs.DocumentListEntry.getTypeForJson_ = function(json) {
  var categories = json.category;
  for (var i = 0; i < categories.length; ++i) {
    var label = categories[i]['label'];
    if (label in gdata.docs.DocumentListEntry.labelToDocumentTypeMap_) {
      return label;
    }
  }
  return null;
};


/**
 * @return {string}
 */
gdata.docs.DocumentListEntry.prototype.getTitle = function() {
  return this.json_['title']['$t'];
};


/**
 * @return {gdata.docs.DocumentType}
 */
gdata.docs.DocumentListEntry.prototype.getDocumentType = function() {
  return this.documentType_;
};


/**
 * @param {function(string)} callback That is called with the content of this
 *     document as HTML, if successful.
 * @param {function(string)} errorCallback
 */
gdata.docs.DocumentListEntry.prototype.getContentAsHtml = function(callback, errorCallback) {
  this.getContent_(true /* html */, callback, errorCallback);
};


/**
 * @param {function(string)} callback That is called with the content of this
 *     document as plaintext, if successful.
 * @param {function(string)} errorCallback
 */
gdata.docs.DocumentListEntry.prototype.getContentAsText = function(callback, errorCallback) {
  this.getContent_(false /* html */, callback, errorCallback);
};


/**
 * @param {boolean} html Whether to get the content as HTML (true) or plaintext
 *     (false).
 * @param {function(string)} callback
 * @param {function(string)} errorCallback
 */
gdata.docs.DocumentListEntry.prototype.getContent_ = function(html, callback, errorCallback) {
  // url will be of the form of:
  // http://docs.google.com/feeds/download/documents/Export?docId=XXXXXX
  var url = this.json_['content']['src'];
  if (!html) {
    url += '&exportFormat=txt';
  }

  // When hitting a content URL, it does not return as JSON -- the content is
  // simply returned verbatim.
  this.user_.doGet(url, callback, errorCallback);
};


/** @return {boolean} */
gdata.docs.DocumentListEntry.prototype.isDocument = function() {
  return this.getDocumentType() == gdata.docs.DocumentType.DOCUMENT;
};


/** @return {boolean} */
gdata.docs.DocumentListEntry.prototype.isSpreadsheet = function() {
  return this.getDocumentType() == gdata.docs.DocumentType.SPREADSHEET;
};


/** @return {boolean} */
gdata.docs.DocumentListEntry.prototype.isPresentation = function() {
  return this.getDocumentType() == gdata.docs.DocumentType.PRESENTATION;
};


/**
 * @param {string}
 * @return {string}
 */
gdata.docs.DocumentListEntry.prototype.getLink_ = function(rel) {
  var links = this.json_['link'];
  for (var i = 0; i < links.length; ++i) {
    var link = links[i];
    if (link['rel'] == rel) {
      return link['href'];
    }
  }
  return null;
};


/**
 * Returns the URL to the document on docs.google.com where it can be viewed in
 * its native editor.
 * @return {string}
 */
gdata.docs.DocumentListEntry.prototype.getUrl = function() {
  return this.getLink_('alternate');
};


/**
 * Updates the document with the specified content.
 * @param {string} content as HTML.
 * @param {function(string)} callback
 * @param {function(string)} errorCallback
 */
gdata.docs.DocumentListEntry.prototype.update = function(content, callback, errorCallback) {
  // Despite what the documentation says, the content PUT to an edit-media URL
  // appears to require being formatted as a multipart message.
  var payload = '--END_OF_PART\r\n' +
  'Content-Type: application/atom+xml;\r\n\r\n' +
  "<?xml version='1.0' encoding='UTF-8'?>" +
  '<entry xmlns="http://www.w3.org/2005/Atom">' +
  '<category scheme="http://schemas.google.com/g/2005#kind"' +
  ' term="http://schemas.google.com/docs/2007#' + gdata.docs.DocumentType.DOCUMENT + '"' +
  ' label="' + gdata.docs.DocumentType.DOCUMENT + '"/>' +
  '<title>' + goog.string.htmlEscape(this.getTitle()) + '</title>' +
  '</entry>' + '\r\n' +
  '--END_OF_PART\r\n' +
  'Content-Type: text/html\r\n\r\n' +
  content + '\r\n' +
  '--END_OF_PART--\r\n';  

  var editMediaUrl = this.getLink_('edit-media');
  this.user_.doMultipartPut(editMediaUrl, payload, callback, function(xhr) {
    var msg = 'ERROR: (' + xhr.status + ') ' + xhr.responseText;
    errorCallback(msg);
  });
};

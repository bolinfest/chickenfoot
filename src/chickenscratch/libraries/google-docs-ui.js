/**
 * @fileoverview UI components for use with the google-docs.js library.
 * Includes a DocPicker (for selecting a document from a user's account) and a
 * DocViewer (for displaying a selected document).
 */
include('closure-lite.js');
include('google-docs.js');

goog.provide('gdata.docs.ui');
goog.provide('gdata.docs.ui.DocPicker');
goog.provide('gdata.docs.ui.DocViewer');
goog.provide('gdata.docs.ui.DocViewer.EventType');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.string');


/**
 * As of Firefox 3.0.16 or so, assigning a property to window.wrappedJSObject
 * whose value is a function results in the following Error being thrown:
 * 
 * TypeError: (void 0) is not a constructor
 * 
 * Curiously, the assignment succeeds, but the throwing of the Error halts
 * execution. This function wraps the assignment in a try/catch block to work
 * around this issue.
 * @param {!Window} win
 * @param {string} name
 * @param {Function} trustedFunction
 */
gdata.docs.ui.exportFunction = function(win, name, trustedFunction) {
  try {
    win[name] = trustedFunction;
  } catch (e) {
    // OK
  }
};


/**
 * @param {Element} pickerEl Element into which the picker should be drawn.
 * @param {gdata.docs.ui.DocViewer} viewer If specified, the viewer into which the document
 *     that is picked will be displayed. If null, picked documents will open in
 *     a new window.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
gdata.docs.ui.DocPicker = function(pickerEl, viewer) {
  goog.events.EventTarget.call(this);

  this.pickerEl_ = pickerEl;
  this.viewer_ = viewer;
  this.urlToEntryMap_ = {};
  this.handler_ = new goog.events.EventHandler(this);

  var doc = goog.dom.getOwnerDocument(pickerEl);
  var win = goog.dom.getWindow(doc);
  
  // Installing privileged JS into the page, so wrappedJSObject must be used.
  win = win.wrappedJSObject;
  gdata.docs.ui.exportFunction(win, 'pickerInsertHtml', gdata.docs.ui.insertHtml);
  gdata.docs.ui.exportFunction(win, 'pickerOnFrameLoad', gdata.docs.ui.onFrameLoad);
  
  var id = gdata.docs.ui.pickerCounter_++;
  gdata.docs.ui.pickerMap_[id] = this;
  pickerEl.innerHTML = '<iframe src="javascript:parent.pickerInsertHtml(' + id +
      ')" frameborder="0" marginheight="0" marginwidth="0"></iframe>';
};
goog.inherits(gdata.docs.ui.DocPicker, goog.events.EventTarget);


/**
 * @type {number}
 */
gdata.docs.ui.pickerCounter_ = 0;


/**
 * @type {Object}
 */
gdata.docs.ui.pickerMap_ = {};


/**
 * @type {goog.dom.DomHelper}
 */
gdata.docs.ui.DocPicker.prototype.pickerDom_;


/** @return {goog.dom.DomHelper} */
gdata.docs.ui.DocPicker.prototype.getPickerDom = function() {
  return this.pickerDom_;
};


/** @return {boolean} */
gdata.docs.ui.DocPicker.prototype.hasViewer = function() {
  return this.viewer_ != null;
};


/** @return {gdata.docs.ui.DocViewer} */
gdata.docs.ui.DocPicker.prototype.getViewer = function() {
  return this.viewer_;
};


/**
 * @param {number} id
 */
gdata.docs.ui.insertHtml = function(id) {
  return '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" ' +
  '"http://www.w3.org/TR/html4/strict.dtd">' +
  '<html>' +
  '<head>' +
  '<style>' +
    'body {font-family: Arial; font-size: 13px}' +
    '.doclistentry {color: blue; text-decoration: underline; cursor: pointer}' +
  '</style>' +
  '</head>' +
  '<body onload="parent.pickerOnFrameLoad(' + id + ',this)">' +
  '<div id="content">' +
    '<form id="login">' +
      'Username: <input id="username" value=""><br>' +
      'Password: <input id="password" type="PASSWORD"><br>' +
      '<input type="SUBMIT" value="Sign in">' +
    '</form>' +
  '</div>' +
  '</body>' +
  '</html>';
};


/**
 * @param {number} id
 * @param {Element} bodyEl
 */
gdata.docs.ui.onFrameLoad = function(id, bodyEl) {
  var p = gdata.docs.ui.pickerMap_[id];
  var doc = goog.dom.getOwnerDocument(bodyEl);
  p.pickerDom_ = new goog.dom.DomHelper(doc);
  var loginForm = p.getPickerDom().$('login');
  loginForm.onsubmit = function() {
    try {
      p.processLogin();
    } catch (e) {
      output(e);
    }
    // Always return false to prevent the onsubmit from proceeding.
    return false;
  };
};


/** Processes the login form associated with this picker. */
gdata.docs.ui.DocPicker.prototype.processLogin = function() {
  var domHelper = this.getPickerDom();
  var username = domHelper.$('username').value;
  if (username.indexOf('@') < 0) {
    username += '@gmail.com';
  }
  var password = domHelper.$('password').value;
  var user = new gdata.auth.User(username);
  if (password) {
    try {
      user.login(password, [gdata.auth.ServiceName.DOCUMENTS_LIST,
                            gdata.auth.ServiceName.SPREADSHEETS]);
    } catch (e) {
      // Ignore error here; user will be notified that login failed.
    }
  }
  if (user.isAuthenticated(gdata.auth.ServiceName.DOCUMENTS_LIST)) {
    this.displayDocumentsForUser(user);
  } else {
    this.notifyLoginFailed();    
  }
};


gdata.docs.ui.DocPicker.prototype.notifyLoginFailed = function() {
  // TODO(mbolin): Implement.
};


/**
 * Lists the word-processing documents for the specified user.
 * @param {gdata.auth.User} user
 */
gdata.docs.ui.DocPicker.prototype.displayDocumentsForUser = function(user) {
  var domHelper = this.getPickerDom();

  // Hide login form.
  domHelper.$('login').style.display = 'none';

  var content = domHelper.$('content');
  content.innerHTML = '<div id="status">Logged in as <b>' +
      goog.string.htmlEscape(user.getEmail()) + '</b></div>' +
      '<div id="doclist"></div>';
  var doclist = new gdata.docs.DocumentListFeed(user);
  // TODO(mbolin): Display "Loading..." while docs are being fetched.
  var self = this;
  doclist.fetchDocuments(function(entries) {
    var html = [];
    for (var i = 0; i < entries.length; ++i) {
      var entry = entries[i];
      if (!entry.isDocument()) {
        continue;
      }
      var url = entry.getUrl();
      if (self.hasViewer()) {
        html.push('<span id="' + url + '" class="doclistentry">' +
            goog.string.htmlEscape(entry.getTitle()) + '</span><br>');
      } else {
        html.push('<a href="' + url + '" target="_blank">' +
            goog.string.htmlEscape(entry.getTitle()) + '</a><br>');
      }
      self.urlToEntryMap_[url] = entry;
    }
    var doclistEl = domHelper.$('doclist');
    doclistEl.innerHTML = html.join('');
    if (self.hasViewer()) {
      self.handler_.listen(doclistEl, goog.events.EventType.CLICK, self.handleClick_);
    }
  }, output);
};


/**
 * A function that takes a click event on an element
 * in the doclist, finds the corresponding DocumentListEntry, and requests
 * the document's content for display in this picker's viewer.
 * @param {goog.events.Event} e A click event.
 * @private
 */
gdata.docs.ui.DocPicker.prototype.handleClick_ = function(e) {
  var entry = this.urlToEntryMap_[e.target.id];
  this.getViewer().display(entry);
};


/** @inheritDoc */
gdata.docs.ui.DocPicker.prototype.disposeInternal = function() {
  gdata.docs.ui.DocPicker.superClass_.disposeInternal.call(this);
  this.handler_.dispose();
};



/**
 * @param {Element} viewerEl Element into which the viewer should be drawn.
 * @param {Object=} options May have the following keys:
 *     <li> {boolean} stripHeadHtml If specified, the contents of the &lt;head>
 *         element added by Google Docs will be stripped from the HTML inserted
 *         into the viewer.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
gdata.docs.ui.DocViewer = function(viewerEl, options) {
  goog.events.EventTarget.call(this);
  options = options || {};

  /**
   * @type {boolean}
   * @private
   */
  this.stripHeadHtml_ = !!options.stripHeadHtml;

  /**
   * @type {Element}
   * @private
   */
  this.viewerEl_ = viewerEl;

  var doc = goog.dom.getOwnerDocument(viewerEl);
  var win = goog.dom.getWindow(doc);
  win = win.wrappedJSObject;

  // This function is exported so that the IFRAME created by display() can call
  // it via its src attribute.
  gdata.docs.ui.exportFunction(win, 'viewerDisplayHtml', function(id) {
    var html = gdata.docs.ui.DocViewer.viewMap_[id];
    delete gdata.docs.ui.DocViewer.viewMap_[id];
    return html;
  });

  // This function is exported so that the IFRAME created by display() can call
  // it via its onload attribute.
  gdata.docs.ui.exportFunction(win, 'viewerIsLoaded', function(id, iframeEl) {
    var viewer = gdata.docs.ui.DocViewer.loadMap_[id];
    delete gdata.docs.ui.DocViewer.loadMap_[id];
    if (viewer.postLoadProcessor_) {
      var doc = goog.dom.getFrameContentDocument(iframeEl);
      viewer.postLoadProcessor_(doc.wrappedJSObject);
    }

    // Notify listeners that the document has been loaded.
    var docLoadedEvent = new goog.events.Event(
        gdata.docs.ui.DocViewer.EventType.DOCUMENT_LOADED, viewer);
    viewer.dispatchEvent(docLoadedEvent);
  });
};
goog.inherits(gdata.docs.ui.DocViewer, goog.events.EventTarget);


/**
 * @type {number}
 * @private
 */
gdata.docs.ui.DocViewer.viewCount_ = 0;


/**
 * Maps an id to a string of HTML.
 * @type {Object}
 * @private
 */
gdata.docs.ui.DocViewer.viewMap_ = {};


/**
 * Maps an id to a DocViewer.
 * @type {Object}
 * @private
 */
gdata.docs.ui.DocViewer.loadMap_ = {};


/**
 * @type {gdata.docs.DocumentListEntry}
 * @private
 */
gdata.docs.ui.DocViewer.prototype.currentEntry_;


/**
 * @type {function(Document)?}
 * @private
 */
gdata.docs.ui.DocViewer.prototype.postLoadProcessor_;


/**
 * @type {function(string, Document):string}
 * @private
 */
gdata.docs.ui.DocViewer.prototype.preSaveProcessor_;


/**
 * If set, this function will be applied to the Document in the viewer after the
 * HTML as been loaded.
 * @param {function(Document)?) processor
 */
gdata.docs.ui.DocViewer.prototype.setPostLoadProcessor = function(processor) {
  this.postLoadProcessor_ = processor;
};


/**
 * Creates a fresh IFRAME and writes the HTML into it verbatim. The HTML may
 * start with a &lt;DOCTYPE> element, which is convenient as the doctype cannot
 * be changed programmatically once a web page is loaded.
 * 
 * @param {gdata.docs.DocumentListEntry} entry
 */
gdata.docs.ui.DocViewer.prototype.display = function(entry) {
  entry.getContentAsHtml(this.createContentHandler_(entry), output);
};


/**
 * @param {gdata.docs.DocumentListEntry} entry
 * @return {function(string)} a function that takes a string of HTML and
 *     displays it in this picker's viewer.
 */
gdata.docs.ui.DocViewer.prototype.createContentHandler_ = function(entry) {
  var self = this;
  return function(html) {
    self.insertHtml_(html, entry);
  };
};


/**
 * Creates a fresh IFRAME and writes the HTML into it verbatim. The HTML may
 * start with a &lt;DOCTYPE> element, which is convenient as the doctype cannot
 * be changed programmatically once a web page is loaded.
 * @param {string} html The HTML to display.
 * @param {gdata.docs.DocumentListEntry} entry The entry associated with the
 *     HTML content.
 * @private
 */
gdata.docs.ui.DocViewer.prototype.insertHtml_ = function(html, entry) {
  this.currentEntry_ = entry;
  var id = gdata.docs.ui.DocViewer.viewCount_++;

  if (this.stripHeadHtml_) {
    // The HTML sent down from Google Docs should be well-formed, but it
    // contains style, script, and meta tags in the HEAD element that may be
    // undesirable. This regex is used to get only the content within the body
    // tag (it ignores the attributes of the body tag itself as it contains
    // an onload handler that calls a script defined in the HEAD element).
    //
    // The [\s\S] trick comes from http://xregexp.com/flags/#singleline
    // to get around the fact that the dot does not match all characters in
    // JavaScript.
    var re = /<body[^>]+>([\s\S]*)<\/body>/m;
    var match = html.match(re);
    if (match) {
      html = '<html><body>' + match[1] + '</body></html>';
    }
  }
  gdata.docs.ui.DocViewer.viewMap_[id] = html;
  gdata.docs.ui.DocViewer.loadMap_[id] = this;

  // Note that height:100% will not have the desired effect in standards mode
  // pages but will in quirksmode pages.
  this.viewerEl_.innerHTML =
      '<iframe src="javascript:parent.viewerDisplayHtml(' + id + ')" ' +
      'frameborder="0" marginheight="0" marginwidth="0" ' +
      'onload="parent.viewerIsLoaded(' + id + ', this)" ' +
      'style="height: 100%; width: 100%"></iframe>';
};


/**
 * Returns the entry currently being displayed, if any.
 * @return {gdata.docs.DocumentListEntry?}
 */
gdata.docs.ui.DocViewer.prototype.getEntry = function() {
  return this.currentEntry_;
};


/**
 * @param {function(string, Document):string}
 */
gdata.docs.ui.DocViewer.prototype.setPreSaveProcessor = function(processor) {
  this.preSaveProcessor_ = processor;
};


/**
 * @param {function(string)} callback That receives the response from the
 *     server, if successful.
 * @param {function(string)} errorCallback
 */
gdata.docs.ui.DocViewer.prototype.save = function(callback, errorCallback) {
  var iframeEl = this.viewerEl_.firstChild;
  var doc = goog.dom.getFrameContentDocument(iframeEl);
  var content = doc.body.innerHTML;
  if (this.preSaveProcessor_) {
    content = this.preSaveProcessor_(content, doc);
  }
  this.getEntry().update(content, callback, errorCallback);
};


/**
 * @enum {string}
 */
gdata.docs.ui.DocViewer.EventType = {
  DOCUMENT_LOADED: 'doc-viewer-document-loaded'
};

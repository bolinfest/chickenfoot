/*
 * Tab object, representing a browser tab.
 * This object delegates most of its properties and methods to
 * the Window object inside it, but also provides Chickenfoot commands
 * like click, enter, and find.  Returned by tab, fetch(), and openTab().
 */
function Tab(/*HtmlWindow*/ win, 
             /*optional TabBrowser*/ tabBrowser, 
             /*optional XulTab*/ tab) {
  this._window = win;
  this._tabBrowser = tabBrowser;
  this._tab = tab;
}


Tab.prototype.toString = function() { 
  return "[object Tab]"; 
};

Tab.prototype.__defineGetter__("document", function() { 
  return getLoadedHtmlDocument(this._tab.ownerDocument.defaultView, this._window);
});

Tab.prototype.show = function() {
  if (!this._tab) {
    this._tab = getTab(this._window);
    this._tabBrowser = this._tab.parentNode.parentNode.parentNode.parentNode;
  }

  this._tab.setAttribute("collapsed", "false");
  this._tabBrowser.selectedTab = this._tab;
};

Tab.prototype.__defineGetter__("window", function getWindow() { return this._window; });
Tab.prototype.go = function go(url, reload) { goImpl(this._window, url, reload); }
Tab.prototype.reload = function reload() { this._window.location.reload(); };
Tab.prototype.find = function find(pattern) { return Pattern.find(this.document, pattern); }
Tab.prototype.click = function click(pattern) { clickImpl(this.document, pattern); }
Tab.prototype.enter = function enter(pattern,value) { enterImpl(this.document, pattern,value); }
Tab.prototype.reset = function reset(pattern) { resetImpl(this.document, pattern); }
Tab.prototype.pick = function pick(listPattern, choicePattern, checked) { pickImpl(this.document, arguments); }
Tab.prototype.keypress = function keypress(keySequence, destination) { keypressImpl(this.document, keySequence, destination); }
Tab.prototype.unpick = function unpick(listPattern,choicePattern, checked) { unpickImpl(this.document, arguments); }
Tab.prototype.check = function check(pattern) { checkImpl(this.document, pattern); }
Tab.prototype.uncheck = function uncheck(pattern) { uncheckImpl(this.document, pattern); }
Tab.prototype.insert = function insert(pattern,chunk) { return insertImpl(this.document, pattern,chunk); }
Tab.prototype.remove = function remove(pattern) { return removeImpl(this.document, pattern); }
Tab.prototype.replace = function replace(pattern,chunk) { return replaceImpl(this.document, pattern,chunk); }
Tab.prototype.before = function before(pattern) { return beforeImpl(this.document, pattern); }
Tab.prototype.after = function after(pattern) { return afterImpl(this.document, pattern); }
Tab.prototype.onClick = function onClick(pattern,handler) { return onClickImpl(this.document, pattern,handler); }
Tab.prototype.onKeypress = function onKeypress(pattern,handler, destination) { return onKeypressImpl(this.document, pattern,handler, destination); }
//Tab.prototype.savePage = function savePage(saveLocationOrName) { return savePageImpl(this.document, saveLocationOrName); };
//Tab.prototype.savePageComplete = function savePageComplete(saveLocationOrName) { return savePageCompleteImpl(this.document, saveLocationOrName); };
//Tab.prototype.printPage = function printPage(printerName) { return printPageImpl(printerName); };

/*
 * Delegators for Window properties. 
 * FIX: this is unmaintainable; can easily drift from Firefox's Window
 * interface.  Instead, figure out at runtime what
 * properties Windows have, and forward them automatically.
 */

// methods of window
Tab.prototype.addEventListener = function() { return this._window.addEventListener.apply(this._window, arguments); }
Tab.prototype.alert = function() { return this._window.alert.apply(this._window, arguments); }
Tab.prototype.atob = function() { return this._window.atob.apply(this._window, arguments); }
Tab.prototype.back = function() { return this._window.back.apply(this._window, arguments); }
Tab.prototype.blur = function() { return this._window.blur.apply(this._window, arguments); }
Tab.prototype.btoa = function() { return this._window.btoa.apply(this._window, arguments); }
Tab.prototype.captureEvents = function() { return this._window.captureEvents.apply(this._window, arguments); }
Tab.prototype.clearInterval = function() { return this._window.clearInterval.apply(this._window, arguments); }
Tab.prototype.clearTimeout = function() { return this._window.clearTimeout.apply(this._window, arguments); }
Tab.prototype.close = function() { return this._window.close.apply(this._window, arguments); }
Tab.prototype.confirm = function() { return this._window.confirm.apply(this._window, arguments); }
Tab.prototype.disableExternalCapture = function() { return this._window.disableExternalCapture.apply(this._window, arguments); }
Tab.prototype.dispatchEvent = function() { return this._window.dispatchEvent.apply(this._window, arguments); }
Tab.prototype.dump = function() { return this._window.dump.apply(this._window, arguments); }
Tab.prototype.enableExternalCapture = function() { return this._window.enableExternalCapture.apply(this._window, arguments); }
Tab.prototype.focus = function() { return this._window.focus.apply(this._window, arguments); }
Tab.prototype.forward = function() { return this._window.forward.apply(this._window, arguments); }
Tab.prototype.getComputedStyle = function() { return this._window.getComputedStyle.apply(this._window, arguments); }
Tab.prototype.getSelection = function() { return this._window.getSelection.apply(this._window, arguments); }
Tab.prototype.history = function() { return this._window.history.apply(this._window, arguments); }
Tab.prototype.home = function() { return this._window.home.apply(this._window, arguments); }
Tab.prototype.moveBy = function() { return this._window.moveBy.apply(this._window, arguments); }
Tab.prototype.moveTo = function() { return this._window.moveTo.apply(this._window, arguments); }
Tab.prototype.open = function() { return this._window.open.apply(this._window, arguments); }
Tab.prototype.openDialog = function() { return this._window.openDialog.apply(this._window, arguments); }
Tab.prototype.print = function() { return this._window.print.apply(this._window, arguments); }
Tab.prototype.prompt = function() { return this._window.prompt.apply(this._window, arguments); }
Tab.prototype.releaseEvents = function() { return this._window.releaseEvents.apply(this._window, arguments); }
Tab.prototype.removeEventListener = function() { return this._window.removeEventListener.apply(this._window, arguments); }
Tab.prototype.resizeBy = function() { return this._window.resizeBy.apply(this._window, arguments); }
Tab.prototype.resizeTo = function() { return this._window.resizeTo.apply(this._window, arguments); }
Tab.prototype.routeEvent = function() { return this._window.routeEvent.apply(this._window, arguments); }
Tab.prototype.scroll = function() { return this._window.scroll.apply(this._window, arguments); }
Tab.prototype.scrollBy = function() { return this._window.scrollBy.apply(this._window, arguments); }
Tab.prototype.scrollByLines = function() { return this._window.scrollByLines.apply(this._window, arguments); }
Tab.prototype.scrollByPages = function() { return this._window.scrollByPages.apply(this._window, arguments); }
Tab.prototype.scrollMaxX = function() { return this._window.scrollMaxX.apply(this._window, arguments); }
Tab.prototype.scrollMaxY = function() { return this._window.scrollMaxY.apply(this._window, arguments); }
Tab.prototype.scrollTo = function() { return this._window.scrollTo.apply(this._window, arguments); }
Tab.prototype.setInterval = function() { return this._window.setInterval.apply(this._window, arguments); }
Tab.prototype.setResizable = function() { return this._window.setResizable.apply(this._window, arguments); }
Tab.prototype.setTimeout = function() { return this._window.setTimeout.apply(this._window, arguments); }
Tab.prototype.sizeToContent = function() { return this._window.sizeToContent.apply(this._window, arguments); }
Tab.prototype.stop = function() { return this._window.stop.apply(this._window, arguments); }
Tab.prototype.updateCommands = function() { return this._window.updateCommands.apply(this._window, arguments); }

// properties of window
Tab.prototype.__defineGetter__("closed", function() { return this._window.closed; });
Tab.prototype.__defineGetter__("constructor", function() { return this._window.constructor; });
Tab.prototype.__defineGetter__("content", function() { return this._window.content; });
Tab.prototype.__defineGetter__("controllers", function() { return this._window.controllers; });
Tab.prototype.__defineGetter__("crypto", function() { return this._window.crypto; });
Tab.prototype.__defineGetter__("defaultStatus", function() { return this._window.defaultStatus; });
Tab.prototype.__defineGetter__("directories", function() { return this._window.directories; });
Tab.prototype.__defineGetter__("frameElement", function() { return this._window.frameElement; });
Tab.prototype.__defineGetter__("frames", function() { return this._window.frames; });
Tab.prototype.__defineGetter__("fullScreen", function() { return this._window.fullScreen; });
Tab.prototype.__defineGetter__("innerHeight", function() { return this._window.innerHeight; });
Tab.prototype.__defineGetter__("innerWidth", function() { return this._window.innerWidth; });
Tab.prototype.__defineGetter__("length", function() { return this._window.length; });
Tab.prototype.__defineGetter__("locationbar", function() { return this._window.locationbar; });
Tab.prototype.__defineGetter__("menubar", function() { return this._window.menubar; });
Tab.prototype.__defineGetter__("name", function() { return this._window.name; });
Tab.prototype.__defineGetter__("navigator", function() { return this._window.navigator; });
Tab.prototype.__defineGetter__("opener", function() { return this._window.opener; });
Tab.prototype.__defineGetter__("outerHeight", function() { return this._window.outerHeight; });
Tab.prototype.__defineGetter__("outerWidth", function() { return this._window.outerWidth; });
Tab.prototype.__defineGetter__("pageXOffset", function() { return this._window.pageXOffset; });
Tab.prototype.__defineGetter__("pageYOffset", function() { return this._window.pageYOffset; });
Tab.prototype.__defineGetter__("parent", function() { return this._window.parent; });
Tab.prototype.__defineGetter__("personalbar", function() { return this._window.personalbar; });
Tab.prototype.__defineGetter__("pkcs11", function() { return this._window.pkcs11; });
Tab.prototype.__defineGetter__("screen", function() { return this._window.screen; });
Tab.prototype.__defineGetter__("screenX", function() { return this._window.screenX; });
Tab.prototype.__defineGetter__("screenY", function() { return this._window.screenY; });
Tab.prototype.__defineGetter__("scrollbars", function() { return this._window.scrollbars; });
Tab.prototype.__defineGetter__("scrollX", function() { return this._window.scrollX; });
Tab.prototype.__defineGetter__("scrollY", function() { return this._window.scrollY; });
Tab.prototype.__defineGetter__("self", function() { return this._window.self; });
Tab.prototype.__defineGetter__("status", function() { return this._window.status; });
Tab.prototype.__defineGetter__("statusbar", function() { return this._window.statusbar; });
Tab.prototype.__defineGetter__("toolbar", function() { return this._window.toolbar; });
Tab.prototype.__defineGetter__("top", function() { return this._window.top; });
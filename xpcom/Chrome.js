/*
 * Chrome object, representing a firefox/chrome window.
 * This object delegates most of its properties and methods to
 * the Window object inside it, but also provides Chickenfoot commands
 * like click, enter, and find.  Returned by Chrome().
 */
function Chrome(/*chromeWindow*/ cwin) {
this._window=cwin;
}


Chrome.prototype.toString = function() { 
  return "[object Chrome]"; 
};

Chrome.prototype.document getter = function() { 
  return this._window.document; }
  
Chrome.prototype.window getter = function getWindow() { return this._window; }
Chrome.prototype.go = function go(url, reload) { goImpl(this._window, url, reload); }
Chrome.prototype.reload = function reload() { this._window.location.reload(); };
Chrome.prototype.find = function find(pattern) { return Pattern.find(this.document, pattern); }
Chrome.prototype.click = function click(pattern) { clickImpl(this.document, pattern); }
Chrome.prototype.keypress = function keypress(keySequence, destination) { keypressImpl(this.document, keySequence, destination); }
Chrome.prototype.enter = function enter(pattern,value) { enterImpl(this.document, pattern,value); }
Chrome.prototype.reset = function reset(pattern) { resetImpl(this.document, pattern); }
Chrome.prototype.pick = function pick(listPattern, choicePattern, checked) { pickImpl(this.document, arguments); }
Chrome.prototype.unpick = function unpick(listPattern,choicePattern, checked) { unpickImpl(this.document, arguments); }
Chrome.prototype.check = function check(pattern) { checkImpl(this.document, pattern); }
Chrome.prototype.uncheck = function uncheck(pattern) { uncheckImpl(this.document, pattern); }
Chrome.prototype.insert = function insert(pattern,chunk) { return insertImpl(this.document, pattern,chunk); }
Chrome.prototype.remove = function remove(pattern) { return removeImpl(this.document, pattern); }
Chrome.prototype.replace = function replace(pattern,chunk) { return replaceImpl(this.document, pattern,chunk); }
Chrome.prototype.before = function before(pattern) { return beforeImpl(this.document, pattern); }
Chrome.prototype.after = function after(pattern) { return afterImpl(this.document, pattern); }
Chrome.prototype.onClick = function onClick(pattern,handler) { return onClickImpl(this.document, pattern,handler); }
Chrome.prototype.onKeypress = function onKeypress(pattern,handler,destination) { return onKeypressImpl(this.document, pattern, handler, destination); }

/*
 * Delegators for Window properties. 
 * FIX: this is unmaintainable; can easily drift from Firefox's Window
 * interface.  Instead, figure out at runtime what
 * properties Windows have, and forward them automatically.
 */

// methods of window
Chrome.prototype.addEventListener = function() { return this._window.addEventListener.apply(this._window, arguments); }
Chrome.prototype.alert = function() { return this._window.alert.apply(this._window, arguments); }
Chrome.prototype.atob = function() { return this._window.atob.apply(this._window, arguments); }
Chrome.prototype.back = function() { return this._window.back.apply(this._window, arguments); }
Chrome.prototype.blur = function() { return this._window.blur.apply(this._window, arguments); }
Chrome.prototype.btoa = function() { return this._window.btoa.apply(this._window, arguments); }
Chrome.prototype.captureEvents = function() { return this._window.captureEvents.apply(this._window, arguments); }
Chrome.prototype.clearInterval = function() { return this._window.clearInterval.apply(this._window, arguments); }
Chrome.prototype.clearTimeout = function() { return this._window.clearTimeout.apply(this._window, arguments); }
Chrome.prototype.close = function() { return this._window.close.apply(this._window, arguments); }
Chrome.prototype.confirm = function() { return this._window.confirm.apply(this._window, arguments); }
Chrome.prototype.disableExternalCapture = function() { return this._window.disableExternalCapture.apply(this._window, arguments); }
Chrome.prototype.dispatchEvent = function() { return this._window.dispatchEvent.apply(this._window, arguments); }
Chrome.prototype.dump = function() { return this._window.dump.apply(this._window, arguments); }
Chrome.prototype.enableExternalCapture = function() { return this._window.enableExternalCapture.apply(this._window, arguments); }
Chrome.prototype.focus = function() { return this._window.focus.apply(this._window, arguments); }
Chrome.prototype.forward = function() { return this._window.forward.apply(this._window, arguments); }
Chrome.prototype.getComputedStyle = function() { return this._window.getComputedStyle.apply(this._window, arguments); }
Chrome.prototype.getSelection = function() { return this._window.getSelection.apply(this._window, arguments); }
Chrome.prototype.history = function() { return this._window.history.apply(this._window, arguments); }
Chrome.prototype.home = function() { return this._window.home.apply(this._window, arguments); }
Chrome.prototype.moveBy = function() { return this._window.moveBy.apply(this._window, arguments); }
Chrome.prototype.moveTo = function() { return this._window.moveTo.apply(this._window, arguments); }
Chrome.prototype.open = function() { return this._window.open.apply(this._window, arguments); }
Chrome.prototype.openDialog = function() { return this._window.openDialog.apply(this._window, arguments); }
Chrome.prototype.print = function() { return this._window.print.apply(this._window, arguments); }
Chrome.prototype.prompt = function() { return this._window.prompt.apply(this._window, arguments); }
Chrome.prototype.releaseEvents = function() { return this._window.releaseEvents.apply(this._window, arguments); }
Chrome.prototype.removeEventListener = function() { return this._window.removeEventListener.apply(this._window, arguments); }
Chrome.prototype.resizeBy = function() { return this._window.resizeBy.apply(this._window, arguments); }
Chrome.prototype.resizeTo = function() { return this._window.resizeTo.apply(this._window, arguments); }
Chrome.prototype.routeEvent = function() { return this._window.routeEvent.apply(this._window, arguments); }
Chrome.prototype.scroll = function() { return this._window.scroll.apply(this._window, arguments); }
Chrome.prototype.scrollBy = function() { return this._window.scrollBy.apply(this._window, arguments); }
Chrome.prototype.scrollByLines = function() { return this._window.scrollByLines.apply(this._window, arguments); }
Chrome.prototype.scrollByPages = function() { return this._window.scrollByPages.apply(this._window, arguments); }
Chrome.prototype.scrollMaxX = function() { return this._window.scrollMaxX.apply(this._window, arguments); }
Chrome.prototype.scrollMaxY = function() { return this._window.scrollMaxY.apply(this._window, arguments); }
Chrome.prototype.scrollTo = function() { return this._window.scrollTo.apply(this._window, arguments); }
Chrome.prototype.setInterval = function() { return this._window.setInterval.apply(this._window, arguments); }
Chrome.prototype.setResizable = function() { return this._window.setResizable.apply(this._window, arguments); }
Chrome.prototype.setTimeout = function() { return this._window.setTimeout.apply(this._window, arguments); }
Chrome.prototype.sizeToContent = function() { return this._window.sizeToContent.apply(this._window, arguments); }
Chrome.prototype.stop = function() { return this._window.stop.apply(this._window, arguments); }
Chrome.prototype.title = function() {return this._window.title;}
Chrome.prototype.updateCommands = function() { return this._window.updateCommands.apply(this._window, arguments); }

// properties of window
Chrome.prototype.closed getter = function() { return this._window.closed; }
Chrome.prototype.constructor getter = function() { return this._window.constructor; }
Chrome.prototype.content getter = function() { return this._window.content; }
Chrome.prototype.controllers getter = function() { return this._window.controllers; }
Chrome.prototype.crypto getter = function() { return this._window.crypto; }
Chrome.prototype.defaultStatus getter = function() { return this._window.defaultStatus; }
Chrome.prototype.directories getter = function() { return this._window.directories; }
Chrome.prototype.frameElement getter = function() { return this._window.frameElement; }
Chrome.prototype.frames getter = function() { return this._window.frames; }
Chrome.prototype.fullScreen getter = function() { return this._window.fullScreen; }
Chrome.prototype.innerHeight getter = function() { return this._window.innerHeight; }
Chrome.prototype.innerWidth getter = function() { return this._window.innerWidth; }
Chrome.prototype.length getter = function() { return this._window.length; }
Chrome.prototype.locationbar getter = function() { return this._window.locationbar; }
Chrome.prototype.menubar getter = function() { return this._window.menubar; }
Chrome.prototype.name getter = function() { return this._window.name; }
Chrome.prototype.navigator getter = function() { return this._window.navigator; }
Chrome.prototype.opener getter = function() { return this._window.opener; }
Chrome.prototype.outerHeight getter = function() { return this._window.outerHeight; }
Chrome.prototype.outerWidth getter = function() { return this._window.outerWidth; }
Chrome.prototype.pageXOffset getter = function() { return this._window.pageXOffset; }
Chrome.prototype.pageYOffset getter = function() { return this._window.pageYOffset; }
Chrome.prototype.parent getter = function() { return this._window.parent; }
Chrome.prototype.personalbar getter = function() { return this._window.personalbar; }
Chrome.prototype.pkcs11 getter = function() { return this._window.pkcs11; }
Chrome.prototype.screen getter = function() { return this._window.screen; }
Chrome.prototype.screenX getter = function() { return this._window.screenX; }
Chrome.prototype.screenY getter = function() { return this._window.screenY; }
Chrome.prototype.scrollbars getter = function() { return this._window.scrollbars; }
Chrome.prototype.scrollX getter = function() { return this._window.scrollX; }
Chrome.prototype.scrollY getter = function() { return this._window.scrollY; }
Chrome.prototype.self getter = function() { return this._window.self; }
Chrome.prototype.status getter = function() { return this._window.status; }
Chrome.prototype.statusbar getter = function() { return this._window.statusbar; }
Chrome.prototype.toolbar getter = function() { return this._window.toolbar; }
Chrome.prototype.top getter = function() { return this._window.top; }
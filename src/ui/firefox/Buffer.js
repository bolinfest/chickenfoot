<!--
/*
 * Chickenfoot end-user web automation system
 *
 * Copyright (c) 2004-2007 Massachusetts Institute of Technology
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Chickenfoot homepage: http://uid.csail.mit.edu/chickenfoot/
 */
-->

goog.provide('ckft.Buffer');

goog.require('goog.dom');
goog.require('goog.string');

var jsIcon = 'list-style-image: url(chrome://chickenfoot/skin/exec.png)'
var kwIcon = 'list-style-image: url(chrome://chickenfoot/skin/exec-blue.png)'
var useHtmlEditor = true;

// Progress listener
var causesLoad = false;

/**
 * ckft.Buffer represents an open script editor.
 * @param {function(ckft.Buffer)} callback that receives the constructed Buffer
 *     after it has been fully rendered with the content specified by the other
 *     constructor parameters.
 * @param {nsIFile=} file from which the content for the editor will be loaded.
 *     This is also the file that is written to when the user hits 'Save'.
 * @param {boolean=} dirty Whether the editor has unsaved data.
 * @param {string=} text The content for the editor. If this is specified, then
 *     file should be undefined. Defaults to the empty string if no file is
 *     specified.
 * @param {number=} cursorPosition The character offset from the start of the
 *     buffer where the cursor should be placed. Defaults to 0.
 * @constructor
 * @private
 */
ckft.Buffer = function(callback, file, dirty, text, cursorPosition) {
  var prefs = Chickenfoot.getPrefBranch();
  var useBespin;
  try {
    useBespin = prefs.getBoolPref('use-bespin');
  } catch (e) {
    useBespin = false;
  }
  this._useBespin = useBespin;

  this._file = file ? file : null;
  this._dirty = dirty;
  this._trigger = file ? Chickenfoot.gTriggerManager.getTriggerFromFile(file) : null;

  this._initialDirty = dirty;
  this._initialCursorPosition = cursorPosition;
  this._initialText = text;
  this._makeGuess = false;
  this._lastDirectory = Chickenfoot.gTriggerManager._getChickenfootProfileDirectory();
  this._lastDirectory.append(" ");

  /** @type {Element|HTMLIFrameElement} */
  var editor;

  // create the editor widget
  if (useBespin) {
    editor = sidebarDocument.createElement('iframe');
    editor.setAttribute("src",
        "chrome://chickenfoot/content/bespinEditorContent.html");
  } else if (useHtmlEditor) {
    editor = sidebarDocument.createElement('editor');
    editor.setAttribute("editortype", "html");
    editor.setAttribute("src", "chrome://chickenfoot/content/scriptEditorContent.html");
    editor.setAttribute("context", "editorContextMenu");
    //editor.setAttribute("type", "content-primary"); // enables editor to get focus when tab is clicked
  } else {
    // Plain text editor
    editor = sidebarDocument.createElement('textbox');
    editor.setAttribute("wrap", "false");
    editor.setAttribute("multiline", "true");
    editor.setAttribute("style", "font-size: 8pt; font-family: monospace;");

    this.__defineGetter__("text", function() { return this.editor.value; });
    this.__defineSetter__("text", function(newScript) { this.editor.value = newScript; });
    // onkeydown="processTab(event)"
    // oninput="processEditorInputChange(event)"
  }
  editor.setAttribute("flex", "10");

  // create the tab
  var tab = sidebarDocument.createElement("tab");
  tab.setAttribute("flex", "1");
  tab.setAttribute("crop", "right");
  
  // add the elements to the sidebar
  sidebarDocument.getElementById("editorTabs").appendChild(tab);
  sidebarDocument.getElementById("editorTabPanels").appendChild(editor);

  if (useBespin) {
    var win = goog.dom.getFrameContentWindow(editor);
    win.addEventListener('resize', goog.bind(this.onResize, this), false);
  }

  // enable toolbar buttons that require an editor
  sidebarDocument.getElementById("requiresSelectedEditor").setAttribute("disabled", false);

  this.tab = tab;
  this.editor = editor;
  editor.buffer = this;

  if (useHtmlEditor) {
    var editorWindow = editor.contentWindow;
    if (editorWindow) {
      editorWindow.addEventListener("load", goog.bind(this.startEditing, this),
          false);
    }
  }

  var self = this;

  // Only add listeners for non-Bespin editors.
  if (!useBespin) {
    editor.addEventListener("keypress", goog.bind(this._onKeyPress, this), true); 
    editor.addEventListener("keyup", syntaxColorEvent, true);

    editor.addEventListener("keyup", function(event) {
        if (event.ctrlKey && (event.keyCode == 13 /* for Win/Linux*/ ||
            event.keyCode == 77 /* for Mac OS */)) {
          self.runCurrentLine();
        }
    }, true);
  
    // This should only happen when I release enter and control is pressed.
  }

  var onEditorLoaded = function() {
    self.focus();
    //self.scrub();
    self.updateTabLabel();
    callback.call(null, self);
  };

  if (useBespin) {
    var pollUntilLoaded = function() {
      if (self.getBespinObject_()) {
        self.finishStartEditing();
        onEditorLoaded();
      } else {
        setTimeout(pollUntilLoaded, 100);
      }
    };
    pollUntilLoaded();
  } else {
    onEditorLoaded();
  }
};

/**
 * Creates a Buffer asynchronously, passing the newly created Buffer to the
 * callback once it is loaded.
 * 
 * @param {function(ckft.Buffer)} callback
 * @param {nsIFile=} file
 * @param {boolean=} dirty
 * @param {string=} text
 * @param {number=} cursorPosition
 */
ckft.Buffer.createBuffer = function(callback, file, dirty, text,
    cursorPosition) {
  new ckft.Buffer(callback, file, dirty, text, cursorPosition);
};

/** @return {boolean} */
ckft.Buffer.prototype.isBespinEditor = function() {
  return this._useBespin;
};

/** @return {boolean} if HTML editor and not Bespin editor */
ckft.Buffer.prototype.isHtmlEditor = function() {
  return useHtmlEditor && !this.isBespinEditor();
};

/**
 * @param {Event} event
 * @private
 */
ckft.Buffer.prototype._onKeyPress = function(event) {
  var alt = event.altKey;
  var ctrl = event.ctrlKey;
  var shift = event.shiftKey;
  var meta = event.metaKey;
  if (event.keyCode == 9 && !alt && !ctrl && !shift && !meta) {
    event.preventDefault();
    var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
    var anchorNodeCaret = sbwin.getSelectedBuffer().api.selection.anchorNode;
    var anchorOffsetCaret = sbwin.getSelectedBuffer().api.selection.anchorOffset;
    var focusNodeCaret = sbwin.getSelectedBuffer().api.selection.focusNode;
    var focusOffsetCaret = sbwin.getSelectedBuffer().api.selection.focusOffset;
    var ed = sbwin.getSelectedBuffer().editor;
    var doc = ed.contentDocument;
    var pre = doc.getElementById("pre"); 
    //debug(focusOffsetCaret);
    //debug(focusNodeCaret);


    //focusNodeCaret.parentNode.insertBefore(newTab, focusNodeCaret);

    if (anchorNodeCaret == focusNodeCaret && anchorOffsetCaret == focusOffsetCaret) {
      if (focusNodeCaret.nodeName == "#text") {
        var nodeText = focusNodeCaret.nodeValue;
        var len = focusNodeCaret.length;
        var sub1 = nodeText.substring(0,focusOffsetCaret);
        var sub2 = nodeText.substring(focusOffsetCaret, len);
        var newNode = sub1 + "  " + sub2;
        focusNodeCaret.nodeValue = newNode;
        var newCaretOffset = sub1.length + 2;
        // replace the caret
        var sel = sbwin.getSelectedBuffer().api.selection;
        sel.collapse(focusNodeCaret,newCaretOffset);
      } else if (focusNodeCaret.nodeName == "PRE") {
        var newTab = doc.createTextNode("  ");
        //debug(newTab);
        //debug(focusNodeCaret.childNodes[focusOffsetCaret]);
        focusNodeCaret.insertBefore(newTab, focusNodeCaret.childNodes[focusOffsetCaret]);
        var sel=sbwin.getSelectedBuffer().api.selection;
        sel.collapse(newTab, 2);
      } else {
        debug('Tab replace error.');
      }
    }
    /*
    else{
      selectionAutoIndent(event);
    }
    */
  }
};

/**
 * @return nsIFile or null if buffer not associated with a file
 */
ckft.Buffer.prototype.__defineGetter__("file", function() {
  return this._file;
});

ckft.Buffer.prototype.__defineSetter__("file", function(/*File*/ file) {
  this._file = file;
  this.updateTabLabel();
});

/**
 * @return nsIEditor editing interface
 */
ckft.Buffer.prototype.__defineGetter__("api", function() {
  return this.editor.getEditor(this.editor.contentWindow);
});

/**
 * @return boolean (true if buffer is dirty, false if not)
 */
ckft.Buffer.prototype.__defineGetter__("dirty", function() {
  return this._dirty && this._file != null;
});

ckft.Buffer.prototype.__defineSetter__("dirty", function(/*boolean*/ dirty) {
  this._dirty = dirty;
  if (!dirty && !this.isBespinEditor()) {
    this.api.resetModificationCount();
  }
  this.updateTabLabel();
});

/**
 * @return Trigger if buffer is associated with an installed trigger, null otherwise
 */
ckft.Buffer.prototype.__defineGetter__("trigger", function() {
  return this._trigger;
});

ckft.Buffer.prototype.__defineSetter__("trigger", function(/*Trigger*/ trigger) {
  this._trigger = trigger;
  if (trigger) {
    this.file = trigger.path;
  }
  this.updateTabLabel();
});

/**
 * @return String label describing this buffer
 */
ckft.Buffer.prototype.toString = function() {
  if (this.file != null) {
    var t = this.trigger;
    if (t != null) {
      return t.name;
    } else {
      return this.file.leafName;
    }
  } else {
    return "Untitled";
  }
};

/**
 * Updates buffer label.
 * @private
 */
ckft.Buffer.prototype.updateTabLabel = function() {
  var message = (this.dirty ? '*' : '') + this.toString();

  this.tab.label = message;
  if (this.trigger) {
    this.tab.setAttribute('image', 'chrome://chickenfoot/skin/trigger-tab.png');
  } else {
    this.tab.removeAttribute('image');
  }
};

ckft.Buffer.prototype.startEditing = function() {
  if (!this.isHtmlEditor()) {
    return;
  }
  var editor = this.editor;
  
  editor.contentWindow.setCursor('text');
  editor.makeEditable('html', false);
  
  var api = editor.getEditor(editor.contentWindow);

  // All the user's text must be in a <pre> element
  // to guarantee that all whitespace will be preserved.
  // (Adding the CSS style "whitespace:pre" to the <body> 
  // *almost* did this; unfortunately, it didn't preserve
  // indentation in text copied from the editor to other
  // applications.  Only the <pre> element does this, apparently.)
  //
  // The listeners below try to guarantee that the user's text
  // is always surrounded by a <pre> element, whose id is 'pre'
  // for ease of search.
  
  // install an edit listener that notices when the <pre> element
  // is deleted and recreates it.
  var editListener = new EditActionAdapter();
  editListener.DidDeleteNode = function(child, result) { 
    if (child.id == 'pre') {
      // find the body
      var doc = editor.contentDocument;
      var body = doc.getElementById('body');

      // create a new text node
      var text = doc.createTextNode("\n");

      // create a new PRE element and insert the new text into it
      pre = doc.createElement('PRE');
      pre.setAttribute('id', 'pre');
      pre.appendChild(text);
  
      // make the PRE element the only child of the body
      api.insertNode(pre, body, 0);            
      // move cursor to the start    
      api.beginningOfDocument();
    }
  };
  api.addEditActionListener(editListener);
  
  // install a selection listener that adjusts selections 
  // that would cover the <pre> element so that they're
  // just inside its start and end tag instead.
  var selPriv = api.selection;
  selPriv.QueryInterface(Components.interfaces.nsISelectionPrivate);
  var selectionListener = new SelectionAdapter();
  selectionListener.notifySelectionChanged = function(doc,sel,reason) {
    var pre = doc.getElementById("pre");
    if (sel.containsNode(pre, false)) {
      sel.removeAllRanges();
      var r = doc.createRange();
      r.selectNodeContents(pre);
      sel.addRange(r);
    }
  }
  selPriv.addSelectionListener(selectionListener);

  // install listeners that work around a bug in the context menu:
  // right-clicking on the right margin of the editor causes Select All.
  // That's bad.  So we save the selection on every mousedown, and
  // revert to the saved selection when the context menu appears.
  var oldSelection = null; // Range that was selected when mouse was pressed down
  editor.addEventListener('mousedown',   function() {
    oldSelection = api.selection.getRangeAt(0).cloneRange();
  }, true);
  editor.addEventListener('contextmenu', function() {
    api.selection.removeAllRanges();
    api.selection.addRange(oldSelection);
  }, true);

  // update buffer dirty flag when editor changes
  var documentListener = new DocumentStateAdapter();
  var thisBuffer = this;
  documentListener.NotifyDocumentStateChanged = function(nowDirty) {
    var content = editor.contentDocument.getElementById('body');
    var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (node.nodeType == Node.TEXT_NODE) {
        var noCarriage = node.nodeValue.replace(/\r/, "");
        node.nodeValue = noCarriage;
        // debug(node.nodeValue+"marker");
			
      }
    }
    if (nowDirty) {
      thisBuffer.dirty = true;
    }
  }
  api.addDocumentStateListener(documentListener);

  this.finishStartEditing();
};

ckft.Buffer.prototype.finishStartEditing = function() {
  // finish initialization of the constructor parameters
  if (this._initialText) {
    this.text = this._initialText;
  } else if (this.file) {
    this.text = Chickenfoot.SimpleIO.read(this.file);
  }

  if (this._initialCursorPosition !== undefined) {
    this.setCursorPosition(this._initialCursorPosition);
  }
  if (this._initialDirty) {
    this.dirty = true;
  }

  var self = this;
  this.editor.addEventListener("focus", function() { self.onFocus(); }, true);
};

/**
 * Base implementation of nsIDocumentStateListener in which
 * all methods do nothing.
 */
function DocumentStateAdapter() { }
DocumentStateAdapter.prototype = {
  QueryInterface : function(aIID) {
    if (aIID.equals(Components.interfaces.nsIDocumentStateListener) ||            
        aIID.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_NOINTERFACE;
  },
  NotifyDocumentCreated : function() {},
  NotifyDocumentStateChanged : function(nowDirty) {},
  NotifyDocumentWillBeDestroyed : function() {}
};

/**
 * Base implementation of nsIEditActionListener in which
 * all methods do nothing.
 */
function EditActionAdapter() { }
EditActionAdapter.prototype = {
  QueryInterface : function(aIID) {
    if (aIID.equals(Components.interfaces.nsIEditActionListener) ||            
        aIID.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_NOINTERFACE;
  },
  DidCreateNode : function(tag, node, parent, position, result) {},
  DidDeleteNode : function(child, result) {},
  DidDeleteSelection : function(selection) {},
  DidDeleteText : function(textNode, offset, length, result) {},
  DidInsertNode : function(node, parent, position, result) {},
  DidInsertText : function(textNode, offset, string, result) {},
  DidJoinNodes : function(leftNode, rightNode, parent, result) {},
  DidSplitNode : function(existingRightNode, offset, newLeftNode, result) {},
  WillCreateNode : function(tag, parent, position) {},
  WillDeleteNode : function(child) {},
  WillDeleteSelection : function(selection) {},
  WillDeleteText : function(textNode, offset, length) {},
  WillInsertNode : function(node, parent, position) {},
  WillInsertText : function(textNode, offset, string) { },
  WillJoinNodes : function(leftNode, rightNode, parent) {},
  WillSplitNode : function(existingRightNode, offset) {}
};

/**
 * Base implementation of nsISelectionListener in which
 * all methods do nothing.
 */
function SelectionAdapter() {}
SelectionAdapter.prototype = {
  QueryInterface : function(aIID) {
    if (aIID.equals(Components.interfaces.nsISelectionListener) ||
        aIID.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_NOINTERFACE;
  },
  notifySelectionChanged : function(doc, sel, reason) { }
};

  
  
/**
 * Update enabled/disabled status of every item in context menu.
 */
ckft.Buffer.prototype.updateContextMenu = function(/*XULNode*/ popup) {
  var editor = this.editor;
  var cmdmgr = editor.commandManager;

  for (var i = 0; i < popup.childNodes.length; ++i) {
    var item = popup.childNodes[i];
    var cmd = item.getAttribute("cmdid");
    if (cmd) {
      var enabled = cmdmgr.isCommandEnabled(cmd, editor.contentWindow);
      if ( enabled )
        item.removeAttribute("disabled");
      else
        item.setAttribute('disabled', 'true');
    }
  }
};

/**
 * @return {Object}
 * @private
 */
ckft.Buffer.prototype.getBespinObject_ = function() {
  try {
    return goog.dom.getFrameContentWindow(this.editor)._bespinEditorComponent;
  } catch (e) {
    return null;
  }
};

/**
 * Returns contents of script editor as a plaintext string.
 */
ckft.Buffer.prototype.__defineGetter__("text", function() {
  var editor = this.editor;

  if (this.isBespinEditor()) {
    return this.getBespinObject_().value;
  }
  
  var content = editor.contentDocument.getElementById('body');
  var walker = Chickenfoot.createTreeWalker(content,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  var sb = new Chickenfoot.StringBuffer();
  while (walker.nextNode()) {
    var node = walker.currentNode;
    if (node.nodeType == Node.TEXT_NODE) {
      sb.append(node.nodeValue);
    } else if (node.tagName == 'BR') {
      sb.append('\n');
    }
  }
  
  var text = sb.toString();
  
  text = ckft.Buffer.removeGarbageCharacter(text);
  return text;
});

/**
 * Replaces contents of script editor with a plaintext string.
 */
ckft.Buffer.prototype.__defineSetter__("text", function(/*String*/ newScript) {
  newScript = ckft.Buffer.removeGarbageCharacter(newScript);

  var editor = this.editor;
  if (this.isBespinEditor()) {
    this.getBespinObject_().value = newScript;
    return;
  }

  var api = editor.getEditor(editor.contentWindow);    
  
  
  // add terminating newline, if not already included
  if (newScript.length == 0 || newScript.charAt(newScript.length-1) != '\n') {
    newScript += '\n';
  }
  
  // open a transaction so that all of the below
  // operations are grouped into a single Undo
  api.beginTransaction();
  
  // find the PRE element that contains all the script text
  var doc = editor.contentDocument;
  var pre = doc.getElementById('pre');
  
  // delete all children of pre
  api.selection.selectAllChildren(pre);
  api.deleteSelection(0);

  // In FF4.01, when the pre node doesn't contain any other nodes,
  // the deleteSelection call seems to be deleting the pre node
  // itself.  Note that this is contrary to the documented
  // behavior!  Then the DidDeleteNode listener dutifully creates
  // a new pre node, but the code below still has a reference to
  // the deleted node.  This means that the insertNode call
  // doesn't do what we want.  To work around this, we'll update
  // the pre reference.

  pre = doc.getElementById('pre');
  // Create a single text node for the script and insert it 
  // as a child of pre.  The editor's editing rules will 
  // automatically handle splitting this monolithic node 
  // into one text node per line, with <BR> nodes after each.
  var text = doc.createTextNode(newScript);
  api.insertNode(text, pre, 0);
  //recolor it
  this.recolor();
  
  // move cursor to the start of <pre>
  var sel = api.selection;
  sel.selectAllChildren(pre);
  sel.collapseToStart();
  
  api.endTransaction();

  this.dirty = false;
  //debug(Chickenfoot.domToString(doc));
});

/**
 * Workaround for bug #290: script sometimes becomes corrupted with
 * garbage character.  Find the character and delete it.
 */
ckft.Buffer.removeGarbageCharacter = function(/*String*/ text) {
  //debug("removing garbage from " + text);
  return text.replace(/\302\240/g, "");
};

/**
 * Apply syntax coloring to the editor.
 */
ckft.Buffer.prototype.recolor = function() {
  if (!this.isHtmlEditor()) {
    return;
  }

  var editor = this.editor;
  var doc = editor.contentDocument;
  var pre = doc.getElementById("pre");
  syntaxColor(pre, CF_JAVASCRIPT_RULES);
};

/**
 * Scrub the nodes to get rid of _moz_dirty attribute
 */
ckft.Buffer.prototype.scrub = function() {
  var editor = this.editor;
  var content = editor.contentDocument.getElementById('body');
  var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);

  while (walker.nextNode()) {
    var node = walker.currentNode;
    if (node.nodeType == Node.ELEMENT_NODE) {
      node.removeAttribute("_moz_dirty");
      node.removeAttribute("type");
    } 
  }
  walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    var node = walker.currentNode;
    if (node.nodeType == Node.TEXT_NODE) {
      var noCarriage = node.nodeValue.replace(/\r/, "");
      node.nodeValue = noCarriage;
      // debug(node.nodeValue+"marker");
    }
  }
};

/**
 * Set the keyboard focus to this editor.
 */
ckft.Buffer.prototype.focus = function(/*optional int*/ cursorPosition) {
  sidebarDocument.getElementById("editorTabBox").selectedTab = this.tab;
  if (this.isBespinEditor()) {
    return;
  }
  this.editor.contentDocument.defaultView.focus();
};

/**
 * Set this editor's cursor position.
 * @param cursorPosition  character offset relative to editor's plain text
 * representation
 */
ckft.Buffer.prototype.setCursorPosition = function(/*int*/ cursorPosition) {
  if (!this.isHtmlEditor()) {
    return;
  }

  var editor = this.editor;
  var htmlEditor = editor.getHTMLEditor(editor.contentWindow);
  var i = cursorPosition;
  while (i > 0) {
    htmlEditor.selectionController.characterMove(true, false);
    --i;
  }
};

/**
 * Save this buffer to disk.  Prompts user if we don't have a filename yet.
 */
ckft.Buffer.prototype.save = function() {
  if (this.file != null) {
    Chickenfoot.SimpleIO.write(this.file, this.text);
    uploadSyncTrigger(this.file);
    this.dirty = false;
    delete this._lastModifiedTime;
  } else {
    this.saveAs();
  }
};

/**
 * Save this buffer to disk, prompting for a new name.
 */
ckft.Buffer.prototype.saveAs = function() {
  var file;
  if (this.file != null) {
    file = chooseFile(false, this.file);
  } else {
    file = chooseFile(false, this._lastDirectory);
  }
  if (file == null) { return; }
  this.file = file;
  this._lastDirectory = file.clone();
  this._lastDirectory.leafName = "";
  this.save();
};

/**
 * Test whether it's OK to close this buffer.  If buffer is dirty, prompts user to save it.
 * @return true if OK to close, false if user canceled.
 */
ckft.Buffer.prototype.okToClose = function() {
  if (this.dirty) {  
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
        getService(Components.interfaces.nsIPromptService);
    var answer = promptService.confirmEx(chromeWindow,
      "Save Chickenfoot Script?",
      this.toString() + " has unsaved changes.\n",
      promptService.BUTTON_TITLE_SAVE * promptService.BUTTON_POS_0 +
      promptService.BUTTON_TITLE_DONT_SAVE * promptService.BUTTON_POS_2 +
      promptService.BUTTON_TITLE_CANCEL * promptService.BUTTON_POS_1,
      null, null, null, null, {});
    if (answer == 0) {
      this.save();
    } else if (answer == 1) {
      return false;
    }
  }
  return true;
};

/**
 * Close this buffer.  Doesn't prompt user to save it; use
 * okToClose() to do that.
 */
ckft.Buffer.prototype.close = function() {
  var tabbox = sidebarDocument.getElementById("editorTabBox");
  var tabs = sidebarDocument.getElementById("editorTabs");
  var tabPanels = sidebarDocument.getElementById("editorTabPanels");
  var index = tabbox.selectedIndex;

  // remove XUL elements
  tabs.removeChild(this.tab);
  tabPanels.removeChild(this.editor);  
  this.tab = null;
  this.editor = null;

  index = Math.min(index, tabs.childNodes.length-1);
  tabbox.selectedIndex = index;
  
  if (index == -1) {
    sidebarDocument.getElementById("requiresSelectedEditor").setAttribute("disabled", true);
  }
};

ckft.Buffer.prototype.run = function() {
  var file;
  if (this.file === null) { file = this.file; }
  else { file = this.file.parent; }
  
  Chickenfoot.evaluate(chromeWindow, this.text, true, null, {scriptDir:file});
};

ckft.Buffer.prototype.runCurrentLine = function() {
    var thisBuffer = this;
    
    // if web page steals focus from us, grab it back (just once)
    var listener = function(event) {
      setTimeout(function() {thisBuffer.editor.contentWindow.focus()}, 1);
      thisBuffer.editor.removeEventListener("blur", listener, true);
    }
    thisBuffer.editor.addEventListener("blur", listener, true);
    
    // get the line to run
    var line = getTextAtLine(getCursorLine());
    
    // run it
    Chickenfoot.evaluate(chromeWindow, line, true, null, 
            { scriptDir: this.file,
              __feedbackHandler: Chickenfoot.animateTransparentRectangleOverNode }); 
  
    function getTextAtLine(/* int */ line) {
      var ed = thisBuffer.editor;
      var content = ed.contentDocument.getElementById('body');
      var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      var currentLine = 0;
      var lineText = "";
      while (walker.nextNode() && currentLine <= line) {
        var node = walker.currentNode;
        if (node.nodeType == Node.TEXT_NODE && currentLine == line) {
          lineText+=node.nodeValue;
        }
        else if (node.nodeType == Node.ELEMENT_NODE && node.nodeName=="BR") {
          currentLine++;
        }
      }
      return lineText;
    }
    
    function getCursorLine() {
      var ed = thisBuffer.editor;
      var sel = ed.contentWindow.getSelection();
      var anchorNode = sel.anchorNode;
      var content = ed.contentDocument.getElementById('body');
      var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      var currentLine = 0;
      if (anchorNode.nodeType == Node.TEXT_NODE) {
        while (walker.nextNode()) {
          var node = walker.currentNode;
          if (node == anchorNode) {
            break;
          }
          else if (node.nodeType == Node.ELEMENT_NODE && node.nodeName =="BR") {
            currentLine++;
          }
        }
      }
      else {
        var children = anchorNode.childNodes;
        for (var i = 0; i < sel.anchorOffset; i++) {
          if (children.item(i).nodeType == Node.ELEMENT_NODE && children.item(i).nodeName == "BR") {
            currentLine++;
          }
        }
      }
      return currentLine;
    }
};

ckft.Buffer.prototype.onFocus = function() {
  if (this._file) {
    // have to clone() this._file to force it to reload the file attributes
    var currentTime = this._file.clone().lastModifiedTime;

    var previousTime = this._lastModifiedTime;
    this._lastModifiedTime = currentTime;
    
    if (previousTime && currentTime != previousTime) {
      // File changed on disk.  Reload it automatically,
      // unless it's dirty, in which case ask the user
      if (this.dirty) {
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
          .getService(Components.interfaces.nsIPromptService);
        var answer = promptService.confirmEx(chromeWindow,
          "Reload Chickenfoot Script?",
          this.toString() + " has changed on disk, but you have unsaved changes in this editor.\n",
          promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_0 +
          promptService.BUTTON_TITLE_CANCEL * promptService.BUTTON_POS_1,
          "Reload", null, null, null, {})
        if (answer != 0) {
          return;
        }
      }
      
      this.text = Chickenfoot.SimpleIO.read(this.file);      
    }      
  }
};

/** @param {Event} event */
ckft.Buffer.prototype.onResize = function(event) {
  var win = event.target;
  var size = goog.dom.getViewportSize(win);
  var editorEl = win.document.getElementById('editor');
  // Need to subtract 5px to avoid a vertical scroll bar.
  editorEl.style.height = (size.height - 5) + 'px';  
};

/** Map of ids for XUL template menupopups to the template data. */
var newFileTemplates = {};

/**
 * If the user has selected a default template, then defaultTemplateId
 * will be the id of the menuitem that corresponds to that template.
 */
var defaultTemplateId;

/**
 * User has made a selection from the "New File" menu.
 * This selection may be the "Customize templates..." menuitem
 * (indicated when templateId is customize-chickenfoot-template).
 *
 * Either open the customization dialog, or a new buffer,
 * possibly pre-populated with content from a template.
 * 
 * @param {string=} templateId
 */
function newFile(templateId) {
  if (templateId === 'customize-chickenfoot-template') {
    // user has chosen to open the template customization dialog
    var dialogArguments = {
  	  updateTemplates : false,
  	  templateData : getTemplateData(),
  	  newTemplateData : undefined
  	};
    window.openDialog("chrome://chickenfoot/content/templateDialog.xul",
    	"showmore",
    	"chrome,modal,centerscreen,dialog,resizable",
    	dialogArguments
  	);
  	if (dialogArguments.updateTemplates) {
      var prefs = Chickenfoot.getPrefBranch();
      prefs.setCharPref('templates', dialogArguments.newTemplateData);
      populateTemplatePopup();
    }
  } else {
    if (templateId in newFileTemplates || defaultTemplateId) {
      if (!templateId) templateId = defaultTemplateId;
      var scriptText = newFileTemplates[templateId];
      var index;
      var TOKEN = "__CF_CURSOR_POS__";
      if ((index = scriptText.indexOf(TOKEN)) >= 0) {
        // replaces first instance of TOKEN, as desired
        scriptText = scriptText.replace(TOKEN, "");          
      }
      var buffer = getSelectedBuffer();
      if (buffer && !goog.string.trim(buffer.text)) {
        // the selected buffer is empty;
        // populate it instead of creating a new Buffer
        buffer.text = scriptText;
        buffer.setCursorPosition(index);
      } else {
        ckft.Buffer.createBuffer(goog.nullFunction, null, false, scriptText, index);
      }
    } else {
      ckft.Buffer.createBuffer(goog.nullFunction);
    }
  }
}

/**
 * Checks whether an open buffer exists.
 * If it does, and the existing buffer is empty, opens the file in that buffer,
 * editing it in-place.
 * @param {!nsIFile} file
 */
ckft.Buffer.loadIntoBuffer = function(file) {
  var buffer = getSelectedBuffer();
  if (buffer && !goog.string.trim(buffer.text)) {
    // the selected buffer is empty;
    // populate it instead of creating a new Buffer
    buffer.file = file;    
    buffer.trigger = Chickenfoot.gTriggerManager.getTriggerFromFile(file);
    buffer.text = Chickenfoot.SimpleIO.read(file);
    buffer.dirty = false;
    buffer.focus();
  } else {
    // Otherwise, call the usual create new buffer procedure.
    ckft.Buffer.newBufferWithFile(file);
  }
};

function openFile() {
  var file = chooseFile(true, this._lastDirectory);
  this._lastDirectory = file.clone();
  this._lastDirectory.leafName = "";
  ckft.Buffer.loadIntoBuffer(file);
}

/** @param {!nsIFile} file */
ckft.Buffer.newBufferWithFile = function(file) {
  if (file && file.isFile()) {
    ckft.Buffer.createBuffer(goog.nullFunction, file);
  }
};

function startEditingTriggerScript(/*Trigger*/ trigger) {
  ckft.Buffer.loadIntoBuffer(trigger.path);
}

/**
 * Opens a file chooser and returns an nsIFile (possibly null)
 *
 * @param {boolean} openMode true if open mode, false if save mode
 * @return {?nsIFile}
 */
function chooseFile(openMode, initialFile) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var mode = (openMode) ? nsIFilePicker.modeOpen : nsIFilePicker.modeSave;
  var fp = Components.classes["@mozilla.org/filepicker;1"]
      .createInstance(nsIFilePicker);
  fp.init(sidebarWindow, openMode ? "Open Chickenfoot Script" : "Save Chickenfoot Script As", mode);  
  fp.appendFilter("Script Files (*.js)", "*.js");
  fp.appendFilters(fp.filterAll);
  fp.filterIndex = 0;
  fp.defaultExtension = ".js";
  if (initialFile) {
    fp.displayDirectory = initialFile.parent;
    fp.defaultString = initialFile.leafName;
  }
  
  var res = fp.show();
  if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
    return fp.file;
  } else {
    return null;
  }
}

/**
 * Make sure that whenever a tab is selected, the editor inside it
 * gets the keyboard focus.
 */
function focusEditorWhenTabSelected() {
  var tabs = sidebarDocument.getElementById("editorTabs");
  var oldSelectNewTab = tabs.selectNewTab;
  tabs.selectNewTab = function() {    
    var result = oldSelectNewTab.apply(this, arguments);
    var buffer = getSelectedBuffer();
    if (buffer) buffer.focus();
    return result;
  }
}

/**
 * @return {?ckft.Buffer} selected Buffer, or null if no Buffers open.
 */
function getSelectedBuffer() {
  var tabbox = sidebarDocument.getElementById("editorTabBox");
  var editor = tabbox.selectedPanel;
  if (!editor) return null;
  if (!editor.parentNode) return null;  // this editor isn't really in the tree
  return editor.buffer;
}

/**
 * @return {!Array.<ckft.Buffer>} all open buffers
 */
function getAllBuffers() {
  var buffers = [];
  var tabPanels = sidebarDocument.getElementById("editorTabPanels");
  for (var i = 0; i < tabPanels.childNodes.length; ++i) {
    buffers.push(tabPanels.childNodes[i].buffer);
  }
  return buffers;
}

function saveSelectedBuffer(){
  var buffer = getSelectedBuffer();
  if (buffer) buffer.save();
}

function saveAsSelectedBuffer(){
  var buffer = getSelectedBuffer();
  if (buffer) buffer.saveAs();
}

function runSelectedBuffer(){
  var buffer = getSelectedBuffer();
  if (buffer) buffer.run();
}

function closeSelectedBuffer() {
  var buffer = getSelectedBuffer();
  if (buffer && buffer.okToClose()) buffer.close();
}

function closeAllBuffers(){
	var buffers = getAllBuffers();
  	for (var i = 0; i < buffers.length; ++i) {
    	if ( buffers[i].okToClose())	buffers[i].close();
  }
}

function closeAllBuffersButSelected(){
	var buffers = getAllBuffers();
	var selectedBuffer = getSelectedBuffer();
  	for (var i = 0; i < buffers.length; ++i) {
    	if ( buffers[i].okToClose() && buffers[i]!= selectedBuffer) {
    		if( i==buffers.length-1){
    		buffers[i].close();
    		
    		}
    		else{
    		buffers[i].close();
    		}
    	}
    }
}

ckft.Buffer.prototype.runSelectedText = function() {
  var editor = this.editor;
  var sb = new Chickenfoot.StringBuffer();
  var temp = this.editor.contentWindow.getSelection();
  var node = editor.contentDocument.createTextNode(temp);
  if (node.nodeType == Node.TEXT_NODE) {
      sb.append(node.nodeValue);
    } else if (node.tagName == 'BR') {
      sb.append('\n');
    }
  Chickenfoot.evaluate(chromeWindow, sb.toString(), true, null, { scriptDir: this.file });
}

function firstChickenfootUse() {
  var tutorialUrl = "http://groups.csail.mit.edu/uid/chickenfoot/tutorial/";
  chromeWindow._content.location = tutorialUrl;    

  var buffer = getSelectedBuffer();
  buffer.text = '\
// Welcome to Chickenfoot!\n\
// You should see the Chickenfoot tutorial\n\
// in your browser. If not, go to:\n\
//\n\
// ' + tutorialUrl + '\n\
//\n\
// Follow the directions on the web site\n\
// to start learning how to use Chickenfoot.\n';
}


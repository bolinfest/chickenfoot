/**
 * SidebarState wraps up the state of the Chickenfoot sidebar into a single
 * object so that it can be remembered on the main window while the
 * sidebar is closed.
 */
goog.provide('ckft.SidebarState');
goog.provide('ckft.PreservedBuffer');

goog.require('ckft.Buffer');

/**
 * SidebarState fields
 *
 *     preservedBuffers: PreservedBuffer[] 
 *           contents of the sidebar's buffers
 * 
 *     selectedPreservedBuffer: PreservedBuffer  
 *           buffer that was selected in the sidebar
 */

/**
 * Make an object encapsulating the current sidebar state.
 * @param {SidebarWindow} sidebarWindow
 * @constructor
 */
ckft.SidebarState = function(sidebarWindow) {
  var buffers = sidebarWindow.getAllBuffers();
  var selectedBuffer = sidebarWindow.getSelectedBuffer();
  var preservedBuffers = [];
  for (var i = 0; i < buffers.length; ++i) {
    var buffer = buffers[i];
    var preservedBuffer = new ckft.PreservedBuffer(buffer);
    preservedBuffers.push(preservedBuffer);
    if (buffer == selectedBuffer) this.selectedPreservedBuffer = preservedBuffer;
  }
  //debug("selected was " + this.selectedPreservedBuffer);
  this.preservedBuffers = preservedBuffers;
};

/**
 * Restore the sidebar state into a new sidebar.
 */
ckft.SidebarState.prototype.restore = function(/*SidebarWindow*/ sidebarWindow) {
  for (var i = 0; i < this.preservedBuffers.length; ++i) {
    var preservedBuffer = this.preservedBuffers[i];
    var isSelectedBuffer = (preservedBuffer == this.selectedPreservedBuffer);
    var callback = isSelectedBuffer ? function(buffer) { buffer.focus(); } :
        goog.nullFunction;
    preservedBuffer.unpickle(sidebarWindow, callback);
  }
};

/**
 * Test whether this state is dirty (i.e., some part of it still needs to be 
 * saved to disk).
 */
ckft.SidebarState.prototype.__defineGetter__("dirty", function() {
  for (var i = 0; i < this.preservedBuffers.length; ++i) {
    var preservedBuffer = this.preservedBuffers[i];
    if (preservedBuffer.dirty) return true;
  }
  return false;
});

/**
 * Override methods on the chrome window so that
 * sidebar state is saved when the sidebar closes
 * or the entire window closes.
 */
function saveSidebarOnClose(/*ChromeWindow*/ chromeWindow) {
  // override chromeWindow.toggleSidebar() so we can save the state of the Chickenfoot sidebar
  var oldToggleSidebar = chromeWindow.toggleSidebar;
  chromeWindow.toggleSidebar = function(name) {
    try {
      var sidebarWindow = getSidebarWindow(chromeWindow);
      if (sidebarWindow) saveSidebarState(chromeWindow, sidebarWindow);
    } catch (e) {
      debug(e);
    }
    return oldToggleSidebar(name);
  };

  // override chromeWindow.WindowIsClosing() so we can allow the user to save dirty state
  var oldWindowIsClosing = chromeWindow.WindowIsClosing;
  chromeWindow.WindowIsClosing = function() {
    try {
      var sidebarWindow = getSidebarWindow(chromeWindow);
    
      if (sidebarWindow) {
        // Chickenfoot sidebar is currently open, so just ask it to handle dirty state
        if (!sidebarWindow.windowIsClosing()) return false;
        
      } else if (chromeWindow.chickenfootSidebarState 
                 && chromeWindow.chickenfootSidebarState.dirty) {
        // Chickenfoot sidebar is closed, but its saved state is dirty.  
        // Need to open the Chickenfoot sidebar to deal with it.

        // If another sidebar is open, remember it so we can come back to
        // it after showing Chickenfoot.
        var prevSidebarCommand = chromeWindow.document.getElementById("sidebar-box").getAttribute("sidebarcommand");

        // register a load listener, since Chickenfoot sidebar won't load immediately.
        var sidebar = chromeWindow.document.getElementById("sidebar");
        sidebar.addEventListener("load", sidebarLoaded, true);

        // show Chickenfoot sidebar, so that it can handle the dirty state.
        chromeWindow.toggleSidebar('viewChickenfootSidebar');        

        // return failure for now (stopping the caller from closing the chrome window).
        // We'll resume closing in sidebarLoaded.
        return false;
      }
    } catch (e) {
      debug(e);
      //return false;
    }
    return oldWindowIsClosing();
    
    // once dirty Chickenfoot sidebar is loaded, resume closing
    function sidebarLoaded() {
      sidebar.removeEventListener("load", sidebarLoaded, true);      
      // defer a bit to make sure the sidebar's own load listeners are done
      chromeWindow.setTimeout(afterTimeout, 0);
    } // end of sidebarLoaded
  
    // sidebar is fully loaded, tell it to close  
    function afterTimeout() {
      //debug("loaded sidebar");
      var sidebarWindow = sidebar.contentWindow;
      if (!sidebarWindow.windowIsClosing()) return;
  
      // put back whatever sidebar was there before,
      // so Firefox remembers to bring it up the next time it loads
      chromeWindow.toggleSidebar(prevSidebarCommand);
  
      // resume closing
      if (oldWindowIsClosing()) chromeWindow.close();
    } // end of afterTimeout
    
  }; // end of WindowIsClosing
}

/**
 * Save sidebar into a SidebarState object on the chrome window.
 */
function saveSidebarState(/*ChromeWindow*/ chromeWindow,
                          /*SidebarWindow*/ sidebarWindow) {
  chromeWindow.chickenfootSidebarState = new ckft.SidebarState(sidebarWindow);
}

/**
 * Restore sidebar from a SidebarState object stored on the
 * chrome window.
 * @param {ChromeWindow} chromeWindow
 * @param {SidebarWindow} sidebarWindow must be empty (has no buffers)
 * @returns {boolean} true if saved SidebarState object found on chrome window;
 *          false if no sidebar state found.
 */
ckft.SidebarState.restoreSidebarState = function(chromeWindow, sidebarWindow) {
  if (sidebarWindow.getAllBuffers().length > 0) {
    throw new Error("restoring to nonempty sidebar");
  }
  if (!chromeWindow.chickenfootSidebarState) {
    return false;
  }
  chromeWindow.chickenfootSidebarState.restore(sidebarWindow);
  return true;
}


/**
 * PreservedBuffer represents an edit buffer for a closed sidebar.
 * @param {ckft.Buffer} buffer
 * @constructor
 */
ckft.PreservedBuffer = function(buffer) {
  this.file = buffer.file;
  this.dirty = buffer.dirty;
  this.text = buffer.text;
};

/**
 * @param {SidebarWindow} sidebarWindow
 * @param {function(ckft.Buffer)} callback
 */
ckft.PreservedBuffer.prototype.unpickle = function(sidebarWindow, callback) {
  ckft.Buffer.createBuffer(callback, this.file, this.dirty, this.text);
};

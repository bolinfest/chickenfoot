/**
 * Functions that print to the output pane.
 */

/**
 * ID attribute of output pane XUL element.  Used by default in the
 * functions below; but additional output-like panes (like the Action history)
 * can be controlled by specifying the ID of the other pane instead.
 * @const
 */
var CF_DEBUG_ID = 'CF_DEBUG';

/**
 * Print object to output panes on all open sidebars AND to the
 * Javascript console.
 * Used for internal Chickenfoot debugging or trigger debugging.
 */
function debug(/*anything*/ obj) {  
  try {
    var windowMediator = 
      Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
    var e = windowMediator.getEnumerator("navigator:browser");
    while (e.hasMoreElements()) {
      var chromeWindow = e.getNext();
      printDebug(chromeWindow, obj);
    }
  } catch (e) {
  }
  
  debugToErrorConsole(obj)
}

/**
 * Print object only to Javascript error console.
 * Use for debugging messages that shouldn't be allowed to clutter the output pane.
 */
function debugToErrorConsole(/*anything*/ obj) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(toDebugString(obj));  
}


// Objects that want to print themselves in a special way in the
// Chickenfoot output pane can define this method:
//    /*anything*/ toChickenfootDebugOutput(/*Node*/ debugEntry);
//        debugEntry    is the element of the Chickenfoot output pane to which this output will be appended.
//  
//    toChickenfootDebugOutput can either:
//       - return an arbitrary string or object that should be displayed in the debug pane.
//         The caller will pass this object to toDebugString() to convert it into a string for display.
//    or:   
//       - directly append child nodes to debugEntry, and return undefined to signal
//         to the caller that it handled the output itself.
//

/**
 * Print object to output pane in given chrome window.
 * Used by Chickenfoot output() command and by evaluate().
 */
function printDebug(/*ChromeWindow*/ chromeWindow, 
                    /*anything*/ obj,
                    /*optional boolean*/ dontBringToFront,
                    /*optional boolean*/ isHTML, 
                    /*optional String*/ id) {
  if (!id) id = CF_DEBUG_ID;

  // find sidebar
  var sidebarWindow = getSidebarWindow(chromeWindow);
  if (!sidebarWindow) return;  
  var sidebar = sidebarWindow.document;
    
  // make sure Output tab is visible
  if (!dontBringToFront) autoswitchToOutputPane(sidebar)
  
  var debug = sidebar.getElementById(id);
  var node = getLatestDebugEntry(sidebar, id);  
  addDebugOutput(node, obj, isHTML, chromeWindow);
  
  var win = debug.contentWindow;  
  win.scrollTo(node.offsetLeft, node.offsetTop + node.offsetHeight);
}

/**
 * autoswitchTimeout controls the way Chickenfoot automatically switches to
 * the Output pane when a message is printed.  When the mouse is active anywhere
 * in the tab box, autoswitching is disabled until no more such mouse events
 * have happened for the duration of this timeout.  The timeout is in milliseconds.
 * @const
 */
var autoswitchTimeout = 5000; // milliseconds

function startOutputPaneAutoswitching(/*SidebarDocument*/ sidebar) {
  if (autoswitchTimeout) {
    var tab = sidebar.getElementById("CF_DEBUG_TAB");
    var tabbox = tab.parentNode.parentNode;
    tabbox.addEventListener("mousedown", mouseActivityInTabs, true)
    tabbox.addEventListener("mousemove", mouseActivityInTabs, true)
  }

  function mouseActivityInTabs(event) {
    // clock time when autoswitching will resume
    sidebar.autoswitchResume = new Date().getTime() + autoswitchTimeout
  }
}

function autoswitchToOutputPane(/*SidebarDocument*/ sidebar) {
  var now = new Date().getTime()
  if (now <= sidebar.autoswitchResume) {
    // don't autoswitch, because it's less than autoswitchTimeout msec since
    // user touched the tabs
    return;
  }

  var tab = sidebar.getElementById("CF_DEBUG_TAB");
  var tabbox = tab.parentNode.parentNode;
  tabbox.selectedTab = tab;
}


//takes string as optional fifth argument, specifying how obj should be printed
// should be used only when differs from how toDebugString(obj) returns.
function addDebugOutput(/*Node*/ node, /*anything*/ obj, /*boolean*/ isHTML, /*chromeWindow*/ chromeWindow, /*optional string*/ title) {
  var sidebarWindow = getSidebarWindow(chromeWindow);
  var doc = node.ownerDocument;
  var objToPrint = obj;
  
  // First see if obj knows how to make itself into debug output. 
  var hasChickenfootDebugOutput = false;
  try { 
    // Catch errors if obj.toChickenfootDebugOutput does not exist.  Some objects throw
    // security exceptions if you even look twice at them!
    // Don't actually call toChickenfootDebugOutput() inside this try-catch, so we can
    // distinguish these access exceptions (which we want to mask) from exceptions thrown
    // by toChickenfootDebugOutput() (which we DON'T want to mask, but propagate upwards so 
    // that the author of that function can debug them).
     
    if (obj && typeof obj == "object" && typeof obj.toChickenfootDebugOutput == "function") {
      hasChickenfootDebugOutput = true;
    }
  } catch (err) {
  }
  
  if (hasChickenfootDebugOutput) {      
    var result = obj.toChickenfootDebugOutput(doc, node);
    if (result === undefined) {
      return;
    } else {
      objToPrint = result;
    }
  }
  
  if (isHTML) {
    var text = toDebugString(objToPrint);
    var range1 = doc.createRange();
    range1.setStart(node, 0);
    range1.setEnd(node, 0);
    node.appendChild(range1.createContextualFragment(text+"<br>"));
    return;
  }
  
  // otherwise just convert obj to text
  if (title) {var newNode = title;}
  else {
    var text = toDebugString(objToPrint);
    var newNode = doc.createTextNode(text + "\n");
  }
  var spaceNode = doc.createTextNode("");
  if (typeof obj == "object") {
    var header; var bodyRow; var icon;
    
    try {
      var oldSpaces = node.getAttribute("spaces"); 
      if (oldSpaces == null) {numSpaces = "";}
      else {var numSpaces = oldSpaces + "1";}
    }
    catch(err) {var numSpaces = "errSpaces";}
    var spaces = numSpaces.length; var spacesString = "";
    for (var h = 0; h < spaces; h++) {
      spacesString += "  ";
    }
    var tableNode = makeElement(doc, "div", {}, [
      header = makeElement(doc, "div", {"class":"collapsed", "id":"current"},
      [
        doc.createTextNode(spacesString),
        icon = makeElement(doc, "img", { "class":"expandCollapseIcon", "src":"chrome://chickenfoot/skin/expand.gif", "height":9, "width":9 }, []),
        newNode
      ]),
      bodyRow = makeElement(doc,
                            "div",
                            {"style": "visibility:hidden",
                             "class": "objectProperties",
                             "spaces": numSpaces},
                            [])
    ]);
    
    //event listener function to expand and collapse
    function expandOrCollapse(event) {
      var doExpand = header.getAttribute("class") == "collapsed";
      header.setAttribute("class", doExpand ? "expanded" : "collapsed");
      bodyRow.style.visibility = doExpand ? "visible" : "hidden";
      icon.src = doExpand ? "chrome://chickenfoot/skin/collapse.gif" : "chrome://chickenfoot/skin/expand.gif";
      if (doExpand) {
        sidebarWindow.setCursor('wait');
        //check if is a function that shouldn't expand any more
        if (obj.chickenfootFunctionToDisplay) {
          var funcNode = 
            makeElement(doc, "div", {}, [
              colorText(doc, obj.chickenfootFunctionToDisplay, "navy")
            ]);
          bodyRow.appendChild(funcNode);
        }
        //otherwise list its items
        else {
          var listOutput = [];
          try { listOutput = listImpl(obj, ".*", "expandibleList"); }
          catch (err) {}
          
          if (instanceOf(obj, Match)) {listOutput = getMatchIteration(obj, listOutput);}
          
          var longestString = 0;
          for (var m=0; m<listOutput.length; m++) {
            if (listOutput[m][1] && (listOutput[m][1].length > longestString)) {longestString = listOutput[m][1].length;}
          }
          
          for (var i=0; i<listOutput.length; i++) {
            var current = listOutput[i];
            var property = current[1];
            var value = current[2];
            
            //add the right number of spaces between property and value for visual columns
            var numberOfSpaces = longestString + 5 -(property.length);
            for (var k=0; k<numberOfSpaces; k++) {
              property += " ";
            }
           
            //if item is an object, recursively send it back to addDebugOutput
            if (typeof value == "object" && value !== null) {
              if ((instanceOf(value, Match) && (property.toString().substring(0, 4) != "next"))
                  || instanceOf(obj, Array)) {
                var name = property + " = " + toDebugString(value);
              }
              else {var name = property + toDebugString(value);}
              addDebugOutput(bodyRow, value, isHTML, chromeWindow, colorText(doc, name, "green"));
            }
            //if item is a function, allow it to expand once more
            else if (typeof value == "function") {
                //remove the "\n" characters in the header text
                var name = property + value;
                name = name.replace(/\n/g, "");
                value = spacesString + "    " + value.toString().replace(/\n/g, "\n" + spacesString + "    ");
                
                functionObj = new Object();
                functionObj.chickenfootFunctionToDisplay = value;
                addDebugOutput(bodyRow, functionObj, isHTML, chromeWindow, colorText(doc, name, "navy"));
              }
            else if (instanceOf(obj, Array)) {
              var name = property + " = " + toDebugString(value);
              bodyRow.appendChild(colorText(doc, spacesString + "  " + name + "\n", "purple"));
            }
            //otherwise, don't expand anymore, just print the item and its value
            else {
              var name = property + "  " + value;
              bodyRow.appendChild(colorText(doc, spacesString + "  " + name + "\n", "purple"));
            }
          }
        }
        sidebarWindow.setCursor('auto');
      } else {
        removeAllChildren(bodyRow);
      }
    }  
    
    //event listener function to highlight match objects in html pages
    function highlightMatch() {
      //if no matches, just clear the document
      if (!obj.hasMatch) { 
        try {clearAll(chromeWindow, header); fireMouseEvent("click", chromeWindow.content.wrappedJSObject.document.body); return;}
        catch(err) {return;} 
      }
      //if XUL searching, don't do anything because red highlighting throws an error
      if (instanceOf(obj.document, XULDocument)) {return;}
      //then highlight all or just one, depending on whether they clicked on an expanded match object or not
      var win = obj.document.defaultView;
      if (!obj._toExpand) {
        clearAll(chromeWindow, obj);
        try {selectAll(win, obj);} catch (err) {debug(err)}
        header.style.color = 'red';
        header.title = 'black';
      }
      else {
        clearAll(chromeWindow, obj);
        var matchToSelect = oneMatch(obj);
        try {selectAll(obj.document.defaultView, matchToSelect);} catch (err) {debug(err)}
        header.childNodes[2].style.color = 'red';
        header.title = 'green';
      }
    }
    
    //event listener function to throw away object reference, remove event listeners, and disable entry
    function disableEntry(event) {
      if (this.getAttribute("id") == "toRemove") {
        this.removeEventListener("click", expandOrCollapse, false);
        this.setAttribute("id", "");
        if (instanceOf(obj, Match)) {
          clearAll(chromeWindow, obj);
          this.removeEventListener("click", highlightMatch, false);
          chromeWindow.content.wrappedJSObject.removeEventListener("click", function(event) {clearAll(chromeWindow, obj);}, false);
          this.title = "";
        }
        this.removeEventListener("mouseup", disableEntry, false);
      }
      else { return; }
    }
    
    //add all appropriate event listeners
    header.addEventListener("click", expandOrCollapse, false);
    header.addEventListener("mouseup", disableEntry, false);
    if (instanceOf(obj, Match)) {
      header.addEventListener("click", highlightMatch, false);
      highlightMatch(); // highlight all the matches now
      chromeWindow.content.wrappedJSObject.addEventListener("click", function(event) {clearAll(chromeWindow, obj);}, false);
    }
    newNode = tableNode;
  }
  node.appendChild(newNode);
}

//clears all highlighted match entries (in debug pane and html document)
function clearAll(chromeWindow, obj) {
  try {clearSelection(obj.document.defaultView);}
  catch(err) {}
  var sidebarWindow = getSidebarWindow(chromeWindow);
  var sidebar = sidebarWindow.document;
  var recentEntry = getLatestDebugEntry(sidebar, CF_DEBUG_ID);
  var treewalker = createDeepTreeWalker(recentEntry, NodeFilter.SHOW_All);
  var current = treewalker.nextNode();
  while (current) {
    if (current.title == "black") {current.style.color = "black";}
    if (current.title == "green") {current.childNodes[2].style.color = "green";}
    current = treewalker.nextNode();
  }
}

/**
 * 
 * @param {Document} doc
 * @param {string} name
 * @param {Object} attrs
 * @param {Array.<Node>} children
 * @return {Element}
 */
function makeElement(doc, name, attrs, children) {
  var node = doc.createElement(name);
  for (var attr in attrs) {
    node.setAttribute(attr, attrs[attr]);
  }
  for (var i = 0; i < children.length; ++i) {
    node.appendChild(children[i]);
  }
  return node;
}

function removeAllChildren(/*Node*/ node) {
  for (var i = node.childNodes.length-1; i >= 0; --i) {
    node.removeChild(node.childNodes[i]);
  }
}

/**
 * Gray out all previous output entries and prepare to receive fresh output.
 * If id is provided, changes the output pane with the given id attribute;
 * otherwise defaults to CF_DEBUG_ID.
 */
function startNewDebug(/*ChromeWindow*/ chromeWindow, 
                       /*optional String*/ id) {
  if (!id) id = CF_DEBUG_ID;

  // find sidebar
  var sidebarWindow = getSidebarWindow(chromeWindow);
  if (!sidebarWindow) return;  
  var sidebar = sidebarWindow.document;

  var debug = sidebar.getElementById(id);
  var doc = debug.contentDocument;
  var body = doc.getElementsByTagName('body')[0];
  
  var div = getLatestDebugEntry(sidebar, id);
  if (div.hasChildNodes()) {
    // need to create a new PRE
    div.setAttribute("class", "old");
    disablePrevious(div);
    
    var newDiv = doc.createElement('PRE');
    newDiv.setAttribute("class", "new");
    body.appendChild(newDiv);
    div = body.lastChild;
  }
  
  var win = debug.contentWindow;  
  win.scrollTo(div.offsetLeft, div.offsetTop + div.offsetHeight);
}

function disablePrevious(/*node*/ node) {
  var pred = 
    function (node) { 
      try{return (node.id == "current");}
      catch(err) {return false;} 
    };
  var treewalker = createDeepTreeWalker(node, NodeFilter.SHOW_ALL, pred);
  var current = treewalker.nextNode();
  while (current) {
    current.id = "toRemove";
    fireMouseEvent("mouseup", current);
    current = treewalker.nextNode()
  }
}

/**
 * Clears the output pane in sidebar.
 * If id is provided, clears the output pane with the given id attribute;
 * otherwise defaults to CF_DEBUG_ID.
 */
function clearDebugPane(/*ChromeWindow*/ chromeWindow, /*optional String*/ id) {
  // find sidebar
  var sidebarWindow = getSidebarWindow(chromeWindow);
  if (!sidebarWindow) return;  
  var sidebar = sidebarWindow.document;

  if (!id) id = CF_DEBUG_ID;
  var debug = sidebar.getElementById(id);
  var doc = debug.contentDocument;
  var body = doc.getElementsByTagName('body')[0];
  var parent = body.parentNode;
  parent.removeChild(body);
  
  var newBody = doc.createElement('BODY');  
  parent.appendChild(newBody);
  getLatestDebugEntry(sidebar, id);
}

/**
 * Render an object or exception as a string for display to
 * the output pane.  Returns the string.
 */
function toDebugString(/*any*/ obj) {
  if (obj === null) {
    return 'null';
  }
  
  if (obj === undefined) {
    return 'undefined';
  }
  
  if (Range && instanceOf(obj, Range)) {
    return '[object Range]';
  } 
  
  if (((typeof obj) == "object") && (obj.toString().match(/^java\./)) && hasJava()) {
    try { // catch errors if java isn't initialized yet
      if (instanceOf(obj, java.security.PrivilegedActionException)) {
        return toDebugString(obj.getException());
      } else if (instanceOf(obj, java.lang.reflect.InvocationTargetException)) {
        return toDebugString(obj.getCause());
      } else if (instanceOf(obj, java.lang.Throwable)) {
        var text = obj.toString();
        var stack = obj.getStackTrace();
        if (stack.length >= 1) {
          text += "\n in " + stack[0];
          for (var i = 1; i < stack.length; ++i) {
            var frame = stack[i].toString();
            if (frame.match(/^sun.reflect|java.lang.reflect/)) {
              break;
            } else {
              text += "\n    " + frame;
            }
          }
        }
        return text;
      }
    } catch (e) {
    }
  }
  
  try {
    if (instanceOf(obj, Error) 
          /* FIX: the catalog of errors below is required because our instanceOf() doesn't
             handle subtyping. If user creates their own subclass of Error, we won't detect it
             here, which is bad. */
        || instanceOf(obj, SyntaxError) 
        || instanceOf(obj, ReferenceError)
        || instanceOf(obj, TypeError)
        || instanceOf(obj, EvalError)
        || instanceOf(obj, RangeError)
        || instanceOf(obj, URIError)
        ) {
      return obj.toString() + '\n' + translateJavascriptStackTrace(obj.stack);
    }
    
    return obj.toString();
  } catch (error) {
    // Firefox 1.0.3 workaround:
    //   if obj is an array containing objects from the browser document,
    //   it throws "Illegal operation on WrappedNative prototype object"  nsresult: "0x8057000c (NS_ERROR_XPC_BAD_OP_ON_WN_PROTO)"
    // Deal with it by displaying the array directly.
    if (instanceOf(obj, Array)) {
      if (obj.length == 0) return "";
      var s = obj[0].toString();
      for (var i = 1; i < obj.length; ++i) {
        s += "," + obj[i].toString();
      }
      return s;
    } else {
      // exception was caused by something else;
      // pass it on
      throw error;
    }
  }
  
  /**
   * Parse the stack trace and return something
   * more human-readable.
   */
  function translateJavascriptStackTrace(/*String*/ stack) {
    var re = /(\w*)(\(.*\))@(.*):(\d+)/g;
    re.lastIndex = 0;
    
    var sb = new StringBuffer();
    while (m = re.exec(stack)) {
      var functionName = m[1];
      var args = m[2];
      var file = m[3];
      var line = m[4];

      if (file == "chrome://chickenfoot/content/chickenscratch.xul") {
        line -= 16;
      }
      
      if (functionName == "Error" || functionName == "Exception") {
        continue;
      }
      
      if (!functionName) functionName = "anonymous";

      sb.append((sb.length == 0) ? " in " : "    ");      

      // the first chickenscratchEvaluate should be the top of the stack
      if (functionName == "chickenscratchEvaluate") {
        sb.append("top level line " + line + "\n");
        break;
      } else {
        sb.append(functionName + "() line " + line + "\n");
      }
    }
    return sb.toString();
  }
  
} // end toDebugString()

/**
 * Get the node representing the latest output entry, to which new text nodes
 * can be added as children.
 * If id is provided, changes the output pane with the given id attribute;
 * otherwise defaults to CF_DEBUG_ID.
 */
function getLatestDebugEntry(/*XULDocument*/ sidebar, /*optional String*/ id) {
  if (!id) id = CF_DEBUG_ID; 
  var debug = sidebar.getElementById(id);
  var doc = debug.contentDocument;
  var body = doc.getElementsByTagName('body')[0];
  var div = body.lastChild;
  
  if (div == null || div.tagName != 'PRE') {
    // need to create a PRE element
    var newDiv = doc.createElement('PRE');
    newDiv.setAttribute("class", "new");
    body.appendChild(newDiv);
    div = body.lastChild;
  }
  
  return div;
}

function colorText(/*HTMLDocument*/ doc, /*string*/ text, /*string*/ color) {
  var textnode = doc.createTextNode(text);
  var font = doc.createElement("font");
  font.style.color = color;
  font.appendChild(textnode);  
  return font;
}

function getMatchIteration(/*Match object*/ matchObj, /*Array*/ listOutput) {
  if ((matchObj == EMPTY_MATCH) || (matchObj._next == EMPTY_MATCH) || (matchObj._toExpand)) { 
    return listOutput; 
  }
  else {
    var matchIteration = new Array();
    var firstMatchCopy = oneMatch(matchObj);
    matchIteration.push(firstMatchCopy);
    firstMatchCopy._toExpand = true;
    matchObj = matchObj.next;
    
    while (matchObj != EMPTY_MATCH) {
      matchIteration.push(matchObj);
      matchObj._toExpand = true;
      matchObj = matchObj.next;
    }
    return listImpl(matchIteration, ".*", "expandibleList");
  }
}

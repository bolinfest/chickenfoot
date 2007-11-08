function keywordColor(event) {
  if (event.keyCode == 13) {
   
    var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
    var ed = sbwin.getSelectedBuffer().editor;
    var doc = ed.contentDocument;
    var content = doc.getElementById('body');
    updateNodeLines();
    var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var stack = new Array();
    while (walker.nextNode()) {
      stack.push(walker.currentNode);
    }
    for (var node = stack.pop(); node != null; node = stack.pop()) {
      if (node.nodeType == Node.TEXT_NODE) {        
        // If we already made a span, we don't want to make a span inside a span.  
        if (node.parentNode.nodeType == Node.ELEMENT_NODE &&
        	node.parentNode.nodeName == "SPAN") {
        	//debug(node.kwoverride);
        	if (node.kwoverride == null) {
        	  if (node.isKeyword) {
        	    node.parentNode.setAttribute("style", 'font-style: italic');
        	  }
        	  else {
                node.parentNode.setAttribute("style", 'font-style: normal');
              }
        	}
        	else {
              if (node.kwoverride) {
                node.parentNode.setAttribute("style", 'font-style: italic');
              }
              else {
                node.parentNode.setAttribute("style", 'font-style: normal');    
              }
            }
        }
        else {
          var r = doc.createRange();
          var t = doc.createTextNode(node.nodeValue);
          var n = doc.createElement("span");
          //debug(Chickenfoot.domToString(doc));
          if (node.kwoverride == null) { 
            if(node.isKeyword) {  
              n.setAttribute("style", 'font-style: italic');
            }
            else {
              n.setAttribute("style", 'font-style: normal');
            }
          }
          else {
            if (node.kwoverride) {
              n.setAttribute("style", 'font-style: italic');
              t.kwoverride = true;
            }
            else {
              n.setAttribute("style", 'font-style: normal');    
              t.kwoverride = false;
            }
          }
          n.appendChild(t);
          r.selectNode(node);
          r.deleteContents();
          r.insertNode(n);
        }
      }
    }
  }
}
  /*
    Marks the nodes that are in keyword lines.  
  */
function /* String[] */ updateNodeLines() {
  var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
  var ed = sbwin.getSelectedBuffer().editor;
  var doc = ed.contentDocument;
  var content = doc.getElementById('body');
  var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  var lineArray = new Array();
  while(walker.nextNode()) {
    var node = walker.currentNode;
    if (node.nodeType == Node.TEXT_NODE) {
      lineArray.push(node);
    }
    else if (node.nodeType == Node.ELEMENT_NODE) {
      if(node.nodeName == "BR") {
        var line = "";
        for (var i = 0; i<lineArray.length; i++) {
          line += lineArray[i].nodeValue;
        }
        var isKeyword = isLineKeyword(line);
        var object = new Object(); 
        
        for (var i = 0; i<lineArray.length; i++) {
          lineArray[i].isKeyword = isKeyword;
        }
        lineArray = new Array();
      }
    }
  }
}
function runKeywordScript() {
  updateNodeLines();
  Chickenfoot.evaluate(chromeWindow, "//", false);
  var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
  var ed = sbwin.getSelectedBuffer().editor;
  var doc = ed.contentDocument;
  var content = doc.getElementById('body');
  var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  setTimeout(evaluateBuffer, 1000);
  function evaluateBuffer() {
    var line = "";
    var runKeyword = false;
    var keywordoverride = null;
    while (walker.nextNode()) {
      var node = walker.currentNode;

      if (node.nodeType == Node.TEXT_NODE) {
        line+=node.nodeValue;
        //debug('hi');
        //debug(node.kwoverride);
        if (node.kwoverride!=null) {
          keywordoverride = node.kwoverride;
        }
        runKeyword = node.isKeyword;
      }
      else if (node.nodeType == Node.ELEMENT_NODE) {
        if (node.nodeName == "BR") {
          //debug('keywordOverride ' + keywordoverride);
          if (keywordoverride == null) {
            if (runKeyword&&!node.kwoverride) {
              interpretKWC(line);
            }
            else {
              //Chickenfoot.evaluate(chromeWindow, line, true);
              var result = Chickenfoot.global_context.chickenscratchEvaluate(Chickenfoot.global_context, line);
              if (result !== undefined) {
                output(result);
              }
            }    
          }
          else if (keywordoverride) {
            interpretKWC(line);
          }
          else {
            var result = Chickenfoot.global_context.chickenscratchEvaluate(Chickenfoot.global_context, line);
            output(result);
            if (result != null) {
              output(result);
            }
          }
          line = "";
          keywordoverride = null;
        }
      }
    }
  }
}

/*
  Uses a set of heuristics to determine if a particular string
  is believed to be keyword commands
*/
function /* boolean */ isLineKeyword(/* String */ line) {
  // First strip out any strings.  
  var clean = line.replace(/(?:\".*\")|(?:\'.*\')/, "");
  
  
  // Check to see if the format is word space word.
  if (clean.match(/^\w+\s\w+/)) {
    // If the first word is a JavaScript keyword, then it is probably not keyword commands.
    if (clean.match(/^\s*(?:var|const)/)) {
      return false;
    }
  }
  else if (clean.match(/[\(\);{}]/)) {
    return false;
  }
  return true;
  
}
  
function keywordColorRhino(event) {
  if (event.keyCode == 13) {
    // Walk through the nodes
    // Check if a node is javascript or not
    // Set its color if necessary.  Keywords are red.  Javascript is black
    var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
    var ed = sbwin.getSelectedBuffer().editor;
    var doc = ed.contentDocument;
    var content = doc.getElementById('body');
    var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var runScript= Chickenfoot.getJavaClass("chickenfoot.RunScript");
    var runScriptInstance = runScript.newInstance();
    
    // Map the nodes to lines
    // Run the code on the buffer content and figure out which lines have errors.
    updateNodeLines();

    var errorReport = runScriptInstance.verify(bufferToString());
    var linesToErrors = errorReport.linesToErrors();
    var stack = new Array();
    while (walker.nextNode()) {
      stack.push(walker.currentNode);
    }
   
    for (var node = stack.pop(); node != null; node = stack.pop()) {
      if (node.nodeLine > linesToErrors.length -1) {
        continue;
      }
      if (node.nodeType == Node.TEXT_NODE) {        
        var r = doc.createRange();
        var t = doc.createTextNode(node.nodeValue);
        var n = doc.createElement("span");
        if(linesToErrors[node.nodeLine]) {  
          n.setAttribute("style", 'font-family: sans-serif');
        }
        else {
          n.setAttribute("style", 'font-family: monospace');
        }
        n.appendChild(t);
        r.selectNode(node);
        r.deleteContents();
        r.insertNode(n);
      }
    }
  }
  	
  function updateNodeLines() {
    var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var currentLine = 0;
    while(walker.nextNode()) {
      var node = walker.currentNode;
      if (node.nodeType == Node.TEXT_NODE) {
        node.nodeLine = currentLine;
      }
      else if (node.nodeType == Node.ELEMENT_NODE) {
        if(node.nodeName == "BR") {
          currentLine++;
        }
      }
    }
  }
  function /* String */ bufferToString() {
    var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var buffer_content = "";
    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (node.nodeType == Node.TEXT_NODE) {
        buffer_content+=node.nodeValue;
      }
      else if (node.nodeType == Node.ELEMENT_NODE) {
        if (node.nodeName == "BR") {
        buffer_content+="\n";
        }
      }
    }
    return buffer_content;
  }
}

/* 
Method that behaves like Buffer.run() except it runs keyword commands instead.
*/
function interpretKWC(/* String*/ line) {
  var htmlWindow = Chickenfoot.getVisibleHtmlWindow(chromeWindow);
  var editor = getSelectedBuffer().editor;
  var document = Chickenfoot.getLoadedHtmlDocument(htmlWindow);
  var kwcObject = Chickenfoot.interpretKeywordCommand(document, line)[0];
  if (kwcObject.node) {
    Chickenfoot.animateTransparentRectangleOverNode(kwcObject.node, function() {});
    Chickenfoot.sleep(0.45);
  }
  kwcObject.execute();
}
  
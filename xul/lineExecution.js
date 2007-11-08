function runCurrentLine(event) {
  if (event.ctrlKey && event.keyCode == 13) {
    var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
    var ed = sbwin.getSelectedBuffer().editor;
    var listener = function(event) {
      setTimeout(function() {ed.contentWindow.focus()}, 1);
      ed.removeEventListener("blur", listener, true);
    }
    ed.addEventListener("blur", listener, true);
    var line = getTextAtLine(getCursorLine());
    //debug(line);
    Chickenfoot.evaluateHybrid(chromeWindow, line, sbwin.getSelectedBuffer().file); 
    //insertLineAtEnd();
    //debug(Chickenfoot.domToString(ed.contentDocument));
    //var sel = ed.contentWindow.getSelection();
    //var anchorNode = sel.anchorNode;
   // debug(anchorNode.nodeName);
  }
}
function insertLineAtEnd() {
  var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
  var ed = sbwin.getSelectedBuffer().editor;
  var content = ed.contentDocument.getElementById('body');
  var doc = ed.contentDocument;
  var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  var lastBR = null;
  var pre = null;
  while (walker.nextNode()) {
    var node = walker.currentNode;
    if (node.nodeType == Node.ELEMENT_NODE && node.nodeName == "BR") {
      lastBR = node;
    }
  }
  var BRnode = lastBR.cloneNode(true);
  doc.getElementById('pre').appendChild(BRnode);
  lastBR.setAttribute("_moz_dirty", "");
}
function getTextAtLine(/* int */ line) {
  var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
  var ed = sbwin.getSelectedBuffer().editor;
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
  var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
  var ed = sbwin.getSelectedBuffer().editor;
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
function ctrlEnterExecution2(event) {
    if (event.ctrlKey&&event.keyCode==13) {
      debug('ctrlEnterExecution');
      var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
      var ed = sbwin.getSelectedBuffer().editor;
      var listener = function(event) {
        setTimeout(function() {ed.contentWindow.focus()}, 1);
		  ed.removeEventListener("blur", listener, true);
      }
      ed.addEventListener("blur", listener, true);
      var stringArray = new Array();
      var stringArrayIndex = 0;
      var htmlWindow = Chickenfoot.getVisibleHtmlWindow(chromeWindow);
      var sel = ed.contentWindow.getSelection();
      var anchorNode = sel.anchorNode;
      var nextNode = null;
      var content = ed.contentDocument.getElementById('body');
      var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      var getFirstNode = true;
      var firstNode;
	  	
      if (anchorNode.nodeType == Node.TEXT_NODE) {
        debug('if');
        while (walker.nextNode()) {		
          var node = walker.currentNode;
          //debug(node.nodeType);
          if (node.nodeType == Node.TEXT_NODE) {
            if (getFirstNode) {
              firstNode = node;
              getFirstNode = false;
            }
            if (node == anchorNode) {
              stringArray[stringArrayIndex] = anchorNode.nodeValue;
              stringArrayIndex++;
              break;
            }
            else {
              stringArray[stringArrayIndex] = node.nodeValue;
              stringArrayIndex++;
            }
          }
        }		
        while (walker.nextNode()) {
          nextNode = walker.currentNode;
          if (nextNode.nodeType == Node.TEXT_NODE) {
            break;
          }
        }
      }
      else {
        debug('else');
        var tempList = anchorNode.childNodes;
        var qtemp = 0;
        for (var q = 0; q<sel.anchorOffset; q++) {
          if (tempList.item(q).nodeValue == null) {
            continue;
          }
          stringArray[qtemp] = tempList.item(q).nodeValue;
          qtemp++;
        }	
        var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
          nextNode = walker.currentNode;
          if (nextNode == anchorNode) {
            nextNode = walker.currentNode;
            if (nextNode != null) {
              //debug(nextNode.nodeValue);
            }
          }
        }
      }
      if (event.keyCode == 13) {
        var doc = Chickenfoot.getLoadedHtmlDocument(htmlWindow);

        var buffer = getSelectedBuffer();
        if (buffer._makeGuess && Chickenfoot.hasJava()) {
	      		
          var runScript= Chickenfoot.getJavaClass("chickenfoot.RunScript");
          var runScriptInstance = runScript.newInstance();
          var errorReport = runScriptInstance.verify(buffer.text);
          //debug(errorReport.getNumErrors());
          buffer._useKwc = !errorReport.isJS();
          buffer.updateMode();
          buffer._makeGuess = false;
        }
        if (buffer._useKwc) {
          debug('use kwc');
          var interpretations = Chickenfoot.interpretKeywordCommand(doc, stringArray[stringArray.length-1]);
          var bestInterpretation = interpretations[0];
          if (bestInterpretation.node) {
            Chickenfoot.animateTransparentRectangleOverNode(bestInterpretation.node,
              function() { bestInterpretation.execute(); });
          } 
          else {
            bestInterpretation.execute();
          }
        }
        else {
          debug('chickenfoot');
          //debug(stringArray[stringArray.length-1]);
          Chickenfoot.evaluate(chromeWindow, stringArray[stringArray.length-1], true, null, null, buffer.file);
        }
			
        var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
          if (node.nodeType == Node.TEXT_NODE) {
            if (node.nodeValue.charAt(node.nodeValue.length-1)==' ') {
              node.nodeValue = node.nodeValue.substring(0, node.nodeValue.length-1);
            }
          }
        }
        if (nextNode == null || nextNode.nodeValue==null) {
          //debug('go to Next Line');
          pre = ed.contentDocument.getElementById('pre');
          var bufferText = sbwin.getSelectedBuffer().text;
          sbwin.getSelectedBuffer().text=bufferText+" ";

          var lastNode = null;
          var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          while (walker.nextNode()) {
            var node = walker.currentNode;
            if (node.nodeType == Node.TEXT_NODE) {
              lastNode = node;
            }
          }
          var walker = Chickenfoot.createTreeWalker(content, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          var deleteBR = false;
          while (walker.nextNode()) {
            var node = walker.currentNode;
            if (deleteBR) {
              if (node.tagName == 'BR') {
                node.parentNode.removeChild(node);
              }
            }
            else if (node == lastNode) {
              deleteBR = true;
            }
          } 
          var range = ed.contentDocument.createRange();
          range.setStart(lastNode, 0);
          range.setEnd(lastNode, 0);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        else {
          sel.removeAllRanges();
          var range = ed.contentDocument.createRange();
          range.setStart(nextNode, 0);
          range.setEnd(nextNode, 0);
          sel.addRange(range);
        }
      }
    }
  }

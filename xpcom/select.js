function selectAll(/*HtmlWindow*/ win, /*Match*/ match) {
  clearSelection(win);
    
  //is there really a match when radio button
  var currentSelection = win.getSelection();

  // clear selection when user clicks in the browser window
  if (win._ChickenfootSelection === undefined) {
    // this is the first time we've selected in this window,
    // so create a property to remember the selection, 
    // and add a listener that clears the selection on click.
    win._ChickenfootSelection = [];
  }
  
  for (var m = match; m.hasMatch; m = m.next) {
    // make sure text is selected
    if (m.range) {
      currentSelection.addRange(m.range);
    }
    
    // make sure nontext objects (e.g. buttons, images) are outlined
    if (m.element) {
      var e = m.element;
      var doc = e.ownerDocument;
      if (e.style) {
        //e._ChickenfootOldBorder = e.style.border;
        //e.style.border = "gray solid thick";
        var box = Chickenfoot.Box.forNode(e);
        var div = doc.createElement("div");
        div.style.position="absolute";
        div.style.width = box.w + "px";
        div.style.height = box.h + "px";
        div.style.left = box.x + "px";
        div.style.top = box.y + "px";
        div.style.backgroundColor = "#f00";
        div.style.opacity = .4;
        
        var body = doc.getElementsByTagName("body")[0];
        body.appendChild(div);
        
        
        win._ChickenfootSelection.push(div);
      }
    }
  }
}

function clearSelection(/*HtmlWindow*/ win) {
  var currentSelection = win.getSelection();
  currentSelection.removeAllRanges();
  
  if (win._ChickenfootSelection) {  
    var nodes = win._ChickenfootSelection;
    for (var i = 0; i < nodes.length; ++i) {
      var e = nodes[i];
      var doc = e.ownerDocument;  
      var body = doc.getElementsByTagName("body")[0];
      body.removeChild(e);
     
    }
    win._ChickenfootSelection = [];
  }
}


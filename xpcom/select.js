/**
 * Visibly highlight all matches to a pattern.  The text in each match is highlighted using
 * Firefox's built-in text highlighting (as if you had dragged the mouse over it), and the
 * HTML node for each match is displayed by a translucent rectangle.
 *
 * This function works even if some of the matches are inside subframes of win.  
 *
 * @param win     HTML window where the selections should be made.
 * @param match   iteration of matches to highlight
 */
function selectImpl(/*Document*/ doc, /*Pattern*/ pattern, /*optional Match*/ context) {
  selectAll(doc.defaultView, Pattern.find(doc, pattern, [], context));
}



/**
 * Visibly highlight all elements in a Match iteration.  
 *
 * @param win     HTML window where the selections should be made.
 * @param match   iteration of matches to highlight
 */
function selectAll(/*HtmlWindow*/ win, /*Match*/ match) {

  clearSelection(win);

  // retrieve selection object for making text highlights    
  var currentSelection = win.getSelection();

  // list of highlights we added
  var highlights = []
  
  for (var m = match; m.hasMatch; m = m.next) {
    // make sure text is selected
    if (m.range) {
      currentSelection.addRange(m.range);
    }
    
    // make sure nontext objects (e.g. buttons, images) are outlined
    if (m.element) {
      var e = m.element;
      var box = Chickenfoot.Box.forNode(e);
      var doc = e.ownerDocument;
      var div = makeTranslucentRectangle(doc.body, box.x, box.y, box.w, box.h, "#f00", 0.4)
      div.setAttribute("class", "_chickenfootSelection");
      highlights.push(div)
    }
  }

  if (highlights.length > 0) {
    // make a clear DIV over the entire window -- partly to capture the click event to clear the selection,
    // and partly to remember all the highlight divs that were created.
    // Add this div last, so that it lies on top of the selection highlight divs and captures the click event.
    var w = Math.max(win.document.width, win.innerWidth)
    var h = Math.max(win.document.height, win.innerHeight)
    var holder = makeTranslucentRectangle(win.document.body, 0, 0, w, h, "#ffffff", 0)
    holder.id = "_chickenfootSelectionHolder"
    holder.highlights = highlights
    holder.addEventListener("click", function () {
      clearSelection(win);
    }, true);
  }

  // Helper function that makes translucent rectangles.  
  function makeTranslucentRectangle(/*Node*/ parent, /*int*/ left, top, width, height, /*String*/ color, /*float*/ opacity) {
    var doc = parent.ownerDocument
    var div = doc.createElement("div");
    div.style.position="absolute";
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.left = left + "px";
    div.style.top = top + "px";
    div.style.backgroundColor = color;
    div.style.opacity = opacity;
    parent.appendChild(div)
    return div
  }
  
}

/**
 * Clear all highlights displayed by a call to selectAll().
 * (This happens automatically when selectAll() is called again on a window,
 * or when the user clicks anywhere in the window.)
 * @param win  HTML window whose selection highlights should be cleared
 */
function clearSelection(/*HtmlWindow*/ win) {
  var currentSelection = win.getSelection();
  currentSelection.removeAllRanges();

  var holder = win.document.getElementById("_chickenfootSelectionHolder")
  if (holder) {   
    var nodes = holder.highlights;
    for (var i = 0; i < nodes.length; ++i) {
      var e = nodes[i];
      e.parentNode.removeChild(e)
    }
    holder.parentNode.removeChild(holder)
  }
}


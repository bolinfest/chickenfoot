/***************************************************
 * Functions for visualizing pattern library
 */

/* Old updateLibraryTree, which showed LAPIS pattern library

function updateLibraryTree () {
  // get the new tree from LAPIS
  var doc = getLoadedHtmlDocument(Chickenfoot.getVisibleHtmlWindow(chromeWindow));
  var mozdoc = MozillaDocument.createMozillaDocument(doc);
  var root = mozdoc.getLibraryTree();

  // delete existing tree contents
  var treechildren = sidebarDocument.getElementById("CF_LIBRARY_TREE_CONTENTS");
  while (treechildren.hasChildNodes()) {
    treechildren.removeChild(treechildren.lastChild);
  }

  // rebuild it recursively
  update(treechildren, root.children);

  function update(treechildren, libchildren) {  
    var c = libchildren.size();
    for (var i = 0; i < c; ++i) {
      var n = libchildren.elementAt(i);
    
      var item = document.createElement("treeitem");
      item.setAttribute("pattern", n.shortestName);
      var row = document.createElement("treerow");
      var cell = document.createElement("treecell");
      cell.setAttribute("label", n.toString());
      row.appendChild(cell);
      item.appendChild(row);
      treechildren.appendChild(item);

      if (!n.children.isEmpty()) {
        var subchildren = document.createElement("treechildren");
        item.setAttribute("container", "true");
        item.appendChild(subchildren);
        update(subchildren, n.children);
      }
    }
  }
}
*/

function clickedLibraryTree() {
  var tree = sidebarDocument.getElementById("CF_LIBRARY_TREE");
  var sel = tree.currentIndex;
  if (sel == -1) {
    return;
  }
  
  var item = tree.view.getItemAtIndex(sel);
  
  var pattern = item.getAttribute("pattern");
  if (pattern) {
    selectFromPatternPane(pattern);
  }
}

function selectFromPatternPane(pattern) {
    try {
      var htmlWindow = Chickenfoot.getVisibleHtmlWindow(chromeWindow);
      var doc = htmlWindow.document;
      var matches = Chickenfoot.Pattern.find(doc, pattern);
      var label1 = sidebarDocument.getElementById('CF_PATTERN_STATUS1');
      label1.value = 
        matches.count 
        + ' match' + (matches.count == 1 ? "" : "es") 
        + ' for '
        + pattern;
      var label2 = sidebarDocument.getElementById('CF_PATTERN_STATUS2');
      label2.value = '';

      Chickenfoot.selectAll(htmlWindow, matches);

      return;
    } catch (e) {
      sidebarDocument.getElementById('CF_PATTERN_STATUS1').value =
        "";
      sidebarDocument.getElementById('CF_PATTERN_STATUS2').value =
        Chickenfoot.toDebugString(e);
      throw e;
      return;
    }
}

function addPatternsToContextMenu() {
  // The context menu is on the chrome window (the entire Firefox window),
  // not the sidebar.  So use chromeDocument in the code below.
  
  // Display the separator only if at least one of the submenus will appear.
  var sep = chromeDocument.getElementById("cfSelectionSeparator");
  sep.hidden = true;
  
  // TODO: replace the [] with calls to MozillaDocumentBroker.namesEqualTo(),
  // namesContaining(), namesIn()
  updateMenu("cfSelectionEquals", []);
  updateMenu("cfSelectionContains", []);
  updateMenu("cfSelectionIn", []);
  
  function updateMenu(menuID, choices) {
    var menu = chromeDocument.getElementById(menuID);

    menu.hidden = (choices.length == 0);
    if (!menu.hidden) {
      sep.hidden = false;
    }

    // delete old popup
    while (menu.hasChildNodes()) {
      menu.removeChild(menu.lastChild);
    }

    // create a new popup
    var popup = chromeDocument.createElement("menupopup");
  
    for (var i = 0; i < choices.length; ++i) {
      var pattern = choices[i];
      var item = chromeDocument.createElement("menuitem");      
      item.setAttribute("label", pattern);
      item.setAttribute("oncommand", "document.selectFromPatternPane('" + pattern + "')");

	  // TODO: if find() were fast enough, we'd want to make the selections
	  // during mouseover.  oncommand should perhaps put the pattern name
	  // in the pattern pane's textbox.
      //item.setAttribute("onmouseover", "document.selectFromPatternPane('" + pattern + "')");
      
      popup.appendChild(item);
    }
  
    menu.appendChild(popup);
  }
}

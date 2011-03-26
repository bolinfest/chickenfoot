goog.require('ckft.dom');

/**
 * Contains the code for the click() primitive
 */

// TODO(mbolin): determine whether pattern should be a String.
// For Gmail, there is a fake "All" link, so it is intuitive to try this:
//
// click("All");
//
// Right now, this will fail because Pattern.find(doc, "All", [Pattern.LINK, Pattern.BUTTON])
// will not find anything using the current heuristic. The alternative is to do:
//
// find("All").click();
//
// This should work with the automated mouse event, but it would not work doing things
// the old way. Another thing that users may try is:
//
// click(find("All"));
//
// This does not seem to work because the argument to click() is not a String.
// This should probably be changed so that anything that constitutes a Pattern
// (according to the developer's Wiki) is valid.

/**
 * Clicks the link or button that best matches pattern.
 */
function clickImpl(/*Document*/ doc, /*string*/ pattern, /*chromeWindow*/chrome, /*optional Match*/ context, /*optional function*/ feedbackHandler) {
  var m = Pattern.find(doc, pattern, [Pattern.LINK, Pattern.BUTTON, Pattern.MENU, Pattern.LISTITEM,
                                      Pattern.CHECKBOX, Pattern.RADIOBUTTON, Pattern.TAB], context);
  // It is possible that the user is trying to do "click('foo')" to
  // click a <SPAN> such as:
  //
  //   <SPAN onmousedown="doFoo()">Click for foo</SPAN>
  //
  // In such a case, the LINK and BUTTON patterns will not return any results,
  // so try STRING_LITERAL instead.  
  if (m.count == 0) {
    m = Pattern.find(doc, pattern, [Pattern.TEXT], context);
  }
  
  if (m.count > 1) {
    temp = Pattern.find(doc, pattern, null, context);
    if (temp.count == 1) {m = temp;}
  }

  // make sure exactly one best match
  if (m.count == 0) {
    throw addMatchToError(new Error("No match for click(" + pattern + ")"), m);
  } else if (m.count > 1) {
    throw addMatchToError(new Error("More than one best match for click(" + pattern + ")"), m);
  }

  // click on the one best match
  var element = m.element;
  if (!element) element = rangeToContainer(m.range);
  if (!element || element.nodeType != Node.ELEMENT_NODE) {
    throw addMatchToError(new Error('match does not correspond to a Range that can be clicked'), m);
  }
  
  /*
   * If you run the following Chickenscratch code on a page:
   *
   * document.addEventListener('click', function(event) { output('click') }, false);
   * document.addEventListener('mousedown', function(event) { output('down') }, false);
   * document.addEventListener('mouseup', function(event) { output('up') }, false);
   *
   * And then left-click on the page, you will see the following output:
   *
   * down
   * up
   * click
   *
   * (The order in which the listeners are added does not affect the order
   * of the output in the console.)
   *
   * If you programmatically fire a mousedown and a mouseup, then Firefox will not
   * synthesize those two events into a click, so the click must be fired explicitly.
   *
   * On some webapps, such as Gmail, event handlers are added to respond to mousedown
   * events rather than click events, so all three pieces of the event
   * (mousedown, mouseup, click) are fired by Chickenfoot to provide better automation.
   */
  node = m.element;
  if (node.wrappedJSObject) {node = node.wrappedJSObject;}
  
  if (feedbackHandler) {
    feedbackHandler(node, doClick);
  } else {
    doClick();
  }

  function doClick() {  
    fireMouseEvent('mousedown', node);
    fireMouseEvent('mouseup', node);
    if (node.click) {
      node.click();
    }
    var allowDefaultAction = fireMouseEvent('click', node);
  
    if (node.tagName == 'menu') { //|| (node.tagName.toLowerCase() == 'menulist')) {
      menuBox = node.boxObject.QueryInterface(Components.interfaces.nsIMenuBoxObject);
      menuBox.openMenu(true);
      node.open = true;

      //this event listener makes sure that the popup will close again with any other click event
      function closeMenus(event) {
        menus = doc.getElementsByTagName('menu');
        var i = 0;
        while (i < menus.length) {
          if (menus[i].wrappedJSObject) {
            menus[i].wrappedJSObject.open = false;
          } else {
            menus[i].open = false;
          }
          menus[i].boxObject.QueryInterface(Components.interfaces.nsIMenuBoxObject).openMenu(false); 
          i += 1;
        }
      }

      var target = chrome || doc;
      target.addEventListener('click', closeMenus, false);
    }

    if (allowDefaultAction
        && ckft.dom.getTagName(element) == 'A'
        && element.href
        && !element.target) {
      // We want to exclude anchor tags that are not links, such as:
      // <a name="section2">Section 2: Related Work</a>
      // Ideally, we would check if element is in doc.links, but that
      // may be expensive if there are a lot of links
      doc.defaultView.location = element.toString();
    }
  }

}

//=====================
// The Insertion Script
debug(">Running Script...")
// Insert link after each multipage
for (var m1 = find("point just after multipage"); m1.hasMatch; m1 = m1.next)
{
  insert(m1, new Link("[Show All]", showAll))
}
debug(">Script Done.")
//=====================




//=====================
// The show all function
function showAll()
{
  debug(">Running ShowAll...")
  var HTML = ""
  var mostRecentNode = getPageContent(); 
  try
  {
    insert(after(mostRecentNode), "MATTHEW")
    for (var m1 = find("numberedlink in (first multipage in [body])"); m1.hasMatch; m1 = m1.next)
    {
      debug(">>NumberedLink")
      CF.browser.selectedTab = CF.browser.addTab("about:blank")
      go(m1.element.getAttribute("href"))
      var importNode = getPageContent()
      importNode = importNode.cloneNode(true)
      CF.browser.removeCurrentTab()
      insert(before("MATTHEW"), importNode)
      mostRecentNode = importNode
    }
  }

  catch(e)
  {
    debug(">>"+e)
  }
  debug(">ShowAll Done.")
}
//=====================




//=====================
function getPageContent()
{
  info = DocumentInfo.createDocumentInfo()
  tree_ANCESTOR = document.body; // default ancestor

  bodybox = info.findBox(document.body)
  halfway_POINT = bodybox.h / 2;

  m = find("multipage")
  if (!m.hasMatch)
  {
    debug(">> No Multipages found. Defaulting to body.")
  }

  else
  {
    // first multipage
    multibox = info.findBox(m.range.commonAncestorContainer)

    var done = false;

    // Multipage is in top half
    // Iterate through ancestors
    // Accept the first one whose endpoint
    // is in the bottom half of the screen
    if (multibox.y + multibox.h < halfway_POINT)
    {
      debug(">> Multipage in top half")
      for (var m2 = find("end of (element in [body]) contains (first multipage in page)"); m2.hasMatch; m2 = m2.next)
      if (done == false)
      {
	var collapsedRange = m2.range
	var node = collapsedRange.startContainer.childNodes.item(collapsedRange.startOffset-1)
	var ancBox = info.findBox(node);
	if (ancBox.y+ancBox.h > halfway_POINT)
	{
	  tree_ANCESTOR = node;
	  done = true;
	}
      }
    }

    // Multipage is in bottom half
    // Iterate through ancestors
    // Accept the last ancestor whose start
    // point is in the top half of the document
    else
    {
      debug(">> Multipage in bottom half")
      for (var m2 = find("start of (element in [body]) contains (first multipage in page)"); m2.hasMatch; m2 = m2.next)
      {
	var collapsedRange = m2.range
	var node = collapsedRange.startContainer.childNodes.item(collapsedRange.startOffset)
	var ancBox = info.node2box.get(node);
	if (ancBox.y < halfway_POINT)
	  tree_ANCESTOR = node;
      }
    }
  }
  debug(">>Selected Node: " +tree_ANCESTOR.tagName)
  return tree_ANCESTOR;
}
//=====================





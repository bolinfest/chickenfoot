goog.require('goog.dom');
goog.require('goog.string');
goog.require('ckft.dom.Box');

function Pattern() {

  /**
   * Minimum Keywords.match() return value to be a candidate for a keyword pattern match
   */
  const STRENGTH_THRESHOLD = 0.1;
  
  
  // Strength factors
  
  /* Weights for judging a captioned node match
   * These must sum to 1.
   */
  const KEYWORD_FACTOR = 0.7;
  const POSITION_FACTOR = 0.1;
  const DISTANCE_FACTOR = 0.1;
  const OVERLAP_FACTOR = 0.05;
  
  /**
   * Because textual matches to the right are less likely
   * than textual matches to the left for a textbox,
   * the strength of a "right" match is reduced by a
   * constant factor
   */
  const TEXTBOX_FACTORS = {above:1, left:1, right:0.8, below:0.8};

  /**
   * Top and left matches are less likely for checkboxes and radio buttons.
   */    
  const CHECKBOX_FACTORS = {above:0.1, left:0.5, right:1, below:0.01};
  
  /**
   * Treat listboxes like textboxes.
   */    
  const LISTBOX_FACTORS = {above:1, left:1, right:0.5, below:0.5};
  
  /**
   * Allow all matches for images.
   */    
  const IMAGE_FACTORS = {above:1, left:1, right:1, below:1};
  
  /**
   * Explicit <LABEL> elements get extra points.
   */
  const LABEL_FACTOR = 2.0;
  
  /**
   * Nested elements (e.g. text inside a SELECT) get extra points.
   */
  const NESTED_FACTOR = 2.0;
  
  
  /* Exported methods */
  Pattern.find = find;
  Pattern.getFindRoot = getFindRoot;

  // enable this to get debugging output
  Pattern.debugPatternMatching = false;

  
  /* Component types */
  Pattern.LINK = "link";
  Pattern.BUTTON = "button";
  Pattern.TEXTBOX = "textbox";
  Pattern.CHECKBOX = "checkbox";
  Pattern.RADIOBUTTON = "radiobutton";
  Pattern.LISTBOX = "listbox";
  Pattern.LISTITEM = "listitem";
  Pattern.FORM = "form";
  Pattern.COLUMN = "column";
  Pattern.ROW = "row";
  Pattern.CELL = "cell";
  Pattern.TABLE = "table";
  //TODO add box
  Pattern.IMAGE = "image";
  Pattern.TEXT = "text";
  Pattern.ID = "id";
  Pattern.MENU = "menu";
  Pattern.MENUITEM = "menuitem";
  Pattern.TAB = "tab";
  Pattern.WINDOW = "window";
  
  // findMethods maps each component type name to the method that searches for
  // components of that type.
  // !!! every key in findMethods should be all lowercase
  var findMethods = {
    link: findLinkMatches,
    button: findButtonMatches,
    textbox: findTextboxMatches,  
    checkbox: findCheckboxMatches,
    radiobutton: findRadioButtonMatches,
    listbox: findListboxMatches,
    listitem: findOptionMatches,
    form: findForms,
    column : findColumns,
    row : findRows,
    table : findTables,
    cell : findCells,
    image: findImages,
    //TODO add box
    text : findTextMatches,
    id : findIdMatches,
    menu: findMenuMatches,
    menuitem: findMenuItemMatches,
    tab: findTabMatches,
    window: findWindowMatches
  };
  
  // construct a regexp that tests whether a pattern ends with one of the 
  // component type names
  var typeNames = [];
  for (typeName in findMethods) {
    typeNames.push(typeName);
  }
  var typeSuffixRegexp = new RegExp('\\b(' + typeNames.join('|') + ')\\s*$', 'i');
  
  Pattern.typeNames = typeNames;
 
  /*
   * Find a pattern.
   *
   *  doc: document to search.  (If context argument is provided, then this argument
   *        is ignored and context.document is used instead.)
   *
   *  pattern: pattern to search for, which may be:
   *
   *            a keyword pattern, represented as a string
   *            a regular expression, represented by a regex object
   *            an XPath pattern, represented as a Javascript object of type XPath
   *
   *          If pattern is a keyword pattern and ends with a type name (e.g. "textbox"), 
   *          then strip that type name from the keyword pattern and use it instead of
   *          the types argument.
   *
   *          Pattern may be null, which indicates that the caller just wants the nodes of 
   *          the given types.  (Used, for example, by enter() with only one argument.)
   *
   *  types: types of nodes to search.  
   *         Array may contain one or more of Pattern.LINK, Pattern.BUTTON, etc.
   *         May be null, which indicates that the caller doesn't care.
   *
   *  context: optional range in which matches must appear 
   *
   *  requires: (1) either types or pattern is non-null;
   *            (2) if pattern is a keyword pattern,
   *                  then either types is non-null or pattern ends with a type name
   *
   *  returns: Match iteration:
   *           If pattern was a regex pattern, the Match iteration contains 
   *           all the text regions it matches.
   *
   *           If pattern was a keyword pattern, the Match iteration contains the 
   *           highest-strength match (plus any matches that are tied with it in strength)
   */
  function find(/*Document*/ doc, 
                /*Pattern*/ pattern, 
                /*optional String[]*/ types, 
                /*optional Range*/ context) {
    if (context) doc = context.startContainer.ownerDocument;

    // replace null arguments with valid, empty objects
    if (pattern === null) {
      pattern = "";
    }

    if (instanceOf(pattern, Match)) {return oneMatch(pattern);}

    if (instanceOf(pattern, Node)) {
      return nodeToMatch(pattern);
    }
    
    if (instanceOf(pattern, Range)) {
      throw new Error("not implemented yet");
    }

    if (instanceOf(pattern, XPath)) {
        var docs = getAllVisibleFrameDocuments(doc);
        
        var nodes = [];
        for (var i = 0; i < docs.length; ++i) {
            var frameDoc = docs[i];
            var contextNode = context ? rangeToContainer(context) : frameDoc.documentElement;
            var result = frameDoc.evaluate(pattern.xpathExpression,
                            contextNode,
                            pattern.namespaceResolver,
                            pattern.resultType,
                            null); // create new result
            // The result cannot be XPathResult.ANY_TYPE even though that
            // may have been passed to evaluate() -- it should be converted
            // to whichever type the result actually is.
            switch (result.resultType) {
                case XPathResult.BOOLEAN_TYPE:
                case XPathResult.STRING_TYPE:
                case XPathResult.NUMBER_TYPE:
	                throw new Error("The pattern \"" + pattern.xpathExpression + "\" did not match part of the web page.");
	                break;
    
                // single node
                case XPathResult.ANY_UNORDERED_NODE_TYPE:
                case XPathResult.FIRST_ORDERED_NODE_TYPE:
                            debug("single node");
	                var node = result.singleNodeValue;
	                nodes.push(nodeToMatch(node));
	                break;
	              
                // iterator        
                case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
                case XPathResult.ORDERED_NODE_ITERATOR_TYPE:                                
	                var node;
	                while (node = result.iterateNext()) { nodes.push(node); }
	                break;
            
                // snapshot
                case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
                case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
	                for (var i = 0; i < result.snapshotLength; ++i) { nodes.push(result.snapshotItem(i)); }
	                break;
            
                default:
	                Test.fail("Unrecognized XPathResult type: " + pattern.resultType);
            }
        }
        return nodesToMatches(nodes);
    }

    // TODO: handle XUL?
    if (instanceOf(pattern, RegExp)) {
      return findRegexp(doc, pattern, context);
    }
    
    // otherwise it's a keyword pattern
    if (typeof pattern == "string" || instanceOf(pattern, String)) {
      var explicitType = pattern.match(typeSuffixRegexp);
      if (explicitType) {
        types = [explicitType[1].toLowerCase()];
        pattern = goog.string.trim(pattern.substring(0, explicitType.index));
      }
      if (!types) types = ['text'];

      var keywords = splitIntoKeywords(pattern);

      return findKeywords(doc, types, keywords, context);
    }
    
    throw new Error("unknown pattern: " + pattern);
  }

  function findKeywordsInAllFrames(/*Document*/ doc, /*String[]*/ types, /*Keywords*/ keywords, /*optional Range*/ context) {
    var docs = getAllVisibleFrameDocuments(doc);

    var matches = [];

    for (var j = 0; j < docs.length; ++j) {
      var frameDoc = docs[j];

      for (var i = 0; i < types.length; ++i) {
        var type = types[i].toLowerCase();
        var f = findMethods[type];
        if (!f) {
          throw new Error("Unknown keyword pattern type: " + type);
        }
        f(matches, frameDoc, keywords, context);
      }
    }
    
    if (matches.length == 0) {
      for (var j = 0; j < docs.length; ++j) {
        var frameDoc = docs[j];
        matches = findFieldsByInternalName(frameDoc, types, keywords, context);
        //debug("name matches " + matches.length);
      }
    }
    
    return matches;
  }
  
  /**
   * Find all fields of the given types whose name attribute matches the pattern exactly.
   * Return InternalMatches[] array.
   */
  function findFieldsByInternalName(/*Document*/ doc, /*String[]*/ types, /*Keywords*/ keywords, /*optional Range*/ context) {
    var matches = [];
    for (var i = 0; i < types.length; i++) {
      var type = types[i].toLowerCase();
      var inputs = null;

      var PREDICATES = {
         button: isClickable,
         radiobutton: isRadioButton,
         textbox: isTextbox,
         checkbox: isCheckbox,
         listbox: isListbox,
         menu: isMenu,
         menuItem: isMenuItem,
         tab: isTab
      };
      if (type in PREDICATES) {
        var root = getFindRoot(doc, context);
        var iterator = findElements(root, PREDICATES[type]);
        while (iterator.nextNode()) {
          var field = iterator.currentNode;
          if (field.name == keywords.pattern && isVisible(field)) {
            matches.push(new InternalMatch(field, 1.0));
          }
        }
      }
    }
    
    return matches;
  }
  
  /*
   * Find a keyword pattern.
   * Returns a Match iteration.
   */
  function findKeywords(/*Document*/ doc, /*String[]*/ types, /*Keywords*/ keywords, 
                        /*optional Range*/ context) {
    if (types == 'window') {
      var matches = findWindowMatches([], keywords); 
      }
      
    else {var matches = findKeywordsInAllFrames(doc, types, keywords, context);}
    // if no matches to pattern, then maybe it contains an ordinal, e.g., "second textbox"
      var ordinalInfo;
      if (matches.length != 1) {
        ordinalInfo = extractOrdinalInfo(keywords);      
        if (ordinalInfo) {
          if (types == 'window') {matches = findWindowMatches([], ordinalInfo.keywords);}
          else {matches = findKeywordsInAllFrames(doc, types, ordinalInfo.keywords, context);}
        } else if (matches.length == 0) {
        return EMPTY_MATCH;
          } 
        }

    // select the highest-strength matches
    var bestMatches = [];
    var highestStrength = 0;
    for (var i = 0; i < matches.length; ++i) {
      var m = matches[i];
      if (m.strength > highestStrength) {
        bestMatches = [m];
        highestStrength = m.strength;
      } else if (m.strength == highestStrength) {
        bestMatches.push(m);
      }
    }

    // apply ordinalInfo, if it exists
    if (ordinalInfo) {
      if (ordinalInfo.ordinal > bestMatches.length) {
        // can't select the 5th textbox if there are only 4 textbox matches
        return EMPTY_MATCH;
      } else {
        // bestMatches is now an array of only one element
        bestMatches = [ bestMatches[ordinalInfo.ordinal - 1] ];
      }
    }

    
    // convert bestMatches into a Match iteration.
    // Since bestMatches may contain the same node several
    // times, filter it to use each node at most once.
    var lastMatch = EMPTY_MATCH;
    var marker = '_ChickenfootFound' + (NEXT_MARKER++);
     
    for (var i = bestMatches.length - 1; i >= 0; --i) {
      var m = bestMatches[i];
      var node = m.node; //will be a window object for findWindowMatches
      //debug(node.document.title);
      //debug(node.wrappedJSObject);  
      if (node[marker]) continue;
      node[marker] = true;
      if (node.window && node.window == node) {var match = winToMatch(node);}
      else {var match = nodeToMatch(node);}
      match._next = lastMatch;
      match._count = lastMatch.count + 1;
      match._index = i;
      lastMatch = match;
    }

    // clear all the flags we set above
    // doesn't work on FF 2.0, so we comment it out
    /*
    for (var i = bestMatches.length - 1; i >= 0; --i) {
      delete bestMatches[i].node.wrappedJSObject[marker];
    }
    */
    
    return lastMatch;
    }


  var NEXT_MARKER = 0;

  /**
   * These are the ordinals that should be recognized in additon to "Nth"
   */
  var recognizedOrdinals = {
    // TODO(mbolin): should "last" be recognized as well? how would it work?
    'first' : 1,
    'second' : 2,
    'third' : 3,
    'fourth' : 4,
    'fifth' : 5,
    'sixth' : 6,
    'seventh' : 7,
    'eighth' : 8,
    'ninth' : 9,
    'tenth' : 10,
    '1st' : 1,
    '2nd' : 2,
    '3rd' : 3
  };
  
  // build a regex that matches ordinals at the beginning of keyword patterns
  var ordinalStr = [];
  for (var ordinal in recognizedOrdinals) {
    ordinalStr.push(ordinal);
  }
  // regexp matches a string that starts with an ordinal such that the ordinal is terminated
  // by either a space or a word boundary, so it will match "second place" but not "secondhand store"
  var ordinalRe = new RegExp("^((\\d+)th|" + ordinalStr.join("|") + ")$", "i");

  /**
   * Given a keyword pattern, such as "1st button" or "third textbox",
   * find the value of the ordinal if one is found at the beginning of the pattern.
   * Ordinal values are 1-based, so for example, extractOrdinalInfo("third textbox")
   * would return 3 as the ordinal.
   *
   * If an ordinal is found, then an object is returned with two properties defined:
   * ordinal: the ordinal value as a positive integer 
   * keywords: Keywords object without the text that the ordinal contributed
   *
   * If no ordinal is detected, then extractOrdinalInfo() returns null.
   *
   * @param keywords Keywords 
   * @return null OR object with int ordinal and remaining keywords
   */  
  function extractOrdinalInfo(/*Keywords*/ keywords) {
    if (!keywords.length) return null;
    
    var m = keywords[0].match(ordinalRe);
    if (!m) return null;
    
    var n;
    if (m[2] && m[2].length) { // matches "Nth"
      n = parseInt(m[2], 10);
    } else if (m[1] in recognizedOrdinals) {
      n = recognizedOrdinals[m[1]];
    } else {
      Test.fail(keywords + " matched ordinalRe but not extractOrdinalInfo()");
    }
    Test.assert(n !== undefined, "n was not defined");    
    Test.assert(n > 0, "ordinal must resolve to a positive number");
    return {
      ordinal : n,
      keywords : keywords.derive(keywords.slice(1))
    };
  }
  
  function findIdMatches(/*InternalMatch[]*/ matches,
                         /*Document*/ doc,
                         /*Keywords*/ keywords, 
                         /*optional Range*/ context) {
    var element = doc.getElementById(keywords);
    // TODO: if (element && context), check if element is in context?
    if (element) matches.push(new InternalMatch(element, 1.0));
  }
  
  function findMenuMatches(/*InternalMatch[]*/ matches,
                           /*Document*/ doc,
                           /*Keywords*/ keywords,
                           /*optional Range*/ context) {
    findSelfLabeledNodes(matches, doc, keywords, isMenu, context);
    }
    
  function findMenuItemMatches(/*InternalMatch[]*/ matches,
                                 /*Document*/ doc,
                                 /*Keywords*/ keywords,
                                 /*optional Range*/ context) {
    findSelfLabeledNodes(matches, doc, keywords, isMenuItem, context);
    }
    
  function findTabMatches(/*InternalMatch[]*/ matches,
                                 /*Document*/ doc,
                                 /*Keywords*/ keywords,
                                 /*optional Range*/ context) {
    findSelfLabeledNodes(matches, doc, keywords, isTab, context);
    }
  /**
   * Finds each clickable-input match to pattern and adds
   * it to the matches array.
   */
  function findButtonMatches(/*InternalMatch[]*/ matches,
                             /*Document*/ doc,
                             /*Keywords*/ keywords, 
                             /*optional Range*/ context) {
    findSelfLabeledNodes(matches, doc, keywords, isClickable, context);
  }


  function findTextMatches(/*InternalMatch[]*/ matches,
                             /*Document*/ doc,
                             /*Keywords*/ keywords,
                             /*optional Range*/ context) {
    // return nothing if no pattern
    if (!keywords || !keywords.length) return;

    // findSelfLabeledNodes() is not appropriate here because it is difficult
    // to define an appropriate nodeFilter. We want to consider all textblobs
    // under the root node, but findSelfLabeledNodes() only matches one textblob
    // per node that matches the filter, whereas there may be multiple literal matches
    // under the root node.
    var root = getFindRoot(doc, context);    

    // TODO: use context, if appropriate
    var blobIterator = new TextBlobIterator(root);
    var blob;
    // TODO: for simple text, may occur more than once in a blob; need to match all instances    
    while (blob = blobIterator.next()) {
      var metric = keywords.match(blob.value);
      if (metric > STRENGTH_THRESHOLD) {
        var node = blob.getContainer();
        if (isVisible(node)) {matches.push(new InternalMatch(node, metric));}
      }
    }
  }
  
  /**
   * Finds each link match to pattern and adds
   * it to the matches array.
   */
  function findLinkMatches(/*InternalMatch[]*/ matches,
                           /*Document*/ doc,
                           /*Keywords*/ keywords,
                           /*optional Range*/ context) {

    findSelfLabeledNodes(matches, doc, keywords, isLink, context);
  }
  
  /**
   * Finds each textbox match to pattern and adds
   * it to the matches array.
   */
  function findTextboxMatches(/*InternalMatch[]*/ matches,
                              /*Document*/ doc,
                              /*Keywords*/ keywords,
                              /*optional Range*/ context) {
    findCaptionedNodes(matches, doc, keywords, isTextbox, TEXTBOX_FACTORS, context);
  }
  
  /**
   * Finds each checkbox match to pattern and adds
   * it to the matches array.
   */
  function findCheckboxMatches(/*InternalMatch[]*/ matches,
                               /*Document*/ doc,
                               /*Keywords*/ keywords,
                               /*optional Range*/ context) {
    if (instanceOf(doc, XULDocument)) { findSelfLabeledNodes(matches, doc, keywords, isCheckbox, context); }
    else { findCaptionedNodes(matches, doc, keywords, isCheckbox, CHECKBOX_FACTORS, context); }
  }
  
  /**
   * Finds each radiobutton match to pattern and adds
   * it to the matches array.
   */
  function findRadioButtonMatches(/*InternalMatch[]*/ matches,
                                  /*Document*/ doc,
                                  /*Keywords*/ keywords,
                                  /*optional Range*/ context) {
    if (instanceOf(doc, XULDocument)) { findSelfLabeledNodes(matches, doc, keywords, isRadioButton, context); }
    else { findCaptionedNodes(matches, doc, keywords, isRadioButton, CHECKBOX_FACTORS, context); }
  }
  
                                  

  /**
   * Finds each listbox match to pattern and adds
   * it to the matches array.
   */
  function findListboxMatches(/*InternalMatch[]*/ matches,
                              /*Document*/ doc,
                              /*Keywords*/ keywords,
                              /*optional Range*/ context) {
    if (instanceOf(doc, XULDocument)) {
      selfLabeled = findSelfLabeledNodes(matches, doc, keywords, isListbox, context);
        if (selfLabeled == null) {
          return findCaptionedNodes(matches, doc, keywords, isListbox, LISTBOX_FACTORS, context);}
        else {return selfLabeled} }
    else { return findCaptionedNodes(matches, doc, keywords, isListbox, LISTBOX_FACTORS, context); }
  }
  
  /**
   * Finds each listitem match to pattern and adds
   * it to the matches array.
   */
  function findOptionMatches(/*InternalMatch[]*/ matches,
                             /*Document*/ doc,
                             /*Keywords*/ keywords,
                             /*optional Range*/ context) {
    return findSelfLabeledNodes(matches, doc, keywords, isListitem, context)
  }

  /**
   * Find elements that are self-labeling (such as buttons or links or menus).
   * 
   */
  function findSelfLabeledNodes(/*InternalMatch[]*/ matches,
                                /*Document*/ doc,
                                /*Keywords*/ keywords, 
                                /*function(node)->boolean*/ nodeTypeFilter,
                                /*optional Range*/ context) {
    var root = getFindRoot(doc, context); 
    var filter = makeFilter(nodeTypeFilter, context);
    var nodeIterator = findElements(root, filter);
    // if no pattern specified, return all nodes of the specified type
    if (!keywords || !keywords.length) {
      if (Pattern.debugPatternMatching) debug("returning all nodes of specified type");
      var node = nodeIterator.nextNode();
      while (node) {
        matches.push(new InternalMatch(node, 0));
        node = nodeIterator.nextNode();
      }
      if (Pattern.debugPatternMatching) debug("found " + matches.length + " such nodes");
    } else {
      var node = nodeIterator.nextNode();
      while (node) {
        var blobIterator = new TextBlobIterator(node);
        var blob = null;
        while (blob = blobIterator.next()) {
          var metric = keywords.match(blob.value);
          //debug(node.tagName + " " + node.label + " " + metric);
          if (metric > STRENGTH_THRESHOLD) {
            matches.push(new InternalMatch(node, metric));
            break;
          }
        }
          node = nodeIterator.nextNode();
      }
    }
  }
  
  function findWindowMatches(/*InternalMatch[]*/ matches,
                             /*Keywords*/ keywords) {
    var winMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                      .getService(Components.interfaces.nsIWindowMediator);
    var winIterator = winMediator.getZOrderDOMWindowEnumerator("", true);
    if (!keywords || !keywords.length) {
      while (winIterator.hasMoreElements()) {
        var win = winIterator.getNext();
        var im = new InternalMatch(win, 0);
        matches.push(im); }
    }
    else {
      while (winIterator.hasMoreElements()) {
        var win = winIterator.getNext();
        var textToSearch = win.document.title;
        var metric = keywords.match(textToSearch);
        if (metric > STRENGTH_THRESHOLD) {
         //debug(win.document.title);
          var im = new InternalMatch(win, metric);
          matches.push(im); }
      }
    }
    return matches;
  }
  
  /**
   * Find input elements (textboxes, checkboxes, radiobuttons)
   * by looking for keywords in nearby labels.
   * 
   */
  function findCaptionedNodes(
                      /*InternalMatch[]*/ matches,
                      /*Document*/ doc,
                      /*Keywords*/ keywords, 
                      /*function(node)->boolean*/ nodeTypeFilter,
                      /*map{left,right,above,below}*/ matchFactors,
                      /*optional Range*/ context) {
    // search only down inside context
    var root = getFindRoot(doc, context);
    var filter = makeFilter(nodeTypeFilter, context);

    // collect all nodes of the specified type in an array, since
    // we may have to iterate over them several times
    var nodes = [];  
    var nodeIterator = findElements(root, filter)
    var node = nodeIterator.nextNode();
    while (node) {
      nodes.push(node);
      node = nodeIterator.nextNode();
    }
    
   //if no pattern specified, return all nodes of the specified type
    if (!keywords || !keywords.length) {
    if (Pattern.debugPatternMatching) debug("returning all nodes of specified type");
      for (var i = 0; i < nodes.length; ++i) {
        var node = nodes[i];
        matches.push(new InternalMatch(node, 0));
     }
     if (Pattern.debugPatternMatching) debug("found " + matches.length + " such nodes");
     
      return matches;
    }

/* Now handled by findFieldsByInternalName    
    // look for form element with exact name
    nodes = info.getFormElements(pattern);
    for (var i = 0; i < nodes.length; i++) {
      if (filter(nodes[i])) {
        matches.push(new InternalMatch(nodes[i], 3));
      }
    }
*/

    // now look for text blobs that heuristically
    // match the pattern
    matchingBlobs = [];
    var blobIterator = new TextBlobIterator(root);
    var blob = null;
    while (blob = blobIterator.next()) {
      if (Pattern.debugPatternMatching) debug("testing text blob: " + blob);
      var metric = keywords.match(blob.value);
      if (metric <= STRENGTH_THRESHOLD) continue;
      if (Pattern.debugPatternMatching) debug("matched with strength " + metric);
      
      // Found a matching text blob.
      // Now find input elements that might be associated with it.
      
      // First, see if blob is inside a LABEL element.
      var label = findLabelContaining(blob.firstNode);
      if (label != null) {
        var node = doc.getElementById(label["for"]);
        if (node != null && filter(node)) {
          if (Pattern.debugPatternMatching) debug("best match is labeled node: " + node);
          matches.push(new InternalMatch(node, LABEL_FACTOR * metric));
          continue;
        }
      }
    
      // otherwise, use the blob's position on the page to
      // find the closest input element to it
      var boxLabel = ckft.dom.Box.forNode(blob.firstNode);
      if (Pattern.debugPatternMatching) debug("boxLabel=" + boxLabel);
      
      // while we're iterating through the nodes,
      // keep track of the single best candidate for this text blob    
      var bestNode = null;
      var bestStrength = 0;
      function maximizeMatch(node, strength) {
          if (strength > bestStrength) {
            bestNode = node;
            bestStrength = strength;
          }
      }
      
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];

        // Next, see if blob is nested inside the node itself (e.g., SELECT elements).
        if (goog.dom.contains(node, blob.firstNode)) {
          if (Pattern.debugPatternMatching) debug("found blob " + blob + " nested inside " + node);
          bestStrength = NESTED_FACTOR;
          bestNode = node;
          break;
        }
        
        var boxNode = ckft.dom.Box.forNode(node);
        if (Pattern.debugPatternMatching) debug("boxNode=" + boxNode);

        // search for a relationship between boxLabel and boxNode, with increasing
        // amounts of tolerance.
        var relation;
        var tolerance;
        relation = boxLabel.relatedTo(boxNode,tolerance=-5);
        if (!relation) relation = boxLabel.relatedTo(boxNode,tolerance=0);
        if (!relation) relation = boxLabel.relatedTo(boxNode,tolerance=5);        
        if (!relation || relation == "intersects") continue;
        
        var distance, overlap;
        switch (relation) {
          case "left":
            distance = computeDistance(boxNode.x1, boxLabel.x2);
            overlap = computeOverlap(boxNode.y1, boxNode.y2, boxLabel.y1, boxLabel.y2);
            break;
          case "right":
            distance = computeDistance(boxLabel.x1, boxNode.x2);
            overlap = computeOverlap(boxNode.y1, boxNode.y2, boxLabel.y1, boxLabel.y2);               
            break;
          case "above":
            distance = computeDistance(boxNode.y1, boxLabel.y2);
            overlap = computeOverlap(boxNode.x1, boxNode.x2, boxLabel.x1, boxLabel.x2);
            break;
          case "below":
            distance = computeDistance(boxNode.y1, boxLabel.y2);
            overlap = computeOverlap(boxNode.x1, boxNode.x2, boxLabel.x1, boxLabel.x2);               
            break;
        }
        
        var strength = 0;
        strength += KEYWORD_FACTOR * metric;
        strength += POSITION_FACTOR * matchFactors[relation];
        strength += DISTANCE_FACTOR * distance;
        strength += OVERLAP_FACTOR * overlap;
        if (Pattern.debugPatternMatching) debug(relation + " distance=" + distance + " overlap=" + overlap + " strength=" + strength + " " + flattenDom(node)[0]);
        maximizeMatch(node, strength);        
      }
  
      // take the closest node and add it as a match    
      if (bestNode != null) {
          if (Pattern.debugPatternMatching) debug("best match is " + bestStrength + " " + flattenDom(bestNode)[0]);
          matches.push(new InternalMatch(bestNode, bestStrength));
      }
    }  
  
    // computes strength as an inverse function of distance between two pixel coordinates;
    // 0 == infinite pixel distance, 1 = 0 pixel distance
    function computeDistance(a, b) {
      var diffPixels = (a < b) ? (b-a) : (a-b);
      var dist = 1 - (diffPixels / 400);
      if (dist < 0) dist = 0;
      return dist;
    }
    
    // computes fraction of [c,d] that is overlapped by [a,b]
    //    e.g. computeOverlap(0,4,  -2, 1)  = 0.333   since [0,4] and [-2,1] intersect in [0,1] whose
    //         length is one third of [-2,1]'s length
    function computeOverlap(a,b,  c,d) {
      var maxAC = (a < c) ? c : a;
      var minBD = (b < d) ? b : d;
      return (minBD - maxAC) / (d-c);
    }
      
    // returns <LABEL> element containing given node, or null if none
    function findLabelContaining(node) {
      while (node != null && upperCaseOrNull(node.tagName) != "LABEL") {
        node = node.parentNode;
      }
      return node;
    }
    
    
  } // closing brace for findCaptionedNodes

  // filter out nodes that are invisible or outside the context
  function makeFilter(/*Node->boolean*/ nodeTypeFilter, /*optional Range*/ context) {
    function visibleFilter(node) { 
      return nodeTypeFilter(node) && isVisible(node); 
    };
    if (!context) return visibleFilter;
    
    function contextFilter(node) {
      return visibleFilter(node) && isNodeInRange(node, context);
    }
    return contextFilter;
  }
  
  function isBetween(lower, middle, upper) {
    return (lower <= middle && middle <= upper);
  }
  
  /**
   * Finds forms and adds them to matches array.
   */  
  function findForms(/*InternalMatch[]*/ matches, 
                     /*Document*/ doc, 
                     /*Keywords*/ keywords,
                     /*optional Range*/ context) {
    var forms = doc.forms;
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      var range = nodeToRange(form);
      var strength = keywords.match(range.toString());
      matches.push(new InternalMatch(form, strength));
    }
  }

  function findTables(/*InternalMatch[]*/ matches,
                      /*Document*/ doc,
                      /*String*/ pattern,
                      /*optional Range*/ context) {
    var root = getFindRoot(doc, context);
    var tables = root.getElementsByTagName('table');
    for (var i = 0; i < tables.length; ++i) {
      var table = tables[i];
      matches.push(new InternalMatch(table, 1.0));
    }
  }
  
  function findRows(/*InternalMatch[]*/ matches,
                      /*Document*/ doc,
                      /*String*/ pattern,
                      /*optional Range*/ context) {
    var root = getFindRoot(doc, context);
    if (upperCaseOrNull(root.tagName) != 'TABLE') throw new Error("cannot look for rows if not a table");
    var rows = root.rows;
    for (var i = 0; i < rows.length; ++i) {
      matches.push(new InternalMatch(rows[i], 1.0));
    }
  }

  function findCells(/*InternalMatch[]*/ matches,
                    /*Document*/ doc,
                    /*String*/ pattern,
                    /*optional Range*/ context) {
    var root = getFindRoot(doc, context);
    if (upperCaseOrNull(root.tagName) != 'TR') throw new Error("cannot look for cells if not a row");
    var cells = root.cells;
    for (var i = 0; i < cells.length; ++i) {
      matches.push(new InternalMatch(cells[i], 1.0));
    }
  }
  
  /**
   * Given a match for a cell, returns as successive matches
   * intersecting cells below the cell originally matched.
   */
  function findColumns(/*InternalMatch[]*/ matches,
                      /*Document*/ doc,
                      /*String*/ pattern,
                      /*optional Range*/ context) {
    var root = getFindRoot(doc, context);
    if (upperCaseOrNull(root.tagName) != 'TD') throw new Error("need a cell to get its column")

    var targetRow = Table.getParentRow(root);
    var sib = Table.getNextRow(targetRow);
    while(sib != null){
      matched = Table.returnSimilar(root,sib)
      if(matched != null) matches.push(new InternalMatch(matched, 1));
      sib = Table.getNextRow(sib)
    }
  }
  
  /**
   * Finds images and adds them to matches array.
   */  
  function findImages(/*InternalMatch[]*/ matches, 
                     /*Document*/ doc, 
                     /*Keywords*/ keywords,
                     /*optional Range*/ context) {
    findCaptionedNodes(matches, doc, keywords, isSignificantImage, IMAGE_FACTORS, context);
  }

  /**
   * 
   */
  function getFindRoot(/*Document*/ doc, /*optional Range*/ context) {
  if (context) {return rangeToContainer(context);}
    else if (doc.body) {return doc.body;}
    else if (instanceOf(doc, XULDocument)) {return doc;}
    else {return doc.documentElement;}
  }
  
//  function findInAllFrames(/*Document*/doc, /*Match Object*/ matches) {
//  //TODO:also look for iframes
//    if (doc.getElementsByTagName('browser') == 0) {return matches;}
//    else {
//      var allFrames = doc.getElementsByTagName('browser');
//      for (var i=0; i<allFrames.length; i++) {
//        tempMatches = find(/*Document*/ allFrames[i], /*pattern*/ pattern, /*types*/ types, /*context*/ context);
//        for (var j=0; j<tempMatches.length; j++) {
//          matches.push(tempMatches[j]);
//        }
//      }
//      return matches;
//    }
//  }
}

// initialize this package
Pattern();


/**
 * Represents a potential pattern match
 */
function InternalMatch(/*Node*/node, /*number*/ strength) {
  this.node = node;
  this.strength = strength;
}

InternalMatch.prototype.toString = function() {
  return '[' + this.strength.toFixed(2)
             + ': ' + this.node
             +' ]';
}

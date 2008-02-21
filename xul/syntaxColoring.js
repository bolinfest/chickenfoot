/**
 * Functions for syntax coloring.
 */
 function isSyntaxColoring() {
  var prefs = Chickenfoot.getPrefBranch();
  try {
    return prefs.getBoolPref("syntaxColor");
  } catch (e) {
    var defaultValue = false;
    prefs.setBoolPref("syntaxColor", defaultValue);
    return defaultValue;
  }
}

 
 /**
 * If syntaxColor is on and the event is not a ctrl, or ctrl+m, look at the anchor
 * and focus to see if it is a case of regular syntax coloring or just autoIndent
 * 
 *  returns void
 */
 function syntaxColorEvent(event) {
	 if(Chickenfoot.getPrefBranch().getBoolPref("syntaxColor")){
	 	if (event.keyCode !=16 && event.keyCode !=17 && event.keyCode !=34 && event.keyCode !=37 && event.keyCode !=38 && event.keyCode !=34) {//don't activate on shift, control, and the 4 arrow keys
	 		//debug(event.keyCode);
	 		var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
	    	var anchorNodeCaret = sbwin.getSelectedBuffer().api.selection.anchorNode;
	    	var anchorOffsetCaret = sbwin.getSelectedBuffer().api.selection.anchorOffset;
	    	var focusNodeCaret = sbwin.getSelectedBuffer().api.selection.focusNode;
	    	var focusOffsetCaret = sbwin.getSelectedBuffer().api.selection.focusOffset;
	    	
	    	if(anchorNodeCaret==focusNodeCaret &&anchorOffsetCaret==focusOffsetCaret){
	    		regularSyntaxColoringAndAutoIndent(event);
	    	}else{
	    		selectionAutoIndent(event);
	    	}
	    	
	 	}
	}
}

/**
 * Syntax-color text after every keystroke.  First get the cursor position,
 * then count how many characters and carrige returns in the cursor was,
 * then take out all spans then recolor the text, then replace the caret 
 * by counting characters again. This is followed by autoIndent if the event was 
 * a return, }, or control mask + m, which has some furthur caret placement
 *
 *  returns void
 */
function regularSyntaxColoringAndAutoIndent(event){

 		var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
    	var ed = sbwin.getSelectedBuffer().editor;
    	var doc = ed.contentDocument;
    	var pre = doc.getElementById("pre");   
    	var anchorNodeCaret = sbwin.getSelectedBuffer().api.selection.anchorNode;
    	var anchorOffsetCaret = sbwin.getSelectedBuffer().api.selection.anchorOffset;
      	
    	//count characters
    	var chars=0;
    	/*
    	if (event.keyCode ==13 & anchorNodeCaret.nodeName=="SPAN") {
    		debug("charCount SPAN BR");
    		chars=charCountSpanBr(anchorNodeCaret,pre.childNodes);
    	}else{
    		chars=charCount(anchorNodeCaret,anchorOffsetCaret,pre.childNodes);
    	}*/
    	chars=charCount(anchorNodeCaret,anchorOffsetCaret,pre.childNodes);
    	
     	//eliminate spans, specifically:
     	//<span style="color: blue;">
     	//<span style="color: purple;">
		//<span style="color: green;">
		//</span>
		
		var spanRegEx = /(<span style="color: purple;">|<span style="color: blue;">|<span style="color: green;">|<\/span>)/gm;
    	
    	pre.innerHTML=pre.innerHTML.replace(spanRegEx,"");
    	//recolor
    	syntaxColor(pre, CF_JAVASCRIPT_RULES); 
    	
		//replace caret
		caretPlacement(chars,pre,sbwin);
		
		//autoIndent : only on return, } , and ctrl+tab
    	var pre2 = doc.getElementById("pre"); 
    	//debug('event.keyCode');
    	//debug(event.keyCode);
    	//if(false){
    	if(event.keyCode==13||event.keyCode==221||(event.ctrlKey && event.keyCode==9)){
    		var lines = makeLines(pre2);
    		//debug('lines');
    		//debug(lines);
    		for (i in lines){
    		//debug(lines[i]);
    		}
    		var anchorNodeCaret2 = sbwin.getSelectedBuffer().api.selection.focusNode;
    		var anchorOffsetCaret2 = sbwin.getSelectedBuffer().api.selection.focusOffset;
   			var lineNum=findNodeInLines(lines,anchorNodeCaret2,anchorOffsetCaret2);
   			//debug('lineNum= '+lineNum);
			//this is how many spaces we need to indent our line by
			
			if (lines[lineNum][0].parentNode.nodeName=="SPAN"){
				//do nothing
				//debug('inside a span node, dont change indent');
			}else{
				var indents=calculateIndents(lines,lineNum);
				
				//debug('INDENTS: '+indents)
				/*
				debug("event.keycode");
				debug(lines[lineNum]);
				debug(doc);
				debug(pre);
				debug(sbwin);
				debug(anchorNodeCaret2);
				debug(anchorOffsetCaret2);
				debug("event.keycode");
				*/
				//debug("changeIndent");
				changeIndent(lines[lineNum],indents,doc,pre,sbwin,anchorNodeCaret2,anchorOffsetCaret2);
			}
		}
		/*
		var pre2 = doc.getElementById("pre");  
    	var anchorNodeCaret2 = sbwin.getSelectedBuffer().api.selection.focusNode;
    	var anchorOffsetCaret2 = sbwin.getSelectedBuffer().api.selection.focusOffset;
		
		debug('pre');
    	debug(pre.childNodes);
    	debug(anchorNodeCaret2.data+"+end");
    	debug(anchorNodeCaret2);
    	debug(anchorOffsetCaret2);
    	//debug(pre.innerHTML)
    	*/
    	//debug("FINISHED");
    	
 	
}

function selectionAutoIndent(event){

 		var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
    	var ed = sbwin.getSelectedBuffer().editor;
    	var doc = ed.contentDocument;
    	var pre = doc.getElementById("pre");   
    	var anchorNodeCaret = sbwin.getSelectedBuffer().api.selection.anchorNode;
    	var anchorOffsetCaret = sbwin.getSelectedBuffer().api.selection.anchorOffset;
     	
    	//count characters
    	var chars=0;
    	//debug(event.keyCode);
    	//debug(anchorNodeCaret.parentNode.nodeName);
    	//if (event.keyCode ==13 & anchorNodeCaret.nodeName=="SPAN") {
    		//debug("charCount SPAN BR");
    		//chars=charCountSpanBr(anchorNodeCaret,pre.childNodes);
    		//chars=charCount(anchorNodeCaret,anchorOffsetCaret,pre.childNodes);
    	//}else{
    		chars=charCount(anchorNodeCaret,anchorOffsetCaret,pre.childNodes);
    	//}
    	
    	/*
    	debug("charCount");
    	debug(chars);
    	debug("pre.innerHTML");
    	debug(pre.innerHTML);
    	*/
    	
    	
     	//eliminate spans, specifically:
     	//<span style="color: blue;">
     	//<span style="color: purple;">
		//<span style="color: green;">
		//</span>
		
		var spanRegEx = /(<span style="color: purple;">|<span style="color: blue;">|<span style="color: green;">|<\/span>)/gm;
    	//debug("replace innerHTML");
    	//debug(pre.innerHTML.replace(spanRegEx,""));
    	pre.innerHTML=pre.innerHTML.replace(spanRegEx,"");
    	//recolor
    	syntaxColor(pre, CF_JAVASCRIPT_RULES); 
    	
    	
		//replace caret
		caretPlacement(chars,pre,sbwin);
		
		//autoIndent : only on return, } , and alt
    	var pre2 = doc.getElementById("pre"); 
    	
    	if(event.keyCode==13||event.keyCode==221||(event.ctrlKey && event.keyCode==9)){
    		var lines = makeLines(pre2);
    		//debug('lines');
    		//debug(lines);
    		var anchorNodeCaret2 = sbwin.getSelectedBuffer().api.selection.focusNode;
    		var anchorOffsetCaret2 = sbwin.getSelectedBuffer().api.selection.focusOffset;
   			var lineNum=findNodeInLines(lines,anchorNodeCaret2,anchorOffsetCaret2);
   			//debug('lineNum= '+lineNum);
			//this is how many spaces we need to indent our line by
			var indents=calculateIndents(lines,lineNum);
			changeIndent(lines[lineNum],indents,doc,pre,sbwin,anchorNodeCaret2,anchorOffsetCaret2);
		}
		
		
		
		
		/*
		var pre2 = doc.getElementById("pre");  
    	var anchorNodeCaret2 = sbwin.getSelectedBuffer().api.selection.focusNode;
    	var anchorOffsetCaret2 = sbwin.getSelectedBuffer().api.selection.focusOffset;
		
		debug('pre');
    	debug(pre.childNodes);
    	debug(anchorNodeCaret2.data+"+end");
    	debug(anchorNodeCaret2);
    	debug(anchorOffsetCaret2);
    	//debug(pre.innerHTML)
    	*/
    	//debug("FINISHED");
    	
 	
}
/*
*Creates a count of the number of text characters and carridge returns 
*at before and before the given n, offset. 
*
*/
function charCount(n,offset,nodes){
	//debug("counting chars function");
	//debug(n);
	//debug(offset);
	var node;
	var off;
	if(n.nodeName=="PRE"){
		//debug("PRE");
		node=n.childNodes[offset];
		off=0;
	}else{
		node=n;
		off=offset;
	}
	//debug(node);
	//debug(offset);
	var count=0;
	var currNodeNum=0;
	var len=nodes.length;
	while(currNodeNum<len){
	/*
		debug("while");
		debug("currNodeNum "+currNodeNum);
		debug("total num nodes "+len);
		debug("count "+count);
		debug("nodes[currNodeNum] ");
		debug(nodes[currNodeNum] );
		debug("node ");
		debug(node);
		*/
		//if the current node is a span, we want to look inside it for the node we are looking
		//for
		if(nodes[currNodeNum].nodeName=="SPAN"){
			//debug("thiss is the SPAN node");
			var c=spanCharCount(n,offset,nodes[currNodeNum].childNodes);
			//debug(c);
			if(c[0]==true){
				//debug("c[0]==true");
				return count+c[1];
			}else{
				//debug("c[0]==false");
				count=count+c[1];
				currNodeNum++;
			}
		}
		if(nodes[currNodeNum]==node){
			//debug("thiss is the node");
			//debug("off= "+off);
			return count+off;
			//break;		
		}else{
			//debug("increment count");
			//debug(nodes[currNodeNum].nodeName);
			
			if(nodes[currNodeNum].nodeName=="SPAN"){
				//debug("span node add "+nodes[currNodeNum].firstChild.nodeValue.length);
				count=count+nodes[currNodeNum].firstChild.nodeValue.length;
			}
			if(nodes[currNodeNum].nodeName=="#text"){
				//debug("text node add "+nodes[currNodeNum].nodeValue.length);
				count=count+nodes[currNodeNum].nodeValue.length;
			}
			if(nodes[currNodeNum].nodeName=="BR"){
				//debug("br node add 1");
				count=count+1;
			}
			currNodeNum++;
		}
		
	}
	//debug("charCount found NO NODE");
	//most likely this is running because the user pressed and arrow at the end
	//of the text which returned a node,offset of one greater than actually exists,
	//so I just subtract one!
	return count+off-1;
}
/*
*Creates a count of the number of text characters and carridge returns 
*at before and before the given n, offset within the given span. 
*
*/
function spanCharCount(n,offset,nodes){
	/*debug("doing spanCharCount");
	debug("node");
	debug(n);
	debug("off");
	debug(offset);
	*/
	
	
	var node;
	var off;
	
	if(n.nodeName=="PRE"){
		//debug("nodes[0].parentNode");
		//debug(nodes[0].parentNode);
		//debug(n.childNodes[offset]);
		if(nodes[0].parentNode==n.childNodes[offset]){
			//debug("spanCharCount PRE");
			node=n.childNodes[offset];
			off=0;
			var retT=new Array(true,0)
			return retT;
		}
	}
	
	if(n.nodeName=="SPAN"){
		//debug("SPAN");
		if(offset==n.childNodes.length){
			node=n.childNodes[offset-1];
			off=0;
			//debug("SPAN");
		}else{
			node=n.childNodes[offset];
			off=0;
		}
	}else{
		node=n;
		off=offset;
	}
	var count=0;
	var currNodeNum=0;
	var len=nodes.length;
	while(currNodeNum<len){
	
	
	/*
		debug("while");
		debug("currNodeNum "+currNodeNum);
		debug("total num nodes "+len);
		debug("count "+count);
		debug("nodes[currNodeNum] ");
		debug(nodes[currNodeNum] );
		
		
		debug("node ");
		debug(node);
		debug("off");
		debug(off);
		*/
		if(nodes[currNodeNum]==node){
			//debug("thiss is the node");
			//debug("off= "+off);
			if(nodes[currNodeNum].nodeName=="BR"){
				//debug("end on a BR");
				if(n.nodeName=="SPAN"){
					//debug("a BR in a SPAN");
					if(n.style.getPropertyValue('color')=='blue'){
						//debug("blue - count=count+1");
						//do not increment count by 1
						if(node=n.childNodes[offset]){
							//do not increment
							//if this is the node and its a BR and it is the SPAN
							//then dont increment.  it is already accounted for in there being
							//an extra BR in the SPAN.
							//debug("do not increment count by 1, it is already accounted for");
						}else{
							count=count+1;
						}
					}else{
						//do not increment count by 1
						//debug("NOT blue do not increment count by 1");
					}
				}else{
					count=count+1
				}
			}
			var retT=new Array(true,count+off)
			return retT;
			//break;		
		}else{
			//debug("increment count");
			//debug(nodes[currNodeNum].nodeName);
			
			if(nodes[currNodeNum].nodeName=="SPAN"){
				//debug("span node add "+nodes[currNodeNum].firstChild.nodeValue.length);
				count=count+nodes[currNodeNum].firstChild.nodeValue.length;
			}
			if(nodes[currNodeNum].nodeName=="#text"){
				//debug("text node add "+nodes[currNodeNum].nodeValue.length);
				count=count+nodes[currNodeNum].nodeValue.length;
			}
			if(nodes[currNodeNum].nodeName=="BR"){
				//debug("br node add 1");
				count=count+1;
			}
			currNodeNum++;
		}
		
	}
	
	//debug("spanCharCount did not contain node");
	var retF=new Array(false,count)
	return retF;
}
/**
*When enter is pressed within a SPAN a special character count is needed. 
*
*
*/
function charCountSpanBr(span,nodes){
	//debug("counting chars");
	
	var node=span;
	var spanText=span.firstChild.data;
	//debug("spanText");
	//debug(spanText);
	var count=0;
	var currNodeNum=0;
	var len=nodes.length;
	while(currNodeNum<len){
	/*
		debug("while");
		debug("currNodeNum "+currNodeNum);
		debug("total num nodes "+len);
		debug("count "+count);
		debug("nodes[currNodeNum] ");
		debug(nodes[currNodeNum] );
		debug("node ");
		debug(node);
		*/
		if(nodes[currNodeNum]==node){
			//debug("thiss is the node");
			//debug("span text = "+spanText);
			return count+spanText.length+1;
			//break;		
		}else{
			//debug("increment count");
			//debug(nodes[currNodeNum].nodeName);
			
			if(nodes[currNodeNum].nodeName=="SPAN"){
				//debug("span node add "+nodes[currNodeNum].firstChild.nodeValue.length);
				count=count+nodes[currNodeNum].firstChild.nodeValue.length;
			}
			if(nodes[currNodeNum].nodeName=="#text"){
				//debug("text node add "+nodes[currNodeNum].nodeValue.length);
				count=count+nodes[currNodeNum].nodeValue.length;
			}
			if(nodes[currNodeNum].nodeName=="BR"){
				//debug("br node add 1");
				count=count+1;
			}
			currNodeNum++;
		}
		
	}
	//debug("charCount found NO NODE");
	return count;
}

/*
*Creates a count of the number of text characters and carridge returns 
*at before and before the given n, offset. 
*
*/
function caretPlacement(charCount,pre,sbwin1){
	//debug("do replace; "+charCount);
	var nodes=pre.childNodes;
	var sel=sbwin1.getSelectedBuffer().api.selection;
	if(charCount==0){
		sel.collapse(pre,0);
	}
	var count=charCount;
	var currNodeNum=0;
	var len=pre.childNodes.length;
	while(currNodeNum<len){
		if(charCountLength(nodes[currNodeNum])<count){
			count=count-charCountLength(nodes[currNodeNum]);
			currNodeNum++;	
		}
		if(charCountLength(nodes[currNodeNum])==count){
			//debug("== case");
			//debug(nodes[currNodeNum].nodeName);
			if(nodes[currNodeNum].nodeName=="SPAN"){
				//debug("span node add "+nodes[currNodeNum].firstChild.nodeValue.length);
				//count=count+nodes[currNodeNum].firstChild.nodeValue.length;
				var withinSpanCount=count;
				var spanKids=nodes[currNodeNum].childNodes;
				for(i=0;i<spanKids.length;i++){	
					//debug(spanKids[i]);
					if(spanKids[i].nodeName=="#text"){
						if(spanKids[i].nodeValue.length>=withinSpanCount){
							//debug(spanKids[i]);
							sel.collapse(spanKids[i],withinSpanCount);
							break;
						}else{
							withinSpanCount=withinSpanCount-spanKids[i].nodeValue.length;
						}
					}
					if(spanKids[i].nodeName=="BR"){
						if(1>withinSpanCount){
							sel.collapse(nodes[currNodeNum],i);
							break;
						}else{
							//debug("amother br mode");
							//debug(withinSpanCount-1);
							withinSpanCount=withinSpanCount-1;
						}
					}
				}
			}
			if(nodes[currNodeNum].nodeName=="#text"){
				//debug("text node add "+nodes[currNodeNum].nodeValue.length);
				sel.collapse(nodes[currNodeNum],nodes[currNodeNum].nodeValue.length);
			}
			if(nodes[currNodeNum].nodeName=="BR"){
				//debug("br node ");
				if(currNodeNum<len){
					sel.collapse(pre,currNodeNum+1);
				}else{
					sel.collapse(pre,currNodeNum);
				}
			}
			break;
		}
		
		if(charCountLength(nodes[currNodeNum])>count){
			//debug("> case");
			//debug(nodes[currNodeNum].nodeName);
			
			if(nodes[currNodeNum].nodeName=="SPAN"){
				//debug("span node add "+nodes[currNodeNum].firstChild.nodeValue.length);
				//count=count+nodes[currNodeNum].firstChild.nodeValue.length;
				var withinSpanCount=count;
				var spanKids=nodes[currNodeNum].childNodes;
				for(i=0;i<spanKids.length;i++){
					//debug(spanKids[i]);
					if(spanKids[i].nodeName=="#text"){
					
						//debug("#text");
						//debug(spanKids[i].nodeValue);
						//debug(withinSpanCount);
						if(spanKids[i].nodeValue.length>=withinSpanCount){
							//debug("this text mode");
							//debug(spanKids[i]);
							//debug(withinSpanCount);
							
							sel.collapse(spanKids[i],withinSpanCount);
							break;
						}else{
							//debug("amother text mode");
							//debug(withinSpanCount-spanKids[i].nodeValue.length);
							withinSpanCount=withinSpanCount-spanKids[i].nodeValue.length;
						}
					}
					if(spanKids[i].nodeName=="BR"){
						if(1>withinSpanCount){
							sel.collapse(nodes[currNodeNum],i);
							break;
						}else{
							//debug("amother br mode");
							//debug(withinSpanCount-1);
							
							withinSpanCount=withinSpanCount-1;
						}
					}
				}
			
			}
			if(nodes[currNodeNum].nodeName=="#text"){
				//debug("text node ");
				//count=count+nodes[currNodeNum].nodeValue.length;
				sel.collapse(nodes[currNodeNum],count);
			}
			if(nodes[currNodeNum].nodeName=="BR"){
				//debug("text node add "+nodes[currNodeNum].nodeValue.length);
				//count=count+1;
				sel.collapse(pre,currNodeNum);
			}
			break;
		}
	}
}

function charCountLength(node){
	if(node.nodeName=="#text"){
		return node.nodeValue.length
	}
	if(node.nodeName=="SPAN"){
		//debug("charCountLength-SPAN");
		var n=node.childNodes;
		//debug(n);
		var count=0;
		for(i=0;i<n.length;i++){
			//debug(i);
			if(n[i].nodeName=="#text"){
				//debug(i);
				count=count+n[i].nodeValue.length;
				//debug(i);
			}
			if(n[i].nodeName=="BR"){
				count=count+1;
			}
		}
		return count;
	}
	if(node.nodeName=="BR"){
		return 1;
	}

}

/**
 * Syntax-color all text under node.
 *    node   DOM node whose descendents should be syntax-colored
 *    rules  array of rules made with makeRule()
 *
 *  returns void
 */
function syntaxColor(node, rules) {
  // rip out the text from node & put it back
  
  var ranges = findPatterns(node, rules);
  //debug(ranges);
  //for (p in ranges) //debug(ranges[p]);
  	//debug(ranges[p]);
  	applyRules(ranges);
 
}

/**
 * Find a sequence of text ranges that match the rule patterns.
 * Patterns are matched in a left-to-right scan of the text under
 * node.  The earliest match is used; if two rules match at the 
 * same location, the longest match is used; in case of ties, the rule
 * appearing earlier in the rules array takes priority.
 *
 *     node    DOM node whose descendent text nodes should be matched
 *     rules   array of syntax-coloring rules
 *
 *  returns array of Range objects, where each Range object has an
 *    "matchingRule" property storing the rule that matched it.
 */
function findPatterns(node, rules) {
  var doc = node.ownerDocument;

  // make a string from the text nodes underneath node
  var text = getText(node);

  // ranges will be our returned array
  var ranges = new Array();
  
  // iterate over the text nodes, so we can convert pattern match
  // indexes into Ranges
  var iter = new TextIterator(node);
  
  while (true) {
    var minIndex = text.length;
    var maxLength = 0;
    var matchingRule = -1;
    for (p in rules) {
    
      result = rules[p].exec(text);
      
      //debug(rules[p] + " matched " + result);
      if (result != null
          && (result.index < minIndex
             || (result.index == minIndex 
                  && result.length > maxLength))) {
                  
        minIndex = result.index;
        maxLength = result[0].length;
        matchingRule = p;
      }
    }

    if (matchingRule < 0) {
      break;
    }

    // set [start,end] to earliest, longest match
    start = minIndex;
    end = minIndex + maxLength;
    // make a Range from [start,end]
    var r = iter.makeRange(start, end);
    r.matchingRule = rules[matchingRule];

    //debug(r + " matches " + rules[matchingRule]);
                                          
    ranges.push(r);

    // reset all rules
    for (p in rules) {
      rules[p].lastIndex = end;
    }
  }
//end while
  return ranges; 
}

/**
 * Uses a TextIterator to concatenate all the text nodes under node
 * into a single string.
 *
 *   node    DOM node
 * 
 *   returns string
 */
function getText(node) {
  var sb = new Chickenfoot.StringBuffer();  
  var iter = new TextIterator(node, NodeFilter.SHOW_TEXT);
  while (iter.next() != null) {
    sb.append(iter.text);
  }
  return sb.toString();
}

/**
 * Apply syntax-coloring styles to an array of Ranges.
 *
 *    ranges  array of Ranges to receive coloring.  Each
 *            Range should have a "matchingRule" property
 *            referring to its syntax rule.
 *
 *   modifies DOM nodes addressed by ranges
 *
 *   returns void
 */
function applyRules(ranges) {
  // iterate through ranges backwards, since splitting
  // a node breaks any ranges after it

  for (i = ranges.length-1; i >= 0; --i) {
    var r = ranges[i];
    // make a copy of the range text, 
    // with a styled SPAN around it
    documentFragment = r.cloneContents();
    nodesToAttach=documentFragment.childNodes
    //debug(documentFragment);
    var doc = r.startContainer.ownerDocument;
    //var t = doc.createTextNode(r.toString());
    var n = doc.createElement("span");
    n.setAttribute("style", ranges[i].matchingRule.style);
    n.appendChild(documentFragment);
    // delete the range and insert n in its place
    r.deleteContents();
    r.insertNode(n);
  }
}

/**
 * TextIterator: class that iterates over the text found in
 * a DOM subtree.  In addition to returning the strings, 
 * TextIterator also keeps track of each string's character offset
 * relative to the start of the iteration, and can use that information
 * to translate between [start,end] offsets and Ranges.
 *
 * Properties:
 *       node            current node of iteration
 *
 *       text            string contents of node
 *
 *       start           start offset of this node (measured in characters from start of iteration)
 *       end             end offset of this node
 *
 *       document        Document containing nodes being iterated
 */
 
 /**
  * Make a TextIterator over node's descendents.  Iterator initially
  * points nowhere; must call next() to get the first element of the
  * iteration.
  */
function TextIterator(node) {
  this.tw = Chickenfoot.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    function (n) {
      if (n.nodeType == Node.TEXT_NODE
          || n.tagName == "BR") {
         return NodeFilter.FILTER_ACCEPT;
      } else {
         return NodeFilter.FILTER_SKIP;
      }
    });
  this.start = 0;
  this.end = 0;
  this.document = node.ownerDocument;
}

TextIterator.prototype = {
  /**
   * next(): advance the iterator to the next text node
   * in the iteration.
   *
   *   returns the node, or null if iteration is ended.
   */   
  next : function() {
    this.start = this.end;

    var result = this.tw.nextNode();
    if (result == null) {
      return null;
    }
    
    this.node = this.tw.currentNode;
    this.text = (this.node.nodeType == Node.TEXT_NODE)
        ? this.tw.currentNode.nodeValue
        : "\n"; // BR
    this.end += this.text.length;

    //debug("next(): [" + this.start + "," + this.end + "]" + this.text);
    return this.node;    
  },
  
  /**
   * advanceTo(): advance the iterator until the text node containing
   * the specified character offset is reached (measured relative to the
   * start of the iteration).
   */
  advanceTo : function(index) {
    while (! (index >= this.start && index < this.end)) {
      if (this.next() == null) {
        throw new Error("can't find index " + index);
      }
    }
    //debug("advanced to " + this.start);
  },

  /**
   * makeRange(): advance the iterator until reaching the offsets
   * [start, end], and create a Range object spanning those points in the
   * DOM.
   */
  makeRange : function (start, end) {
    r = this.document.createRange();

    //debug("makeRange(" + start + "," + end + ")");    
    this.advanceTo(start);
    r.setStart(this.node, start - this.start);

    this.advanceTo(end);
    r.setEnd(this.node, end - this.start);
    return r;
  }
};

/**
 * Make a syntax-coloring rule.
 *
 *    pattern     regular expression, e.g. /\w+/
 *    attributes  attributes for SPAN element that will surround
 *                matches to the pattern
 */
function makeRule(pattern, style) {
  pattern.style = style;
  return pattern;
}

/**
 * Rules for syntax-coloring Javascript.
 */
const CF_JAVASCRIPT_RULES = [
  //block comments
  makeRule(/\/\*[\s\S]*?\*\//gm,
             "color: blue"),

  // strings
  makeRule(/"([^"\\\n]|\\.)*"|'([^'\\\n]|\\.)*'/gm,
             "color: green"),

  // single-line comments
  makeRule(/\/\/.*$/gm,
             "color: blue"),

  // keywords
  makeRule(/\b(break|case|catch|continue|default|delete|do|else|false|finally|for|function|if|in|instanceof|new|null|return|switch|this|throw|true|try|typeof|var|void|while|with)\b/gm,
             "color: purple")
];

//var node = document.getElementById('editor').contentDocument.getElementById("pre");
//var node = document.getElementsByTagName('body')[0];
//syntaxColor(node, CF_JAVASCRIPT_RULES);

function syntaxColorMouseEvent(event) {
 
 	if (event) {//event.keyCode ==32
 		var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
    	var ed = sbwin.getSelectedBuffer().editor;
    	var doc = ed.contentDocument;
    	var pre = doc.getElementById("pre");
    	//var preElement=false;    
    	var anchorNodeCaret = sbwin.getSelectedBuffer().api.selection.focusNode;
    	var anchorOffsetCaret = sbwin.getSelectedBuffer().api.selection.focusOffset;
    	//debug('offset: '+anchorOffsetCaret);
    	
    	//pre.innerHTML="<span style=\"color: blue;\">/*j<br>*/</span><br>";
    /*
    	debug('pre');
    	debug(pre.childNodes);
    	debug("anchorNodeCaret");
    	debug(anchorNodeCaret);
    	//debug("anchorNodeCaret.parentNode");
    	//debug(anchorNodeCaret.parentNode);
    	//debug("anchorNodeCaret.parentNode.parentNode");
    	//debug(anchorNodeCaret.parentNode.parentNode);
    	debug(anchorNodeCaret.data+"+end");
    	//debug(anchorNodeCaret.innerHTML);
    	debug(anchorOffsetCaret);
    	*/
    	
    }
}
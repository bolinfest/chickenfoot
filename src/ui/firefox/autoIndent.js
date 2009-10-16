/**
Takes the PRE node as an argument and makes lines (array of ordered nodes)
as the user sees them in the Chickenfoot Script Editor.  
The first line is just #text, all other lines start with a BR element.
COMMENTS!!! Handling?


returns an array of list
*/
function makeLines(node){
	//debug('MAKES LINES nodes children:')
	//debug(node);
	var lines = [];
    var nodeMarker=0;
	var kids=node.childNodes;
	//debug(kids);
	if(kids[0].nodeName=='BR'){
		//the the first line is blank and we have to correct for the fact
		//that makes Lines is going to start counting lines at the first BR
		//which skips the first line.
		//the solution is to start with a blank line.
		var line=[];
		lines.push(line);
	}
	
	while(nodeMarker<kids.length){
		var line =[];
		line.push(kids[nodeMarker]); //this will always be a BR node
		nodeMarker++;	
		// as long as there are more nodes and the next node is not
		// a comment or a BR keep adding the next node to the line
		// you can only check if it's blue if it is indeed a span, so do that inside the while loop
		while(nodeMarker<kids.length && !(kids[nodeMarker].nodeName=="BR")){
			//if it's blue, it's a comment.  Ignore it.
			if(kids[nodeMarker].nodeName=="SPAN"){
				//it's a SPAN
				if(kids[nodeMarker].style.getPropertyValue('color')=='blue'){
					//it's a comment - include the SPAN node on the current line
					//then look at it's children for BRs
					//Only increment nodeMarker once 
					line.push(kids[nodeMarker]);
					var spanNodeMarker=0;
					var spanNodeKids=kids[nodeMarker].childNodes;
					var spanNodeKidsLength=spanNodeKids.length;
					while(spanNodeMarker<spanNodeKidsLength){
						//the nodes are either text or br 
						if(spanNodeKids[spanNodeMarker].nodeName=="#text"){
							line.push(spanNodeKids[spanNodeMarker]);
							spanNodeMarker++;
							
						}else{
							if(spanNodeKids[spanNodeMarker].nodeName=="BR"){
								lines.push(line);
								var newline=[];
								line=newline;
								line.push(spanNodeKids[spanNodeMarker]);
								spanNodeMarker++;
							}
						}
						//debug('done while');
					}			
					nodeMarker++;
				}else{
					//it's a span but not a comment.  Include it!
					line.push(kids[nodeMarker]);
					nodeMarker++;
				}
			}else{
			//if it's not a comment add it
				line.push(kids[nodeMarker]);
				nodeMarker++;
			}
			
		}
		lines.push(line);	
	}
	return lines;
}
/*
Given an array of lines, a node and and offset, this function will report
what line # (0-indexed) the node, offset is at.)
*/

function findNodeInLines(lines,node,offset){
	
	//debug('findNodeInLines');
	//debug(node);
	//debug(offset);
	for(line in lines){
		var aLine=lines[line];
		//debug("aLine");
		//debug(aLine);
		for(i in aLine){
			//debug("aLine[i]");
			//debug(aLine[i]);
			//debug(node);
			if(aLine[i]==node && aLine[i].nodeName!="SPAN"){
				//debug("aLine[i] not SPAN");
				//debug(aLine[i]);
				return line;
			}
			if(aLine[i].nodeName=="SPAN"){
				//debug("aLine[i].nodeName=SPAN");
				//debug(aLine[i].nodeName);
				//since we are looking in lines we can assume there are no BRs 
				//in the children of a SPAN
				//the first child will be the only child
				if(aLine[i].firstChild==node){
					//debug(aLine[i].firstChild);
					return line;
				}
			}
			
		}
	}
	//debug('maybe PRE NODE');
	//if you're in the PRE node, it really means you're on a blank line OR at the end of a line
	//line number is calculated by the offset minus the # of nodes that are comments if you're at a blank line
	//debug("node.nodeName");
	//debug(node.nodeName);
	//debug(node.childNodes[offset-1]);
	//debug(node.childNodes[offset]);
	//if(offset>=
	if(node.nodeName=='PRE' && node.childNodes[offset].nodeName=='BR'){
		//debug('PRE NODE');
		if(node.childNodes[offset-1].nodeName=='BR'){
		//if it is a new line (i.e. there is a BR ahead of it)
			//debug('PRE NODE');
			//debug(node.childNodes);
			var nodeBefore=node.childNodes[offset-1];
			//debug("nodeBefore");
			//debug(nodeBefore);
			
			for(line in lines){
				if(lines[line][0]==nodeBefore){
					//debug("it is the end of a line");
					return line;
				}
				
			}
			
			/*
			var line=0;
			for(var i=0;i<offset;i++){
				if(node.childNodes[i].nodeName=='BR'){
					line=line+1;
				}
			}
			*/
			//debug("node.childNodes[offset-1].nodeName=='BR'");
			return line;
		}else{
		//it is the end of a line.
		
			var nodeBefore=node.childNodes[offset-1];
			if(nodeBefore.nodeName=="SPAN"){
				if(nodeBefore.style.getPropertyValue('color')=='blue'){
					nodeBefore==nodeBefore.childNodes[nodeBefore.childNodes.length-1];
				}
			}
			for(line in lines){
				var aLine=lines[line];
				for(i in aLine){
					if(aLine[i]==nodeBefore){
					//debug("it is the end of a line");
					return line;
					}
				}
			}
		}
	}else{
		//debug('find pre, text node or span node');
		//debug(node.childNodes);
		var targetNode=node.childNodes[offset];
		//debug("target node");
		//debug(targetNode);
		for(line in lines){
			var aLine=lines[line];
			for(i in aLine){
				//debug('aLine[i]');
				//debug(aLine[i]);
				if(aLine[i]==targetNode){
				//debug("lasr claus");
				//debug(node);
				//debug(offset);
				//debug(targetNode);
				if(node.nodeName=="SPAN" &&	node.childNodes[offset].nodeName=="BR"){
					return line-1;
				}else{
					return line;
				}
				}
			}
		}
	}
	
	//failed to find node in lines
	return -1;

}

/**
* Calculates the number of spaces the current line should be indented by
*given the lines and what line number to be adjusted
*
*It does this by looking at the previous line, counting indents, {'s and }'s
*It will never return less than 0.  (It won't count }'s following leading 
*whitespace on the previous line.

*It also looks at the current line and takes away indents if there are }'s
*immediately following the leading whitespace. 
*/

function calculateIndents(lines,lineNum){

	var spacesPerTab = 2; //empiraclly observed to be 8, this variable does not set this value
	var indents=0;
	if(lineNum<1){
		return 0;
	}else{
		//debug('linenNum>=1');
		//initialize indent count to 0
		var indents=0;
		//debug('line num');
		//debug(lineNum);
		
		//var	previousLine=lines[lineNum-1];
		//debug('previous line');
		//debug(previousLine);
		//get text of previousLine
		//var previousLineText=getLineText(previousLine);
		//debug('previous linetext: ')
		//debug(previousLineText);
		
		var refLines=getRefLine(lines, lineNum);
		//debug("refLines");
		for(i in refLines){
			//debug(refLines[i]);
		}
		//debug(refLines);
		var	refLinesLength=refLines.length;
		
		var firstLineText=getLineText(refLines[refLinesLength-1]);
		//debug("firstLineText");
		//debug(firstLineText);
		var otherLines="";
		//starting at 
		
		for(c=refLinesLength-2; c>=0; c--){
			otherLines=otherLines+getLineText(refLines[c]);
		}
		//debug("otherLines");
		//debug(otherLines);
		//count leading whitespace (just at first line in refLines)
		var beginningTabRegEx= /^[ \t]+/g; //identifies leading whitespace
		var leadingWhitespace=firstLineText.match(beginningTabRegEx);
		//debug('leadingWhitespace');
		//debug(leadingWhitespace+"e");
		if(leadingWhitespace!=null){
			var tabRegEx = /\t/g; //all tab characters
			var spaceRegEx = / /g; //all space characters
			if(leadingWhitespace[0].match(tabRegEx)){
				var leadingTabs=leadingWhitespace[0].match(tabRegEx);
				//debug('leading tabs = '+leadingTabs.length);
				indents=indents+spacesPerTab*leadingTabs.length;
			}
			if(leadingWhitespace[0].match(spaceRegEx)){
				var leadingSpaces=leadingWhitespace[0].match(spaceRegEx);
				//debug('leading spaces = '+leadingSpaces.length);
				indents=indents+leadingSpaces.length;
			}
		}
		var openCurlyRegEx = /{/g; //all tab characters
		var closeCurlyRegEx = /}/g; //all space characters
		if(firstLineText.match(openCurlyRegEx)){
			var openCurlys=firstLineText.match(openCurlyRegEx);
			//debug('leading { = '+openCurlys.length);
			indents=indents+spacesPerTab*openCurlys.length;
		}
		//I don't want to match all the close curly braces, just the once that wouldn't 
		//get detected by the auto-indent operating on the current line (specified below)
		var leadingCloseCurlyRegEx=/^[ \t]*}+/ 
		if(firstLineText.match(leadingCloseCurlyRegEx)){
		//if there are leading }
			//debug('there are leading } to account for');
			var previousLineWithoutLeadingCurlys=firstLineText.replace(leadingCloseCurlyRegEx,"");
			if(previousLineWithoutLeadingCurlys.match(closeCurlyRegEx)){
				var closeCurly=previousLineWithoutLeadingCurlys.match(closeCurlyRegEx);
				//debug('leading } = '+closeCurly.length);
				indents=indents-spacesPerTab*closeCurly.length;
			}
		}else{
			//there are no leading },procede as normal
			//debug('no leading }');
			if(firstLineText.match(closeCurlyRegEx)){
				var closeCurly=firstLineText.match(closeCurlyRegEx);
				//debug('leading } = '+closeCurly.length);
				indents=indents-spacesPerTab*closeCurly.length;
			}
		}
		
		//account for indent-alterings on the otgher reference lines
		//basically, count the { and } in otherLines
		
		if(otherLines.match(openCurlyRegEx)){
			var openCurlys=otherLines.match(openCurlyRegEx);
			//debug('leading { otherLines	= '+openCurlys.length);
			indents=indents+spacesPerTab*openCurlys.length;
		}
		if(otherLines.match(closeCurlyRegEx)){
			var closeCurly=otherLines.match(closeCurlyRegEx);
			//debug('leading } otherLines	= '+closeCurly.length);
			indents=indents-spacesPerTab*closeCurly.length;
		}
		
		
		
		//correct for starting }'s on the current line
		//var leadingCloseCurlyRegEx=/^[ \t]*}+/ 
		var currentLineText=getLineText(lines[lineNum]);
		//debug('current line text');
		//debug(currentLineText);
		if(currentLineText.match(leadingCloseCurlyRegEx)){
			//debug('leading { detected');
			var leadingCloseCurlyText=currentLineText.match(leadingCloseCurlyRegEx)[0];
			var leadingCloseCurlys= leadingCloseCurlyText.match(closeCurlyRegEx);
			indents=indents-spacesPerTab*leadingCloseCurlys.length;
		}
		
		
		if(indents<0){
			return 0;
		}else{
			return indents;
		} 
	}

}

/*
Given a line (which is an array of nodes, it gets the text from those nodes,
concatenates it all, and return a string of the text.

*/
function getLineText(line){
	var sb = new Chickenfoot.StringBuffer();
	for(n in line){
		//debug('getting line text of:');
		//debug(line[n]);
		//debug((line[n]).data);
		if(line[n].nodeName=="SPAN"){
			if(line[n].style.getPropertyValue('color')=='blue'){
				//do nothing
			}else{
				sb.append(line[n].childNodes[0].data);
			}
		}else{
			if(line[n].nodeName=="BR"){
				//do nothing
			}else{
				var p=line[n].parentNode;
				
				if(p.nodeName=="SPAN"){
					//SPAN parent
					if(p.style.getPropertyValue('color')=='blue'){
						//do nothing
					}else{
						sb.append(line[n].data);
					}
				
				}else{
					sb.append(line[n].data);
				}
			}
		}
	}
	return sb.toString();
}

/*
* Returns an array of consequitive lines directly above the current line that  
* constitute all the lines mecessary to determine the indent of the current line
*
* Finds the latest line that does not begin with a BR in a SPAN.
*/
function getRefLine(lines, lineNum){

	var currNum=lineNum-1;
	var refLines=[];
	while(currNum>=0){
		//debug("currNum= "+currNum);
		if(lines[currNum][0].parentNode.nodeName=="SPAN"){
			//debug("span node");
			
			refLines.push(lines[currNum]);
			currNum--;
		}else{
			refLines.push(lines[currNum]);
			//debug("else");
			return refLines;
		}
	}
	return refLines;
	
}
/*
Given a line (potentially with leading whitespace), and a desired indentation
this will rip out all the old leadingwhitespace (if any) and replace it with the desired 
amount of whitespace.
*/
function adjustSpaces(/*String*/oldLineText, /*integer*/indent){
	//this is how much total leading whitespaces is wanted
	
	//all indents are space.  There are no more tabs \t.
	var newSpace="";	
	for(var s=0; s<indent; s++){
		//debug('add a space');
		newSpace=newSpace+" ";
		//debug('done adding space');
	}
	
	//redone to comply with tabs even though it looks like it already does.
	/*
	var tabs=Math.floor(indent/8);
	var spaces = indent % 8;
	//debug('tabs: '+tabs+' spaces: '+spaces);
	var newSpace="";
	for(var t=0; t<tabs; t++){
		//debug('add a tab');
		newSpace=newSpace+"\t";
		//debug('done adding tab');
	}
	for(var s=0; s<spaces; s++){
		//debug('add a space');
		newSpace=newSpace+" ";
		//debug('done adding space');
	}
	*/
	
//	newSpace;
	//debug('the new spaces');
	//debug('start'+'		'+'end');
	//debug('start'+newSpace+'end');
	//get rid of any existing whitespace and replace it with the desired whitespace
	var leadingSpaceRegEx =/^[ \t]+/;
	var newLine;
	if(oldLineText.match(leadingSpaceRegEx)){
		//debug('replace old spaces with new spaces');
		//if there is leading whitespace already, just replace it with the new
		newLine = oldLineText.replace(leadingSpaceRegEx,newSpace);
		//debug('new line');
		//debug(newLine);
	}else{
		//debug('just add leading whitespace, ');
		//if there isn't any leading whitespace, just add some new leading whitespace
		//the case also covers when the old line has no text or spaces at all 
		//and it is just a BR element 
		newLine=newSpace+oldLineText;
		//debug('new line');
		//debug(newLine);
	}
	//debug('end of adjust spaces, newline=');
	//debug(newLine+'end');
	return newLine;
}



function changeIndent(line,indents,doc,pre,sbwin,node,offset){
		var sel=sbwin.getSelectedBuffer().api.selection;
		var firstNode=line[0];
		
		if(firstNode.nodeName=="BR" && indents>=0){
			//debug("change indent================");
			//debug(line);
			// indent is needed
			//if(true){
			if(!line[1]){//need to add text node, blank line
				//debug("change indent= blankLine");
				var newText=adjustSpaces("",indents);
				//debug(newText+"end");
				var newTextNode = doc.createTextNode(newText);
				pre.insertBefore(newTextNode, firstNode.nextSibling);
				//replace cursor at end of blankspaces just added
				//debug("newText.length");
				//debug(newText.length);
				sel.collapse(newTextNode,newText.length);
			}else{
				//need to look at line[1]
				if(line[1].nodeName=="#text"){
					//debug("change indent= text");
					//debug(line);
					//we need to change the text
					var oldText=line[1].nodeValue;
					//debug('oldText');
					//debug(oldText+'e');
					var newText=adjustSpaces(oldText,indents);
					//debug('newText');
					//debug(newText+'e');
					var newTextNode = doc.createTextNode(newText);
					pre.removeChild(line[1]);
					pre.insertBefore(newTextNode, firstNode.nextSibling);
					//replace cursor:
					//if we can place it at the node, offset, do so
					//debug(node);
					//debug(offset);
					//debug(pre.childNodes[offset]);
					//debug(line[1]);
					//debug(pre.childNodes[offset]==line[1]);
					
					
					if(line[1]==node){//if the oldText text node was the node you were on,
						//then get the distance from the end and 
						//replace at that distance from the new end
						var distFromEnd=oldText.length-offset;
						var newOffset=Math.max(0,newText.length-distFromEnd);
						sel.collapse(newTextNode,newOffset);
						//debug("placed at NEW location");
					}else{
						
						if(node.nodeName=="PRE" && (pre.childNodes[offset-1].nodeName=="BR"||pre.childNodes[offset].nodeName=="BR")){
							//if the node is at	the first BR or on the second Node
							//right after the BR
							//debug("placed at indents locatiol");
							//debug(offset);
							//debug(pre.childNodes[offset]);
							//debug(pre.childNodes[offset].data+"e");
							var distFromEnd=newText.length-oldText.length;
							sel.collapse(pre.childNodes[offset],distFromEnd);
							//debug("placed at indents locatiol");
						}else{
							//this will work if the node, offset is on 
							//a location that is not the node that was deleted and replaced
							sel.collapse(node,offset);
							//debug("placed at old locatiol");
						}
					}
				}else{
					//we just need to add a text node
					//debug("change indent= span?");
					//debug(line);
					var newText=adjustSpaces("",indents);
					var newTextNode = doc.createTextNode(newLine);
					pre.insertBefore(newTextNode, firstNode.nextSibling);
				}
			}
			
		}
		
		//else no indent needed, this is the first line	
}

/**
*This event first syntax colors the entire document and then uses the spans around
*words and nodes in the document to help the autoIndent function tell where commented 
*code is.  
*
*Auto-Indent:
*breaks the document into lines by looking for BR elements, then will auto indent just
*the selected line by getting a reference line and using the text of the reference line to
*calculate how much the next line should be indented.  Once the indent calculation is made
*it adjusts the whitespace of the selected line by replacing the line.
*
*/

function tabAndSyntaxColorEvent(event) {
   if (event) {//event.keyCode ==32
     var nsIDOMNodeFilter = Components.interfaces.nsIDOMNodeFilter;
     var sbwin = Chickenfoot.getSidebarWindow(chromeWindow);
      var ed = sbwin.getSelectedBuffer().editor;
      //debug(sbwin.getSelectedBuffer());
      var doc = ed.contentDocument;
      //debug(doc);
      var pre = doc.getElementById("pre");   
      //debug(pre); 
      var anchorNodeCaret = sbwin.getSelectedBuffer().api.selection.anchorNode;
      var anchorOffsetCaret = sbwin.getSelectedBuffer().api.selection.anchorOffset;
      //debug('offset: '+anchorOffsetCaret);
      //debug(anchorNodeCaret);
      //debug(anchorNodeCaret.innerHTML);
      //debug(anchorOffsetCaret);
            
      var lines = makeLines(pre);
      //debug('lines');
      //for(line in lines){
      //  debug(lines[line]);
      //}
      //debug(lines);
       var lineNum=findNodeInLines(lines,anchorNodeCaret,anchorOffsetCaret);
       //debug('lineNum= '+lineNum);
    //this is how many spaces we need to indent our line by
    var indents=calculateIndents(lines,lineNum);
    //debug('INDENTS: '+indents);
    //debug('lines[lineNum]');
    for(n in lines[lineNum]){
      //debug(lines[lineNum][n].data+'end');
    }
    //debug('lineText');
    var lineText=getLineText(lines[lineNum]); //returns undefined if the line was a pre???
    //debug(lineText+'end');
    var newLine = adjustSpaces(lineText, indents);
    //debug('new Line');
    //debug(newLine);
    //debug('now im going to insert a new line');
    insertNewLine(newLine, doc, pre, lineNum, lines, anchorNodeCaret, anchorOffsetCaret);
      //debug('end of execution:');
      //var endAnchorNodeCaret = sbwin.getSelectedBuffer().api.selection.anchorNode;
      //debug(endAnchorNodeCaret.nodeName);
    }
}


/**
Takes the PRE node as an argument and makes lines (array of ordered nodes)
as the user sees them in the Chickenfoot Script Editor.  
The first line is just #text, all other lines start with a BR element.
COMMENTS!!! Handling?


returns an array of list
*/
function makeLinesOld(node){
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
    line.push(kids[nodeMarker]);
    nodeMarker++;  
    // as long as there are more nodes and the next node is not
    // a comment or a BR keep adding the next node to the line
    // you can only check if it's blue if it is indeed a span, so do that inside the while loop
    while(nodeMarker<kids.length && !(kids[nodeMarker].nodeName=="BR")){
      //if it's blue, it's a comment.  Ignore it.
      if(kids[nodeMarker].nodeName=="SPAN"){
        //it's a SPAN
        if(kids[nodeMarker].style.getPropertyValue('color')=='blue'){
          //it's a comment - don't include it, just increment
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

function findNodeInLinesOld(lines,node,offset){
  
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
      if(aLine[i]==node){
        //debug("aLine[i]");
        //debug(aLine[i]);
        return line;
      }
      if(aLine[i].nodeName=="SPAN"){
        //debug("aLine[i].nodeName=");
        //debug(aLine[i].nodeName);
        //since we are looking in lines we can assume there are no BRs 
        //in the children of a SPAN
        //the first child will be the only child
        if(aLine[i].firstChild==node){
          return line;
        }
      }
    }
  }
  //if you're in the PRE node, it really means you're on a blank line OR at the end of a line
  //line number is calculated by the offset minus the # of nodes that are comments if you're at a blank line
  //debug("node.nodeName");
  //debug(node.nodeName);
  //debug(node.childNodes[offset]);
  if(node.nodeName=='PRE' && node.childNodes[offset].nodeName=='BR'){
    if(node.childNodes[offset-1].nodeName=='BR'){
    //if it is a new line (i.e. there is a BR ahead of it)
      //debug('PRE NODE');
      //debug(node.childNodes);
      var line=0;
      for(var i=0;i<offset;i++){
        if(node.childNodes[i].nodeName=='BR'){
          line=line+1;
        }
      }
      return line;
    }else{
    //it is the end of a line.
    var nodeBefore=node.childNodes[offset-1];
    for(line in lines){
      var aLine=lines[line];
      for(i in aLine){
        if(aLine[i]==nodeBefore){
        return line;
        }
      }
    }
    }
  }else{
    //debug('find pre, text node or span node');
    //debug(node.childNodes);
    var targetNode=node.childNodes[offset];
    for(line in lines){
      var aLine=lines[line];
      for(i in aLine){
        if(aLine[i]==targetNode){
        return line;
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

function calculateIndentsOld(lines,lineNum){
  var spacesPerTab = 2 //default would be 8, but cf overrides the tab character to be only 2 spaces.
  var indents=0;
  if(lineNum<1){
    return 0;
  }else{
    //debug('linenNum>=1');
    //initialize indent count to 0
    var indents=0;
    //debug('line num');
    //debug(lineNum);
    var  previousLine=lines[lineNum-1];
    //var bpreviousLine=findPreviousLine(lines, lineNum);
    //debug(bpreviousLine);
    
    //debug('previous line');
    //debug(previousLine);
    //get text of previousLine
    var previousLineText=getLineText(previousLine);
    //debug('previous linetext: ')
    //debug(previousLineText);
    
    //count leading whitespace
    var beginningTabRegEx= /^[ \t]+/g; //identifies leading whitespace
    var leadingWhitespace=previousLineText.match(beginningTabRegEx);
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
    if(previousLineText.match(openCurlyRegEx)){
      var openCurlys=previousLineText.match(openCurlyRegEx);
      //debug('leading { = '+openCurlys.length);
      indents=indents+spacesPerTab*openCurlys.length;
    }
    //I don't want to match all the close curly braces, just the once that wouldn't 
    //get detected by the auto-indent operating on the current line (specified below)
    /*
    if(previousLineText.match(closeCurlyRegEx)){
      var closeCurly=previousLineText.match(closeCurlyRegEx);
      //debug('leading } = '+closeCurly.length);
      indents=indents-spacesPerTab*closeCurly.length;
    }
    */
    var leadingCloseCurlyRegEx=/^[ \t]*}+/ 
    if(previousLineText.match(leadingCloseCurlyRegEx)){
    //if there are leading }
      //debug('there are leading } to account for');
      var previousLineWithoutLeadingCurlys=previousLineText.replace(leadingCloseCurlyRegEx,"");
      if(previousLineWithoutLeadingCurlys.match(closeCurlyRegEx)){
        var closeCurly=previousLineWithoutLeadingCurlys.match(closeCurlyRegEx);
        //debug('leading } = '+closeCurly.length);
        indents=indents-spacesPerTab*closeCurly.length;
      }
    }else{
      //there are no leading },procede as normal
      //debug('no leading }');
      if(previousLineText.match(closeCurlyRegEx)){
        var closeCurly=previousLineText.match(closeCurlyRegEx);
        //debug('leading } = '+closeCurly.length);
        indents=indents-spacesPerTab*closeCurly.length;
      }
    }
    
    //debug('and now its over');
    
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
The function actually finds the reference line in lines for the lineNum specified.
To find the reference line, it looks at the line directly above it.  If that line has text,
it uses it as the reference line.  If not, it look one more up, and keeps looking up
until it finds a line with text on it.
*/
function findPreviousLineOld(lines, lineNum){
  var allBlankRegEx=/^\s*$/;
  var i=1;
  while(lineNum-i>=0){
    if(getLineText(lines[lineNum-i]).match(allBlankRegEx)){
      i++;
      //debug('must try another line');
    }else{
      //debug('ref line is number: ')
      //debug(lineNum-i);
      return lines[lineNum-i];
    }
  }
  //debug('returned the 0th line');
  return lines[0];
}
/*
Given a line (which is an array of nodes, it gets the text from those nodes,
concatenates it all, and return a string of the text.

*/
function getLineTextOld(line){
  var sb = new Chickenfoot.StringBuffer();
  for(n in line){
    //debug('getting line text of:');
    //debug(line[n]);
    //debug((line[n]).data);
    if(line[n].nodeName=="SPAN"){
      sb.append(line[n].childNodes[0].data);
    }else{
      if(line[n].nodeName=="BR"){
      }else{
        sb.append(line[n].data);
      }
    }
  }
  return sb.toString();
}
/*
Given a line (potentially with leading whitespace), and a desired indentation
this will rip out all the old leadingwhitespace (if any) and replace it with the desired 
amount of whitespace.
*/
function adjustSpacesOld(/*String*/oldLineText, /*integer*/indent){
  //this is how much total leading whitespaces is wanted
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
//  newSpace;
  //debug('the new spaces');
  //debug('start'+'    '+'end');
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

/**
Given the line we want to insert and the line that it replaces
This function will make the insert and deletion. 

The function is very particular because there are 3 different cases of trying to 
do an insert and delete. 

The first line doesn't begin with a BR element, it's just text

The beginning of some lines and the end of some lines in some circumstances
get reported as node=PRE element and offset=i, a number representing that 
this is the i-th child of node=PRE.
*/

function insertNewLine(newLine, doc, pre, lineNum, lines, node, offset){
//debug('inserting:')
//debug(newLine+'nl');
  //if the node is the PRE node, with a BR node immediately ahead of it,
  //then the offset is really the number
  //of nodes down from the top we are, not a location in text
  //The line is blank - just insert new text.
  if(node.nodeName=='PRE' && node.childNodes[offset].nodeName=='BR' && node.childNodes[offset-1].nodeName=='BR'){
    //debug('the node is a pre');
    //debug(offset);
    //debug(offset-1);
    //debug(node.childNodes);
    //debug(node.childNodes[offset]);
    //debug(node.childNodes[offset-1]);
    var newTextNode = doc.createTextNode(newLine);
    //var newTextNode = doc.createTextNode("foo");
    var newBR = doc.createElement('BR');
    //debug('pre - new text node');
    //debug(newTextNode);
    //debug(pre);
    //debug('offset');
    
    var o=pre.childNodes[offset];
    //debug(o);
    if(o.nextSibling){
      //debug('pre - has next sibling:');
      //debug(o.nextSibling);
      pre.insertBefore(newTextNode, o.nextSibling);
    }else{
      //this seems to work
      //debug('pre - append child');
      //debug(pre.childNodes);
      pre.insertBefore(newTextNode, o);
    }
    //debug('done inserting for pre');
  }else{
    // if the node is the end-of-line kind of PRE, then we just have to turn it
    // into a real node.
//    if (node.nodeName == 'PRE' && node.childNodes[offset].nodeName == 'BR' &&
//        node.childNodes[offset-1].nodeName != 'BR'){
//      debug('the node IS AN END-OF-LINE pre');      
//    }

    //the node and offset are normal, we can just reference the lines.
    //debug('the node is not a pre');
    var newBR = doc.createElement('BR');
    var newTextNode=doc.createTextNode(newLine);
    
    //debug('notpre - new text node');
    //debug(newTextNode);
    //debug(lines[lineNum]);
    //debug(lines[lineNum][0]);
    //debug(node);
    if(lineNum>0){ 
      //for every line EXCEPT the first line, you need to reinsert a BR
      //for the first line, no BR is needed, it just starts on a #text node.
      //debug('insert br');
      pre.insertBefore(newBR, lines[lineNum][0]);
    }
    //debug('1 insert before');
    //debug(newTextNode.data+'end');
    pre.insertBefore(newTextNode, lines[lineNum][0]);
    //debug('2 insert before');
    for(n in lines[lineNum]){
      //debug('remove '+n);
      pre.removeChild(lines[lineNum][n]);
    }
  }

}
/**
 *  box.js - Marcos Ojeda
 *  summer 2005
 *
 *    The majority of this file contains helper functions to find box-shaped
 *  elements in webpages given some text inside that box.
 *  i.e.:
 *  -----------
 *  |                  |
 *  |                  |
 *  |  Buy Now!  |
 *  |                  |
 *  -----------
 *
 *    You may not know if that box is a div styled by css, a clever table, or 
 *  something else altogether. box.js adds a series of tools for finding that
 *  box and for clearing out its content so that a new one just like it may be
 *  added to the webpage you are viewing.
 *
 *    A fun example would be to put a todo list of yours in every webpage that
 *  you visit. This would place that list in a box from each webpage that you 
 *  chose and would style it just like other lists from that webpage. The idea is
 *  that your content would now appear inside the new webpage in a manner 
 *  that is always consistent with that page's style.
 */

getStyle = function(query){
  /**
   *  getStyle iterates over each box returned
   *  from query and returns the utterly useless
   *  style information about it.
   *  status: superfluous
   */
  try{
    var res = boxes(query)      //Match obj
    var sb = subBoxes(res,10)
    for(i=0; i<sb.length; i++){
        var sr = sb[i]; var loc = sr.pop()
        var tn = nthMatch(loc,res)
        var te = tn.element
        var ts = document.defaultView.getComputedStyle(te,'')
        exposeVarVals(ts)
    }
  }
  catch (e){
    output("Died during getBox func with: "+e)
  }
}

nthMatch = function(n,m){
  /**
   *  returns the nth match, where n is 0 indexed
   *  nthMatch should not have any sideeffects.
   *
   *  status: search, core but buggy
   */
  match = m;
  max = match.count
  if(n < max){
    for(i=0; i<=max; i++, match = match.next){
      if(n == i)
        return match
    }
  }else
    throw new Error("Match only has "+max+" results, but you requested "+n)
}

boxes = function(query){
  /**
   *  boxes will first return the matches that 
   *  begin with 'query.' If there are no matches
   *  that begin with query, then boxes will return
   *  the matches that contain query. if nothing
   *  contains 'query' then an exception is thrown.
   *
   *  status: search, core
   */
  try{
    var start = pf("box starts with '",query)
    if (start.count == 0)
      throw new Error("No boxes start with: "+query)
    return start
  } catch(e){
    var contain = pf("box contains '",query)
    if (contain.count == 0)
      throw new Error(e+" and no boxes contain: "+query)
    return contain
  }
}

pf = function(prefix,query){
  /**
   *  for some query, pf will wrap it in single
   *  quotes and prepend prefix to it.
   *
   *  status: search, core, makes code cleaner
   */
  try{
    var result = find(prefix+query+"'")
    return result
  } catch(e){
    return e
  }
}
   
boxAreas = function(match){
  /**
   *  Given a series of matches, boxAreas will return
   *  the areas of each successive box and return them
   *  in an array of length match.count
   *
   *  status: search, useful in generalizing about results.
   */
  try{
    var m = match                 //get match from input
    var areas = new Array()
    for(var i=0;m.hasMatch;i++, m=m.next){
      var me = m.element
      var y = me.offsetHeight; x = me.offsetWidth
      var dim = x * y
      var areas[i] = dim
  }
    return areas
  } catch(e){ 
      output(e)
  }
}

contains = function(first, second){
  /**
   *  contains runs around looking at successive
   *  matches n and n+1. if n+1.parentNode = n
   *  ever, then the two are matches are nested.
   *  
   *
   *  stuats: search, supplementary
   */
  if(second.parentNode == first){
    return true
  } else if(second.parentNode != document){
    contains(first,second.parentNode)
  } else if(second.parentNode == document)
    return false
}

totResults = function(match){
  /**
   *  iterate over all results in match
   *  and then return the indices where new
   *  results begin. it should work better than
   *  any of the prior result functions.
   *
   *  status: search, experimental
   */
  var results = new Array()
  output("starting totResults with "+match.count+" results")
  if(match.count > 1){
    stop = match.count;
    for(var i=1; i < stop; i++){
      var a = i; var b = a - 1;
      output("  for: a <- "+a+", b <- "+b+" total: "+match.count)
      var second = nthMatch(a, match)
      var first = nthMatch(b, match)
      if(contains(first.element, second.element))
        results.push(i)
    }
    return results
  }
}

boxLocs = function(match){
  /**
   *  boxLocs returns an array of the indices
   *  of match where new results begin by checking
   *  the starting points of successive matches.
   
   *  status: search, experimental, buggy
   */
  try{
    var m = match
    var results = new Array()
    if(m.count > 1){
      for(i=1; i<m.count; i++){
        var a = i; var b = i; var a -= 1;
        var mp = nthMatch(a,m).element
        var mc = nthMatch(b,m).element
        var mpw = mp.offsetWidth; var mph = mp.offsetHeight
        var mpx = mp.offsetLeft;  var mpy = mp.offsetTop
        var mcw = mp.offsetWidth;  var mch = mp.offsetHeight
        var mcx = mp.offsetLeft;   var mcy = mp.offsetTop
        if((mcx > mpx + mpw) || (mcx + mcw < mpx))
          results.push(i)
        else if((mcy + mch < mpy) || (mcy > mpy + mph))
          results.push(i)
      }
      return results
    }
  } catch (e){
    output(e)
  }
}

percentages = function(list){
  /**
   *  Takes a list and outputs another list
   *  that has each element as a percent 
   *  of the previous one
   *
   *  status: search, core, basic, convenience
   */
  var percents = new Array(list.length - 1)
  for(i=1; i < list.length; i++){
    percents[i] = list[i] / list[i-1];
  }
  return percents
}

ddx = function(list){
  /**
   *  ddx is a stupid differentiator that 
   *  calculates slopes between points. the array
   *  that it returns is equal in size to the array
   *  it is pssed with each element indicating its
   *  slope relative to the previous element. The
   *  first element always returns a slope relative
   *  to zero.
   *
   *  status: search, core
   */
  var deriv = new Array(list.length)
  for(i=0; i < list.length; i++){
    if(i==0)
      deriv[0] = list[0] - 0;
    else
      deriv[i] = list[i] - list[i-1]
  }
  return deriv
}

newResults = function(match){
  /**
   *  newResults runs through all the matches and
   *  looks for a range that is not nested with
   *  the previous result to identify results
   *
   *  status: search, broken, ranges are relative to parent
   */
  var d = document.innerHTML
  var count = 0
  for(i=1; i<match.count; i++){
    d.match()
    var r1 = nthMatch(i-1,match).range
    var r2 = nthMatch(i,match).range
    output(i+". "+r1+":"+r2)
    if(r1.compareBoundaryPoints(Range.START_TO_END,r2) > -1)
      count++
  }
  return count
}

searchResults = function(match){
  /**
   *  searchResults runs through all the matches and
   *  tries to make ranges for them by searching for 
   *  their innerHTML in the document
   *
   *  status: search, buggy, searches do not always work.
   */
  //pull document, 
  var d = document.documentElement.innerHTML
  var count = 1
  if(match.count < 2)
    return match.count
  for(i=1; i < match.count; i++){
    var a = i; a -=1; var b = i;
    var r1 = nthMatch(a,match).element.innerHTML
    var r2 = nthMatch(b,match).element.innerHTML
    var r1len = r1.length; r2len = r2.length
    
    var re1 = new RegExp(r1)
    var re2 = new RegExp(r2)
    var r1start = d.search(re1)
    var r2start = d.search(re2)
    var r1end = r1start + r1len
    var r2end = r2start + r2len
    if(r2start > r1end || r2len > r1len){
      count++
      if(r2start > r1end)
        output("r2 starts before r1 ends")
      if(r2len > r1len)
        output("r2 is longer than r1: "+r2len+">"+r1len)
      output("new result found at "+a)  //debugging output
    }
    //debugging output
    output("searchResults: "+i+" r1:"+r1start+"-"+r1end+",	r2:"+r2start+"-"+r2end)
  }
  return count
}

numResults = function(slopes){
  /**
   *  Given a series of slopes, return the
   *  number of distinct boxes available
   *  takes results from ddx
   *
   *  status: search, acceptable but rough results
   */
  var results = 0;
  for(i=0; i<slopes.length; i++){
    if(slopes[i] > 0){
      results++
      output("new results found at "+i)
    }
    output("numResults: "+i+". "+slopes[i])
  }
  return results
}

subBoxes = function(match, threshold){
  /**
   *  Get the number of small boxes within
   *  each result, reveal nesting about each
   *  result. This function returns an array
   *  that has as many top level elements as
   *  distinct results
   *  each element contains an array of locs.
   *  within the supplied match.
   *
   *  status: search, core
   */
  var slopes = ddx(boxAreas(match))
  var nres = numResults(slopes)
  var results = new Array(nres)
  var curr = -1;
  /**
   *  This loop will return the slope
   */
  for(i=0; i<slopes.length; i++){
    if(slopes[i] > 0){
      curr++
      results[curr]= []
    }
    if(Math.abs(slopes[i]) > threshold && slopes[i] < 0){
      results[curr].push(i)
    }
  }
  output("results found: "+results.length)
  return results
}

getBox = function(query,reptext){
  /**
   *  getBox should try to return the 'right'
   *  box given a query. it is essentially
   *  a wrapper for many functions
   *
   *  status: incomplete, testing
   */
  try{
    var res = boxes(query)      //Match obj
    var sb = subBoxes(res,10)   //finding distinct results
    for(i=0; i<sb.length; i++){   //iterating over results
        var sr = sb[i]; loc = sr.pop()  //loc is a match index where a new result begins.
        var tn = nthMatch(loc,res)
      if(reptext != ""){  
      /*
       *  ex:
       *  node_to_run_skel_on
       *  -> H!
       *  -> DIV
       *  ->|
       *    V-> H2
       *      |
       *      V->text node containing query
       *
       *  this operation here should create a tree walker and find the text
       *  node that contains query and then run skel on node_to_run_skel_on
       *  and then replace that node with the results of skel.
       *  text nodes are children of element nodes, so what we want to pass
       *  to skel is textNode.parentNode.parentNode (which should be an element node)
       */
        replaceNodeWithText(tn.element,query,reptext)
      }
      else{
        tn.element.style.setProperty("border","solid 1px red","")
      }
    }
  }
  catch (e){
    output("Died during getBox func with: "+e)
  }
}



median = function(/*Array*/list){
  /**
   *  returns the median value of an array
   */
  function abs_lt(a,b) {return Math.abs(a) - Math.abs(b)}
    list.sort(abs_lt)
    var loc = Math.floor(a.length/2)
  return(a[loc])
}



/*
 *  These three expose function are good
 *  for inspecting javascript objects
 *  status: core, utilities
 */
expose = function(obj){
  for(var name in obj)
    output(name)
  output("-=-=-=-=-=-");
}

exposeVarVals = function(obj){ 
  /**
   *  return the settable attributes
   */
  for(var name in obj){ 
    var val = obj[name] 
    if(val != "" && !(val instanceof Object) && name != "length"){ 
      output(name+" : "+val) 
    } 
  } 
}

exposeNotNull = function(obj){
  for(var name in obj){
    var value = obj[name]
    if(value != "")
      output(name+" : "+value)
  }
}


replaceNodeWithText = function (node,text,reptext){
  /**
   *  Look for 'text' in any of the children of 'node'
   *  and recreate the node you want but with the new
   *  content, reptext
   */
  var catchall = function(n){return NodeFilter.FILTER_ACCEPT}
  var kids = document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT,catchall,false);
  while((brat = kids.nextNode()) != null){
//    output("-=-=-=")
    output(brat.tagName+": "+brat.nodeType)
//    output("-=-=-=")
    if(brat.textContent.search(text) != -1 ){ 
      output("replacing:")
      output(brat.innerHTML)
      var rep = document.createElement(brat.tagName)
      var foster = document.createTextNode(reptext)
      rep.appendChild(foster)
      //exposeNotNull(rep)
      var parent = brat.parentNode
      var parent.replaceChild(rep,brat)
      return true
    }
  }
}

onlyElements = function(n){
  /**
   *  this is a filtering function for use with
   *  treeWalker and nodeIterator, it only allows
   *  elements and ignores text nodes.
   *  status: core
   */
  if(n.nodeType == 1) return NodeFilter.FILTER_ACCEPT
  else return NodeFilter.FILTER_SKIP}

snagStyles = function(node){
  /**
   *  grab all the styles in a node.
   *  status: aesthetic 
   */
  var seen = new Object()

  var tree = document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT,onlyElements,false)
  while((branch = tree.nextNode()) != null){
    if(seen[branch.tagName] == null){
      seen[branch.tagName] = document.defaultView.getComputedStyle(branch,'')
    }
  }
  return seen
}

forceStyles = function(source, target){
  /**
   *  given a source node, reformat all the elements
   *  of target so that they match the style of source.
   *  does not overwrite unset styles to default vals
   *  status: aesthetic
   */
  var styles = snagStyles(source)
  var tree = document.createTreeWalker(target,NodeFilter.SHOW_ELEMENT,onlyElements,false)
  while((branch = tree.nextNode()) != null){
    if((cs = styles[branch.tagName]) != null){

      for(var name in cs){
        var val = cs[name]
        if(val != "" && !(val instanceof Object) && name != "length" && name !="parentRule"){
          branch.style[name] = val
        }
      }

      //branch.style = styles[branch.tagName]
    }
  }
}

skel = function(node){
  /**
   *  skel works by grabbing a node and cloning it
   *  It then removes similar siblings on each level
   *  should ignore table rows and other repeating 
   *  content that will affect presentation.
   *  skel has no memory, it only aggregates adjacent nodes
   *  status: aesthetic
   */
  var tree = document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT,onlyElements,false)
  var clone = node.cloneNode(false) //only clone top level node

  for(branch = tree.firstChild(); branch != null; branch = tree.nextSibling()){
    //the tree should not be directly modified
    var tc = tree
    var next = tc.nextSibling()
    var tag = branch.tagName
    
    if(clone.lastChild == null || tag != clone.lastChild.tagName)
      clone.appendChild(branch)
  }
  node.parentNode.replaceChild(clone,node)
}


/*
 *  mimic is a useless function
 */
mimic = function(n){
  /**
   *  Mimic is a bit pretentious in that it
   *  only re-creates the parent container 
   *  but doesn not inherit that container's
   *  children. 
   *  status: extraneous
   */
  var tag = n.tagName
  var clone = document.createElement(tag)
  clone.setAttribute("id","mimic")
  var ns = document.defaultView.getComputedStyle(n,'')
  
  for(var name in ns){
    var val = ns[name]
    if(val != "" && !(val instanceof Object) && name != "length" && name !="parentRule"){
      clone.style[name] = val
    }
  }
  return clone
}

function getParentRow(cell){
  return cell.parentNode
}

function getBoxForNode(node){
  var doc = node.ownerDocument;
  var box = doc.getBoxObjectFor(node);
  //return new Box(box.x, box.y, box.width, box.height);
  return box;
}

function intersects(node1, node2){
  var a = getBoxForNode(node1);
  var b = getBoxForNode(node2);
  var aLeft = a.x; var aRight = a.x + a.width;
  var bLeft = b.x; var bRight = b.x + b.width;
  
  if(aLeft >= bLeft && aLeft <= bRight)
    return true;
  else if(aRight >= bLeft && aRight <= bRight)
    return true;
  else return false;
}

function getNextRow(row){
  var next = row.nextSibling;
  if(next != null){
    if(next.nodeType == 1){
      if(next.tagName == "TR"){
        return next;
      }
    }
    return getNextRow(next)
  }
  return null;
}

function returnSimilar(cell,row){
  /**
   *  This function takes a target cell and scours a given row until
   *  it finds a node that intersects the cell
   */
  var child = row.firstChild;
  for(var child = row.firstChild; child != null; child = child.nextSibling){
    if(child.nodeType == 1){
      if(intersects(cell,child)){
        return child;
      }
    }
  }
}

function findSucc(cell){
  var targetRow = getParentRow(cell);
  var sib = getNextRow(targetRow);
  while(sib != null){
    matched = returnSimilar(cell,sib)
    if(matched != null)
      output(matched.innerHTML)
    sib = getNextRow(sib)
  }
}

var from = find('box starts with "subject"').element

findSucc(from)
goog.require('goog.string');
goog.require('ckft.util.strings');

function Table() {
  // exports
  Table.findColumn = findColumn;
  Table.findRow = findRow;
  Table.getParentRow = getParentRow;
  Table.getNextRow = getNextRow;
  Table.returnSimilar = returnSimilar;
  
  function findColumn(/*InternalMatch[]*/ matches, /*Document*/ doc, /*Keywords*/ keywords, /*optional Range*/ context){
    /**
     *  this function maps over all the successive rows of cell
     *  and finds the nodes that intersect with cell.
     */
  
    var query = new TC("cell starts with '" +
        goog.string.trim(keywords.pattern) + "'");
    var cell = Pattern.find(doc, query);
    cell = cell.element
  
    var targetRow = getParentRow(cell);
    var sib = getNextRow(targetRow);
    while(sib != null){
      matched = returnSimilar(cell,sib)
      if(matched != null) {
        matches.push(new InternalMatch(matched, 1));
      }
      sib = getNextRow(sib)
    }
  }
  
  function findRow(/*InternalMatch[]*/ matches, /*Document*/ doc, /*Keywords*/ keywords, /*optional Range*/ context){
    /**
     *  this function maps over all the successive rows of cell
     *  and finds the nodes that intersect with cell.
     *  TODO add hook if no pattern is passed...
     */
  
    var query = new TC("cell contains '" +
        goog.string.trim(keywords.pattern) + "'");
    var cell = Pattern.find(doc, query);
    cell = cell.element
    //TODO error checking if match is null or has multiple results
  
    var sib = nextCell(cell);
    while(sib != null){
      matches.push(new InternalMatch(sib, 1));
      sib = nextCell(sib);
    }
  }
  
  function exposeNotNull(obj){
    for(var name in obj){
      var value = obj[name]
      if(value != "")
        debug(name+" : "+value)
    }
  }
  
  function getFirstRow(table){
    var row = table.firstChild;
    do{
      if(row.nodeType == 1 && ckft.util.strings.upperCaseOrNull(row.tagName) == "TR")
        return row
    }while(row = row.nextSibling);
  }
  
  function getParentRow(cell){
    var parent = cell.parentNode;
    if(ckft.util.strings.upperCaseOrNull(parent.tagName) == "TR")
      return cell.parentNode
    else if(ckft.util.strings.upperCaseOrNull(cell.tagName) == "TABLE")
      return null
    else
      return getParentRow(cell)
  }
  
  function getParentTable(node){
    if(node.nodeType == 1 && ckft.util.strings.upperCaseOrNull(node.tagName) == "TABLE"){ return node }
    else{ return getParentTable(node.parentNode) }
  }
  
  function getBoxForNode(node){
    var doc = node.ownerDocument;
    var box = doc.getBoxObjectFor(node);
    return box;
  }
  
  function intersects(node1, node2){
    /**
     *  intersects compares the left and right x offsets 
     *  for node1 and node2 and returns true if they 
     *  intersect each other.
     */
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
    /**
     *  This function currently only works with html
     *  tables, not with things that appear tabular via css
     *  styling.
     */
    var next = row.nextSibling;
    if(next != null){
      if(next.nodeType == 1){
        if(ckft.util.strings.upperCaseOrNull(next.tagName) == "TR"){
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
  
  function nextCell(cell){
    var sib = cell.nextSibling;
    while(sib != null){
      if(sib.nodeType == 1)
        return sib
      sib = sib.nextSibling;
    }
  }
  
  function findSucc(cell){
    /**
     *  this function maps over all the successive rows of cell
     *  and finds the nodes that intersect with cell.
     */
    var targetRow = getParentRow(cell);
    var sib = getNextRow(targetRow);
    while(sib != null){
      matched = returnSimilar(cell,sib)
      if(matched != null)
        debug(matched.innerHTML)
      sib = getNextRow(sib)
    }
  }
  
  function isLeaf(table){
    function onlyElements(n){
      if(n.nodeType == 1) return NodeFilter.FILTER_ACCEPT
      else return NodeFilter.FILTER_SKIP
    }
    var tree = document.createTreeWalker(table,NodeFilter.SHOW_ELEMENT,onlyElements,false)
    while((branch = tree.nextNode()) != null){
      if(ckft.util.strings.upperCaseOrNull(branch.tagName) == "TABLE")
        return false
    }
    return true
  }
  
  function isTable(table){
    var text = 0; var element = 0;
    function isTabular(n){
      if(n.nodeType == 1){
        switch(ckft.util.strings.upperCaseOrNull(n.tagName)){
          case "TBODY": return true; break;
          case "TR":return true;break;
          case "TD":return true;break;
          case "TH":return true;break;
          default: return false;
        }
      }
      return false
    }
    function textAndElements(n){
      if(n.nodeType == Node.TEXT_NODE || !isTabular(n)) return NodeFilter.FILTER_ACCEPT
      else return NodeFilter.FILTER_SKIP
    }
    var tree = document.createTreeWalker(table,NodeFilter.SHOW_ALL,textAndElements,false)
    while((branch = tree.nextNode()) != null){
      if(branch.nodeType == Node.TEXT_NODE)
        text += 1;
      else
        element += 1;
    }         
    if(text > element)
      return true
    else
      return false
  }
}

// initialize this package
Table();

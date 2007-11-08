var doc = chromeWindow.document;
var menu = chromeWindow.document.getElementById("contentAreaContextMenu")
  
//HACK so that we don't add this menu item more
// than once. By default, we seem to have 50 menuitems
if (menu.childNodes.length <= 50){
var menuitem = doc.createElement("menuitem");
menuitem.setAttribute("label", "Show element code");
menu.appendChild(menuitem);
menuitem.addEventListener("command", outputCode, false)
} else {
  menu.removeChild(menu.childNodes[50])
  var menuitem = doc.createElement("menuitem");
  menuitem.setAttribute("label", "Show element code");
  menu.appendChild(menuitem);
  menuitem.addEventListener("command", outputCode, false)}

function outputCode(evt){
    output(evt)
    output(evt["originalTarget"])
    list(evt)
    output("==================target is=========")
    list(evt["target"])
    //list(evt["originalTarget"])
    output("here")
    var e_out;
    var ie_var = "srcElement";
    var moz_var = "target";
    var prop_var = "myflag";
    evt[moz_var] ? e_out = evt[moz_var][prop_var] : e_out = evt[ie_var][prop_var];
    alert(e_out);
    prop_var = "mydata";
    evt[moz_var] ? e_out = evt[moz_var][prop_var] : e_out = evt[ie_var][prop_var];
    alert(e_out);
}
//output(searchBtns.element)
//output('here')
//output(searchBtns.next)

//function setCode(){
//   elementCode = "code goes here"
//}

//returns the textbox that should correspond to the query
function getSearchBtnQuery(buttonParent){
  if (buttonParent.tagName == "HTML"){
      return "error! no query box found";
   }

   //Get the associated textbox
   //Find text related to it
  // go up DOM until you
  // find element with name 'q' (or type 'text')
  var thisLevelCheck = buttonParent.childNodes

  for (i=0; i<thisLevelCheck.length; i++){
    var curSib = thisLevelCheck[i];
    if (curSib.tagName == "INPUT") {
        if (curSib.name && curSib.name=="q") {
           return curSib;
        }
     }
   }
  return getSearchBtnQuery(buttonParent.parentNode);
}

//will return getGoogleSearchResults(undefined) if can't
// find query box
function clickedSearchBtn(evt){

  var query = getSearchBtnQuery( evt["target"].parentNode).value;

  //print out call
   output("getGoogleSearchResults(\""+query+"\")")
   evt.stopPropagation()
}

function addSearchListeners(){
   var matches = find('search button')
   for (var m = matches; m.hasMatch; m = m.next) {
      //fired on bubbling stage so smaller elements get to go first
      m.element.addEventListener('mouseover', select, false /*bubble*/)
      //m.element.addEventListener('mouseout', clear, false /*bubble*/)
     //m.element.addEventListener('mouseout', function() {elementCode = " ";}, false /*bubble*/)
      m.element.addEventListener('click', clickedSearchBtn, false /*bubble*/)
   }
}

try{
addSearchListeners();
} catch (err) {
output("got error adding search listeners");
}

function getCurrentQuery(){
     var bod = window.document.getElementsByTagName("body")[0];
     var result = bod.getElementsByTagName("table")[6].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[1].getElementsByTagName("font")[0].getElementsByTagName("b")[3];
     return result.innerHTML
}

//Displays the call that got the count.
function clickedResultsCount(){
     output ("getGoogleSearchResults(\""+getCurrentQuery()+"\").estimatedTotalResultsCount\n")
}

function addResultsCount(){
  //find where total results would be. TOTAL HACK 
     var body = window.document.getElementsByTagName("body")[0];
     var results = body.getElementsByTagName("table")[6].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[1].getElementsByTagName("font")[0].getElementsByTagName("b")[2];
     //list(results);
     //output(results);
     //output(results.innerHTML);
     //list(results.text)
     results.addEventListener('mouseover',select, false)
     //results.addEventListener('mouseout',clear, false)
     results.addEventListener(/*'mouseover'*/'click',clickedResultsCount, false)
}

try{
addResultsCount();
} catch (err) {
output("got error adding result count listeners");
output(err);
}

//Displays the call that got the count.
function clickedLastQuery(){
     output ("getGoogleSearchResults(\""+getCurrentQuery()+"\").searchQuery\n")
}

function addLastQuery(){
  //find where total results would be. TOTAL HACK 
     var bod = window.document.getElementsByTagName("body")[0];
     var result = bod.getElementsByTagName("table")[6].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[1].getElementsByTagName("font")[0].getElementsByTagName("b")[3];
     result.addEventListener('mouseover',select, false)
     //result.addEventListener('mouseout',clear, false)
     result.addEventListener(/*'mouseover'*/'click',clickedLastQuery, false)
}

try{
addLastQuery();
} catch (err) {
output("got error adding previous query listeners");
output(err);
}

//Displays the call that got the count.
function clickedSpelling(){
 var bod = window.document.getElementsByTagName("body")[0];
     var result = bod.getElementsByTagName("p")[0].getElementsByTagName("a")[0].getElementsByTagName("b")[0].getElementsByTagName("i")[0];

     output ("getGoogleSpellingSuggestion(\""+getCurrentQuery()+"\")")
}

function addSpelling(){
  //find where total results would be. TOTAL HACK 
     var bod = window.document.getElementsByTagName("body")[0];
     var result = bod.getElementsByTagName("p")[0].getElementsByTagName("a")[0].getElementsByTagName("b")[0].getElementsByTagName("i")[0];
     result.addEventListener('mouseover',select, false)
     //result.addEventListener('mouseout',clear, false)
     result.addEventListener(/*'mouseover'*/'click',clickedSpelling, false)
}

try{
addSpelling();
} catch (err) {
output("no spelling correction on this page.");
}

//returns a function that matches the given i
function clickedResultElement(index){
    var bod = window.document.getElementsByTagName("body")[0];
     var result = bod.getElementsByTagName("div")[0].getElementsByTagName("p");

    return function(){ output ("getGoogleSearchResults(\""+getCurrentQuery()+"\").resultElements["+index+"]\n")}
}

function addResultElement(){
   
   var bod = window.document.getElementsByTagName("body")[0];
   var results = bod.getElementsByTagName("div")[0].getElementsByTagName("p");

   for (var i = 0; i< results.length; i++) {
       results[i].addEventListener('mouseover', select, false /*bubble*/)
      //m.element.addEventListener('mouseout', clear, false /*bubble*/)
      results[i].addEventListener('click', clickedResultElement(i), false /*bubble*/) 
}
}

try{
addResultElement();
} catch (err) {
output("got error adding individual result elements");
output(err)
}







var selected;

function select(evt) {

  if (selected && selected == evt["target"]) return;

  selected = evt["target"]
  clear(); 
  var win = window;  

  var currentSelection = win.getSelection();

  // clear selection when user clicks in the browser window
  if (win._ChickenfootGoogleApiSelection === undefined) {
    // this is the first time we've selected in this window,
    // so create a property to remember the selection, 
    // and add a listener that clears the selection on click.
    win._ChickenfootGoogleApiSelection = [];
   win.addEventListener('click', function(event) {
              clear(evt);
    }, false);
  }
        var e = evt.target
      var doc = e.ownerDocument;
      if (e.style) {
        //e._ChickenfootOldBorder = e.style.border;
        //e.style.border = "gray solid thick";
        var box = Chickenfoot.Box.forNode(e);
        var div = doc.createElement("div");
        div.style.position="absolute";
        div.style.width = box.w + "px";
        div.style.height = box.h + "px";
        div.style.left = box.x + "px";
        div.style.top = box.y + "px";
        div.style.backgroundColor = "#f00";
        div.style.opacity = .4;
        
        var body = doc.getElementsByTagName("body")[0];
        body.appendChild(div);
        win._ChickenfootGoogleApiSelection.push(div);
}
}


function clear(evt) {
  var win = window;
  var currentSelection = win.getSelection(); //gets text selected
  currentSelection.removeAllRanges();
  
  if (win._ChickenfootGoogleApiSelection) {  
    var nodes = win._ChickenfootGoogleApiSelection;
   for (var i = 0; i < nodes.length; ++i) {
      var e = nodes[i];
      var doc = e.ownerDocument;  
      var body = doc.getElementsByTagName("body")[0];
      body.removeChild(e);
     
    }
    win._ChickenfootGoogleApiSelection = [];
  }
}
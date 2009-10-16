//include('events.js')

//onKeypressImpl(document, "control enter", function() { click("Feeling Lucky"); 
//})

//Keypress Event
//Example: keypress("control d"), will bring up window to add a bookmark
//         keypress("h e l l o", "first textbox") will write hello into the first textbox on the page
//Clicks the keys given in the first argument, which is a string.
//The focus of the keypress can be set with an optional second argument, a string that
//describes the location that the keypress should be focused on.
function keypressImpl(/*document*/ document, /*string*/ keySequence, /*Optional string*/ destination) { 
    var doc = document;
    var focusNode = null;
    if(destination && destination != doc){
        focusNode = Pattern.find(doc, destination);
        if(focusNode == "no matches"){
            Chickenfoot.debug("Could not find specified focus location");
            return;
        }
        focusNode = getKeypressNode(focusNode);
    }
    else{
        focusNode = doc.documentElement;
    }
    var keys = keySequence;
    keys = parseKeys(keySequence);
    fireKeyEvent(doc, keys, focusNode, true);
}


/**
 * onKeypress() attaches a handler to an existing node.
 * The handler function is performed once the specified key (or combination of keys) has been pressed
 */

function onKeypressImpl(/*document*/ document, /*string*/ keySequence, /*function*/ handler, /*Optional string*/ destination) { 
    var doc = document;
    var focusNode = null;
    if(destination){
         focusNode = Pattern.find(document, destination);
         if(focusNode == "no matches"){
             Chickenfoot.debug("Could not find specified focus location");
             return;
         }
         focusNode = getKeypressNode(focusNode);
        }
    else{
       focusNode = doc.documentElement;
    }
    var keys = parseKeys(keySequence);
    var keyCodes = fireKeyEvent(doc, keys, focusNode, false);
    focusNode.addEventListener("keypress", makeEventHandler, false);
    
             
    function makeEventHandler (evt) {
        var eventCode = [];
        eventCode[0] = evt.ctrlKey;
        eventCode[1] = evt.altKey;
        eventCode[2] = evt.shiftKey;
        eventCode[3] = evt.metaKey;
        eventCode[4] = evt.keyCode;
        eventCode[5] = evt.charCode;
        if(compareArrays(eventCode, keyCodes[0])){
            return handler();
        }
    }
}

//Parses the argument string into an array of strings
function parseKeys(/*string*/ keys) {
    var keyArray = new Array(keys);
    return keyArray[0].split(" ");
}



//Compares the contents of two arrays to see if they are identical
function compareArrays(array1, array2){
    var equalArrays = true;
    if(array1.length == array2.length){
        for(var i=0; i<array1.length; i++){
            if(array1[i] != array2[i]){
                return false;
            }
        }
        return true;
    }
    else{
        return false
    }
}

function getKeypressNode(node) {
  node = node.element;
  if (node.wrappedJSObject) {node = node.wrappedJSObject;}
        
  //if is a xul textbox, drill down to the html input element
  if (instanceOf(node.ownerDocument, XULDocument)
    && isTextbox(node)) {
    var pred = function(n) {return (n && n.nodeName && (n.nodeName == "html:input"));}
    var treewalker = createDeepTreeWalker(node, NodeFilter.SHOW_ALL, pred);
    var txtbox = treewalker.nextNode();
    if (txtbox) {node = txtbox;}
  }
  return node;
}
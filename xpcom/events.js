/// Simulating events to DOM nodes

/**
 * Takes a node and fires the appropriate mouse event on it via automation.
 * 
 * @param type is the name of the type of mouse event,
 *        such as: "mousedown", "mouseup", or "click"
 * @param node the Node that should receive the event
 * @return boolean indicating whether any of the listeners which handled the
 *         event called preventDefault. If preventDefault was called
 *         the value is false, else the value is true.
 */
function fireMouseEvent(/*string*/ type, /*Node*/ node) {
 
  // Mozilla spec for initMouseEvent:
  //   http://www.mozilla.org/docs/dom/domref/dom_event_ref29.html
  // JavaScript example of using initMouseEvent:
  //   http://www.adras.com/Fire-an-event-from-javascript.t69-50.html

  var doc = node.ownerDocument;
  var event = doc.createEvent("MouseEvents");
  event.initMouseEvent(type, // typeArg
    true, // canBubbleArg
    true, // cancelableArg
    doc.defaultView, // viewArg (type AbstractView)
    1, // detailArg (click count)
    0, // screenX
    0, // screenY
    0, // clientX
    0, // clientY
    false, // ctrlKeyArg
    false, // altKeyArg
    false, // shiftKeyArg
    false, // metaKeyArg
    0, // buttonArg (0: left, 1: middle, 2: right)
    null // relatedTargetArg
  );
  // http://www.xulplanet.com/references/objref/EventTarget.html#method_dispatchEvent
  if (instanceOf(doc, XULElement)) {return node.click()}
  else {return node.dispatchEvent(event);}
  //also execute a direct click() command to the node
  //just in case it is an xbl binding or anonymous content that doesn't
  //respond to node.dispatchEvent
}


/**
 * Fires a keyboard input event on a node via automation.
 * 
 * @param document the Document that should receive the event
 * @param keys an array of string representing the keys that are pressed
 * @param node the Node that should receive the event
 * @param fireKeyBoolean a boolean that decides whether to fire a keypress event or simply return an array
 *  of keypress data corresponding to the array of keys. keypress calls fireKeyEvent with true, while onKeypress calls it with false
 */
function fireKeyEvent(/*document*/ document, /*array*/ keys, /*Node*/ node, /*Boolean*/ fireKeyBoolean) {     
   
    var doc = document;
    if(node.ownerDocument != null){
        doc = node.ownerDocument
    }
    var ctrlKeyArg = false;
    var altKeyArg = false;
    var shiftKeyArg = false;
    var metaKeyArg = false;
    var charKey = 0;
    var keyCode = 0;
    var keyInfo = [];
    var allKeyInfo = [];
    for(var i=0; i<keys.length; i++){
        if(keys[i].length == 1){
            charKey = keys[i];
            keyInfo = returnKeyInfo();
        }
        else{
            keys[i] = keys[i].toLowerCase();
        }
            switch(keys[i]){
              case "ctrl":
                 ctrlKeyArg = true;
                 break
              case "control":
                 ctrlKeyArg = true;
                 break
              case "alt":
                 altKeyArg = true;
                 break
              case "shift":
                 shiftKeyArg = true;
                 break
              case "back":
                 keyCode = 8;
                 keyInfo = returnKeyInfo();
                 break
              case "backspace":
                 keyCode = 8;
                 keyInfo = returnKeyInfo();
                 break
              case "tab":
                 keyCode = 9;
                 keyInfo = returnKeyInfo()
                 break
              case "enter":
                 keyCode = 13;
                 keyInfo = returnKeyInfo()
                 break
              case "pause":
                 keyCode = 19;
                 keyInfo = returnKeyInfo()
                 break
              case "break":
                 keyCode = 19;
                 keyInfo = returnKeyInfo()
                 break
              case "caps":
                 keyCode = 20;
                 keyInfo = returnKeyInfo()
                 break
              case "capslock":
                 keyCode = 20;
                 keyInfo = returnKeyInfo()
                 break
              case "escape":
                 keyCode = 27;
                 keyInfo = returnKeyInfo()
                 break
              case "esc":
                 keyCode = 27;
                 keyInfo = returnKeyInfo()
                 break
              case "page-up":
                 keyCode = 33;
                 keyInfo = returnKeyInfo()
                 break
              case "pageup":
                 keyCode = 33;
                 keyInfo = returnKeyInfo()
                 break
              case "page-down":
                 keyCode = 34;
                 keyInfo = returnKeyInfo()
                 break
              case "pagedown":
                 keyCode = 34;
                 keyInfo = returnKeyInfo()
                 break
              case "end":
                 keyCode = 35;
                 keyInfo = returnKeyInfo()
                 break
              case "home":
                 keyCode = 36;
                 keyInfo = returnKeyInfo()
                 break
              case "left-arrow":
                 keyCode = 37;
                 keyInfo = returnKeyInfo()
                 break
              case "leftarrow":
                 keyCode = 37;
                 keyInfo = returnKeyInfo()
                 break
              case "up-arrow":
                 keyCode = 38;
                 keyInfo = returnKeyInfo()
                 break
              case "uparrow":
                 keyCode = 38;
                 keyInfo = returnKeyInfo()
                 break
              case "right-arrow":
                 keyCode = 39;
                 keyInfo = returnKeyInfo()
                 break
              case "rightarrow":
                 keyCode = 39;
                 keyInfo = returnKeyInfo()
                 break
              case "down-arrow":
                 keyCode = 40;
                 keyInfo = returnKeyInfo()
                 break
              case "downarrow":
                 keyCode = 40;
                 keyInfo = returnKeyInfo()
                 break
              case "insert":
                 keyCode = 45;
                 keyInfo = returnKeyInfo()
                 break
              case "del":
                 keyCode = 46;
                 keyInfo = returnKeyInfo();
                 break
              case "delete":
                 keyCode = 46;
                 keyInfo = returnKeyInfo();
                 break
              case "left-window":
                 keyCode = 91;
                 keyInfo = returnKeyInfo()
                 break
              case "leftwindow":
                 keyCode = 91;
                 keyInfo = returnKeyInfo()
                 break
              case "right-window":
                 keyCode = 92;
                 keyInfo = returnKeyInfo()
                 break
              case "rightwindow":
                 keyCode = 92;
                 keyInfo = returnKeyInfo()
                 break 
              case "select-key":
                 keyCode = 93;
                 keyInfo = returnKeyInfo();
                 break
              case "select":
                 keyCode = 93;
                 keyInfo = returnKeyInfo();
                 break
              case "f1":
                 keyCode = 112;
                 keyInfo = returnKeyInfo();
                 break 
              case "f2":
                 keyCode = 113;
                 keyInfo = returnKeyInfo();
                 break 
              case "f3":
                 keyCode = 114;
                 keyInfo = returnKeyInfo();
                 break 
              case "f4":
                 keyCode = 115;
                 keyInfo = returnKeyInfo();
                 break 
              case "f5":
                 keyCode = 116;
                 keyInfo = returnKeyInfo();
                 break 
              case "f6":
                 keyCode = 117;
                 keyInfo = returnKeyInfo();
                 break 
              case "f7":
                 keyCode = 118;
                 keyInfo = returnKeyInfo();
                 break 
              case "f8":
                 keyCode = 119;
                 keyInfo = returnKeyInfo();
                 break 
              case "f9":
                 keyCode = 120;
                 keyInfo = returnKeyInfo();
                 break 
              case "f10":
                 keyCode = 121;
                 keyInfo = returnKeyInfo();
                 break 
              case "f11":
                 keyCode = 122;
                 keyInfo = returnKeyInfo();
                 break 
              case "f12":
                 keyCode = 123;
                 keyInfo = returnKeyInfo();
                 break 
              case "num-lock":
                 keyCode = 144;
                 keyInfo = returnKeyInfo();
                 break 
              case "numlock":
                 keyCode = 144;
                 keyInfo = returnKeyInfo();
                 break 
              case "scroll-lock":
                 keyCode = 145;
                 keyInfo = returnKeyInfo();
                 break 
              case "scrolllock":
                 keyCode = 145;
                 keyInfo = returnKeyInfo();
                 break 
           }
           if(fireKeyBoolean == true && keyInfo.length != 0){
                 fireKey();
           }
           else if(keyInfo.length != 0){
                 allKeyInfo.push(keyInfo);
                 ctrlKeyArg = false;
                 altKeyArg = false;
                 shiftKeyArg = false;
                 metKeyArg = false;
                 charKey = 0;
                 keyCode = 0;
                 keyInfo = [];
          }
    }
    function returnKeyInfo(){
        var keyInfo = [];
        keyInfo[0] = ctrlKeyArg;
        keyInfo[1] = altKeyArg;
        keyInfo[2] = shiftKeyArg;
        keyInfo[3] = metaKeyArg;
        keyInfo[4] = keyCode;
        keyInfo[5] = charKey;
        if(keyInfo[5]){
              if(shiftKeyArg){
                    keyInfo[5] = keyInfo[5].toUpperCase();
              }
              keyInfo[5] = keyInfo[5].charCodeAt(0);
        }
        return keyInfo;
    }
    
    function fireKey(){
    
        function accessKeyElements(n) { 
             if(n.tagName=="A" || n.tagName=="INPUT" || n.tagName=="LABEL" || n.tagName=="TEXTAREA"){
        	     return NodeFilter.FILTER_ACCEPT
        	 }
             else{
                 return NodeFilter.FILTER_SKIP;
             }
         }

         if(keyInfo[1] == true){
             var elements = createTreeWalker(doc,NodeFilter.SHOW_ELEMENT,accessKeyElements,false);
             
             while (elements.nextNode()) {
                 if(elements.currentNode.accessKey && elements.currentNode.accessKey == String.fromCharCode(keyInfo[5])){
                     fireMouseEvent("click", elements.currentNode);
                     return;
                 }
             }
         }
            
         var event = doc.createEvent("KeyEvents");
         event.initKeyEvent("keypress", // typeArg
              false, // canBubbleArg
              true, // cancelableArg
              null, // viewArg (type AbstractView)
              keyInfo[0], // ctrlKeyArg
              keyInfo[1], // altKeyArg
              keyInfo[2], // shiftKeyArg
              keyInfo[3], // metaKeyArg
              keyInfo[4], // keyCodeArg
              keyInfo[5] // charCodeArg
         );
         ctrlKeyArg = false;
         altKeyArg = false;
         shiftKeyArg = false;
         metKeyArg = false;
         charKey = 0;
         keyCode = 0;
         keyInfo = [];
         return node.dispatchEvent(event);
    }
    
    return allKeyInfo;
}

/**
 * Fires a generic event (not a raw mouse or keyboard input event) via automation.
 * 
 * @param type is the name of the type of event, such as "change".
 * @param node the Node that should receive the event
 * @return boolean indicating whether any of the listeners which handled the
 *         event called preventDefault. If preventDefault was called
 *         the value is false, else the value is true.
 */

function fireEvent(/*String*/ type, /*Node*/ node) { 
  // Mozilla spec for events:
  //   http://developer.mozilla.org/en/docs/DOM:event
  var doc = node.ownerDocument;
  var event = doc.createEvent("HTMLEvents");
  event.initEvent(type, true, true);
  return node.dispatchEvent(event);
}

function fireUIEvent(/*String*/ type, /*Node*/ node) { 
  // Mozilla spec for events:
  //   http://developer.mozilla.org/en/docs/DOM:event
  var doc = node.ownerDocument;
  var event = doc.createEvent("UIEvents");
  event.initUIEvent(type, true, true, doc.defaultView, 1);
  return node.dispatchEvent(event);
}







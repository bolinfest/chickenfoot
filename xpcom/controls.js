/* controls.js
 *
 * This suite of commands allows the client to add controls
 * to a web page that can run commands with chrome permissions
 * when clicked on.
 *
 */

/**
 * Link object.
 */
function Link(label, func) {
  this.label = label.toString();
  this.func = makeEventHandler(func);
}

Link.prototype.toNode = function(/*Range*/ range) {
  var doc = range.startContainer.ownerDocument;
  var node = doc.createElement("A");
  node.setAttribute("href", "javascript:void(0)");
  node.appendChild(doc.createTextNode(this.label));
  if (this.func) node.addEventListener("click", this.func, false);
  return node;
}

Link.prototype.toString = function() {
  return '<A href="javascript:void(\'' + escape(this.func.name) + '\')">' + this.label + '</A>';
}

/**
 * Button object.
 */
function Button(label, func) {
  this.label = label.toString();
  this.func = makeEventHandler(func);
}

Button.prototype.toNode = function(/*Range*/ range) {
  var doc = range.startContainer.ownerDocument;
  var node = doc.createElement("INPUT");
  node.setAttribute("type", "BUTTON");
  node.setAttribute("value", this.label.toString());
  if (this.func) node.addEventListener("click", this.func, false);
  return node;
}

Button.prototype.toString = function() {
  return '<INPUT type="BUTTON" onclick="javascript:void(\'' + escape(this.func.name) + '\')" value="' + this.label + '">';
}


/**
 * onClick() attaches a handler to an existing node.
 */
function onClickImpl(/*Document*/ doc, 
                     /*Pattern*/ pattern, 
                     /*String or Function*/ handler) {
  var node = patternAsNode(pattern, doc);
  node.addEventListener("click", makeEventHandler(handler), false);  
}


function makeEventHandler(/*String or Function*/ func) {
  if (instanceOf(func, String)) {
    throw new Error("string event handlers not supported yet");
  } else {
    return func;
  }
}

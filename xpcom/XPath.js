// Mozilla XPath reference: http://www-xray.ast.cam.ac.uk/~jgraham/mozilla/xpath-tutorial.html

/**
 * @param xpathExpression {string}
 * @param details {object} OPTIONAL 
 */
function XPath(/*string*/ xpathExpression, 
               /*optional object*/ details) {
  this._xpathExpression = xpathExpression;
  this._namespaceResolver = null;
  this._resultType = XPathResult.ANY_TYPE;
  if (details) {
    var fields = ["_namespaceResolver", "_resultType"];
    for (var i = 0; i < fields.length; ++i) {
      var f = fields[i];
      if (!!details[f]) this[f] = details[f];
    }
  }
}

XPath.prototype.xpathExpression getter = function() { return this._xpathExpression; }
XPath.prototype.namespaceResolver getter = function() { return this._namespaceResolver; }
XPath.prototype.resultType getter = function() { return this._resultType; }

XPath.prototype.toString = function() {
  return "XPath: " + this.xpathExpression;
}

function generateXPath(/*Node*/ target, includeClasses) {
    var expression = "";
    var currentNode = target;
    
    while (currentNode && currentNode.parentNode) {
        var children = currentNode.parentNode.childNodes;
        
        var count = 0;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == currentNode.nodeName) {
                count++;
            }
            
            if (children[i] == currentNode) {
                break;
            }
        }
        
        if (includeClasses && currentNode.className){
            expression = '[@class="' + currentNode.className + '"]' + expression;
        }
        
        expression = "/" + currentNode.nodeName + "[" + count + "]" + expression;
        currentNode = currentNode.parentNode;
    }
    //debug(target.nodeValue + " " + target.ownerDocument.nodeName + " " + target.ownerDocument.defaultView);
    return new XPath(expression);
}


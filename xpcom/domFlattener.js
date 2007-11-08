/*
 * Define helper methods to flatten DOM
 */

/*
 * Mozilla's DOM parser does an interesting thing with <script> tags.
 * First, consider the following:
 * 
 * <script><!-- true; --></script>
 * 
 * This gets parsed as an [object HTMLScriptElement] with 1 child node whose type
 * is Node.TEXT_NODE and whose nodeValue is "<!-- true; -->"
 * Note that the "<!--" and "-->" are included in the nodeValue.
 *
 * However, Mozilla's DOM parser treats the following differently:
 *
 * <p><!-- true; --></p>
 *
 * This gets parsed as an [object HTMLParagraphElement] with 1 child node whose type
 * is Node.COMMENT_NODE and whose nodeValue is " true;"
 * Note that the "<!--" and "-->" are NOT included in the nodeValue
 * and that a Node.COMMENT_NODE has no children.
 *
 * This means that child nodes of <script> tags must be treated in a special way.
 * This also seems to be the case for <style> elements.
 */

function flattenDom(rootNode, uidgen, nodes) {
  if (!uidgen) uidgen = new UidGen();
  if (!nodes) nodes = [];
  var buffer = new StringBuffer();
  flatten(rootNode, uidgen, nodes, buffer);
  return [buffer.toString(), nodes, uidgen];
}

/**
 * Unroll/flatten a Node (the DOM) into a string of xhtml
 * @param n a Node
 * @return a flattened xhtml string representation of the node
 */
function flatten(n, nodeCount, nodes, buffer) {
   // TODO removing IFRAME may break some invariants, should investigate
   if (n.nodeType == Node.ELEMENT_NODE && n.tagName == "IFRAME") return "";
   var id = nodeCount.nextId();
   nodes[id] = n;
   n["_MozillaDocumentId"] = id; // make it possible to look up place in array in constant time
   switch(n.nodeType) {
      case Node.ELEMENT_NODE :
         return flattenElementNode(n, nodeCount, nodes, buffer);
      case Node.TEXT_NODE :
         return flattenTextNode(n, nodeCount, nodes, buffer);
      case Node.COMMENT_NODE :
         return flattenCommentNode(n, nodeCount, nodes, buffer);
   }
}

function removeXmlChars(str) {
  if (!str) return "";
  // negative lookahead, explained:
  // http://www.amk.ca/python/howto/regex/regex.html#SECTION000540000000000000000
  str = str.replace(/&(?!amp;$)/g, '&amp;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/\"/g, '&quot;');
  return str;
}

attributeNameRegexp = /^[A-Za-z_][A-Za-z0-9_-]*$/;

/**
 * @param n, a Node of type Element
 * @return a flattened xml string representation of the node
 */
function flattenElementNode(n, nodeCount, nodes, buffer) {
  buffer.append("<" + n.tagName);
  // add attributes
  if(n.hasAttributes()) {
     var nodeMap = n.attributes;
     for(var i = 0; i < nodeMap.length; i++) {
        attr = nodeMap.item(i);
        if (!attr.nodeName.match(attributeNameRegexp)) continue;
        
        if (n.tagName == 'A' && attr.nodeName == 'href') {
          value = n.toString(); // turns relative URLs into absolute ones
          n.setAttribute('href', value); // replace in DOM
        } else {
          value = attr.nodeValue;
        }

        // escape & and < character
        buffer.append(" " + attr.nodeName + "=\"" + removeXmlChars(value) + "\"");
     }
  }
  buffer.append(">");
  
  // add children
  if(n.hasChildNodes()) {
    var children = n.childNodes;
    for(var i = 0; i < children.length; i++) {
      child = children[i];
      buffer.append(flatten(child, nodeCount, nodes, buffer));
    }
  }

  // close element
  buffer.append("</" + n.tagName + ">");
}

function flattenCommentNode(n, nodeCount, nodes, buffer) {
  buffer.append("<!-- -->"); // drop n.nodeValue as it adds nothing
                             // and only seems to screw up the XML parser
                             // the comment node is only kept as a placeholder
}

function flattenTextNode(n, nodeCount, nodes, buffer) {
  var parentTag = n.parentNode.tagName;
  if (parentTag == 'SCRIPT' || parentTag == 'STYLE') {
    // content inside SCRIPT and STYLE tags should not be
    // matched by a TC pattern
    buffer.append(" ");
  } else {
    buffer.append(removeXmlChars(n.nodeValue));
  }
}

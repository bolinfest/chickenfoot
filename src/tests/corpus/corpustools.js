var pairTable = new Array();
var opCache = new Array();
var oldNode;
var newDiv;
var lineDiv;
var canvas;
var lineCanvas;
var ctx;
var lineCtx;
var filename = "";
var dragging = false;
var CORPUS_ROOT = "~/Documents/corpus/";

function generateXPath(target) {
    var expression = "";
    var currentNode = target;
    var tagcount;
    
    while (currentNode && currentNode.nodeName != "#document") {
    tagcount = 0;
    var children = currentNode.parentNode.childNodes;
    for (var i=0; i < children.length; i++) {
            if (currentNode.nodeName == children[i].nodeName)
                tagcount++;
            if (children[i] == currentNode) {
                break;
            }
        }
        expression = "/" + currentNode.nodeName + "[" + tagcount + "]" + expression;
        currentNode = currentNode.parentNode;
    }   
    return expression;
}

function getBox(node) {
    //return document.getBoxObjectFor(node);
    //*
    while (!node.offsetWidth) node = node.parentNode;
    var box = { x: 0, y: 0, height:node.offsetHeight, width: node.offsetWidth };
    while (node) {
        box.x += node.offsetLeft;
        box.y += node.offsetTop;
        node = node.offsetParent;
    }
    return box;
    //*/
}

function findLabelFor(element) {
    if (!element.parentNode || element.nodeName == "FORM") return null;
    for (var i=0; i < element.parentNode.childNodes.length; i++)
    {
        if (element.parentNode.childNodes[i] == element)
        {
            for (var j=i-1; j>=0; j--)
            {
                var newNode = element.parentNode.childNodes[j];
                if (newNode.textContent) {// && !newNode.textContent.startsWith("<!--"))
                    if (newNode.nodeName.indexOf("#")<0) return filteredDown(newNode);
                }
            }
            break;
        }
    }
    return findLabelFor(element.parentNode);
}

function filteredDown(element) {
    for (var i=0; i<element.childNodes.length; i++) {
        if (element.childNodes[i].textContent == element.textContent && element.childNodes[i].nodeName!="#text") {
            return filteredDown(element.childNodes[i]);
        }
    }
    return element;
}

function drawOverlay() {
    for (var i=0; i<pairTable.length; i++) {
        if (pairTable[i].label) {
            drawLine(pairTable[i].textbox, pairTable[i].label);
            drawBoxAroundNode(pairTable[i].label, 'rgb(50,255,80)');
        } else {
            drawBoxAroundNode(pairTable[i].textbox, 'rgb(255,0,0)');
        }
    }
}

function drawLine(node1, node2) {
    var node1box = getBox(node1);
    var node2box = getBox(node2);
    ctx.strokeStyle = 'rgb(0,155,0)';
    if (node1box.x < node2box.x) {
        endx = node2box.x;
    } else {
        endx = node2box.x+node2box.width;
    }
    ctx.beginPath();
    ctx.moveTo(node1box.x+node1box.width/2, node1box.y + node1box.height/2);
    ctx.lineTo(endx, node2box.y + node2box.height/2);
    ctx.closePath();
    ctx.stroke();
}

function redrawCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawOverlay(pairTable, ctx);
}

function drawBoxAroundNode(node, strokeColor) {
    var nodeBox = getBox(node);
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.rect(nodeBox.x, nodeBox.y, nodeBox.width, nodeBox.height);
    ctx.closePath();
    ctx.stroke();
}

function clickTextbox(clickedNode) {
    // output("click sent to textbox " + clickedNode);
    if (dragging)
	{
		redrawCanvas();
	}
	else addMoveListener();
    drawBoxAroundNode(clickedNode, 'rgb(0,0,255)');
    oldNode = clickedNode;
	oldNodeBox = getBox(clickedNode);
    dragging = true;
}

function clickLabel(clickedNode, evt) {
    if (dragging)
    {
        var index = getIndexOfPair(oldNode,clickedNode);
        if (!evt.altKey)
        {
            if (index == null)
            {
                pairTable.push({textbox: oldNode, textboxName: oldNode.name,
                    label: clickedNode, labelText: clickedNode.textContent});
                output("label assigned");
             }
        }
        else
        {
            if (index != null)
            {
                pairTable.splice(index, 1);
                output("label removed");
            }
            else return;
        }
        dragging = false;
        endMoveListener();
    }
    else return;

    output("saving...");
    saveToFile();
    output("redrawing...");
    redrawCanvas();
    output("redrawn");
}

function isInput(textbox) {
    if (textbox.nodeName == "INPUT" || textbox.nodeName == "SELECT")
        return true;
    else
        return false;
}

function tableHasValue(label) {
    for (var i=0; i<pairTable.length; i++) {
        if (pairTable[i].label == label)
          return true;
    }
    return false;
}

function getIndexOf(textbox) {
    for (var i=0; i<pairTable.length; i++) {
        if (pairTable[i].textbox == textbox)
          return i;
    }
    return null;
}

function getIndexOfPair(node, label) {
    for (var i=0; i<pairTable.length; i++) {
        if (pairTable[i].label == label && pairTable[i].textbox == node)
          return i;
    }
    return null;
}

function clickCanvas(evt) {
//    var hitNode = hittest(document.body, evt.pageX, evt.pageY);
    var hitNode = newhittest(document.body, evt.pageX, evt.pageY, 0, 0);
/*
    var childNodes = document.body.childNodes;
    var hitNode = null;
    for (var i=0; i<childNodes.length; i++) {
        if (childNodes[i] != newDiv && childNodes[i].nodeType == 1)
        {
            var node = hittest(childNodes[i], evt.pageX, evt.pageY);
            hitNode = node;
        }
    }
*/
output(generateXPath(hitNode));
    // output("key: "+tableHasKey(hitNode));
    if (hitNode) {
        if (hitNode.nodeName == "OPTION") hitNode = hitNode.parentNode;
        if (!evt.altKey && isInput(hitNode)) clickTextbox(hitNode);
        else clickLabel(hitNode, evt);
    }
    evt.preventDefault();
}

function moveLine(evt) {
    lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height);
    if (!evt.altKey)
        lineCtx.strokeStyle = 'rgb(0,255,0)';
    else
        lineCtx.strokeStyle = 'rgb(255,0,0)';
    lineCtx.beginPath();
    lineCtx.moveTo(oldNodeBox.x+oldNodeBox.width/2, oldNodeBox.y+oldNodeBox.height/2);
    lineCtx.lineTo(evt.pageX, evt.pageY);
    lineCtx.closePath();
    lineCtx.stroke();
	lineCtx.preventDefault();
}

function createCanvas(evt) {
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', document.body.scrollWidth);
    canvas.setAttribute('height', document.body.scrollHeight);
    newDiv.appendChild(canvas);
    ctx = canvas.getContext('2d');
    drawOverlay(pairTable, ctx);
    canvas.addEventListener('click', clickCanvas, true);

	lineCanvas = document.createElement('canvas');
	lineCanvas.addEventListener('mousemove', moveLine, true);
    lineCanvas.setAttribute('width', document.body.scrollWidth);
    lineCanvas.setAttribute('height', document.body.scrollHeight);
    lineDiv.appendChild(lineCanvas);
    lineCtx = lineCanvas.getContext('2d');
}

function addMoveListener() {
	output("addMoveListener");
	canvas.addEventListener('mousemove', moveLine, true);
}

function endMoveListener() {
	output("endMoveListener");
    lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height);
	canvas.removeEventListener('mousemove', moveLine, true);
}

function getArea(node) {
   if (!node.offsetWidth || !node.offsetHeight) return null;
   return node.offsetWidth*node.offsetHeight;
}

function newhittest(elmt, x, y, t, l) {
   var hitNode = elmt;
   var offsetChildren = opCache[generateXPath(elmt)];
   if (!offsetChildren) return hitNode;
   for (var i=0; i<offsetChildren.length; i++) {
       var child = offsetChildren[i];
       if (child.nodeType != 1) continue;

       var top = t + child.offsetTop;
       var left = l + child.offsetLeft;
       if (left <= x && top <= y && (x - left) < child.offsetWidth && (y - top) < child.offsetHeight) {
           var hit = newhittest(child, x, y, top, left);
           if (getArea(hit)>0 && getArea(hit)<getArea(hitNode)) hitNode = hit;
       }
   }
   return hitNode;
}

function hittest(elmt, x, y) {
   var childNodes = elmt.childNodes;
   for (var i = 0; i < childNodes.length; i++) {
       var childNode = childNodes[i];
       if (childNode.nodeType != 1) {
           continue;
       } else {
           var box = document.getBoxObjectFor(childNode);
           if (box.x <= x && box.y <= y && (x - box.x) < box.width && (y - box.y) < box.height) {
               return hittest(childNode, x, y);
           }
       }
   }
   return elmt;
}

function getPairTableJSON() {
    var json = "pairTable = { \n\n";
    for (var i=0; i<pairTable.length; i++) {
        json += "{\ntextbox: document.evaluate(\""+
            generateXPath(pairTable[i].textbox)+"\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,\nlabel: ";
        if (pairTable[i].label)
            json += "document.evaluate(\""+generateXPath(pairTable[i].label)+"\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue";
        else
            json += "null";
        json += ",\ntextboxName: \""+
            pairTable[i].textboxName.replace(/'/g,'\\\\\\\'').replace(/"/g,'\\\\\\\"')+"\",\nlabelText: \"";
        if (pairTable[i].labelText)
            json += pairTable[i].labelText.replace(/'/g,'\\\\\\\'').replace(/"/g,'\\\\\\\"')+"\"";
        else
            json += "null";
        json += "}\n\n";
        if (i != pairTable.length-1) json += ",\n";
    }
    json += "};\n";
    return json;
}

function getURLFilename(url) {
    if (filename == "")
        filename = CORPUS_ROOT+url.split('://')[1].replace(/[:\/]/g,'-')+(new Date()).getTime();
    return filename;
}

function removeUselessNodes(elmt) {
    for (var i=0; i<elmt.childNodes.length; i++) {
       var node = elmt.childNodes[i];
       if (node.nodeName=="SCRIPT" || node.nodeType==8)
       {
           node.parentNode.removeChild(node);
           i -= 1;
       }
       else removeUselessNodes(node);
    }
}

function saveDOMToFile() {
    var s = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].getService(Components.interfaces.nsIDOMSerializer);
    var xml = s.serializeToString(document);

    var p = Components.classes["@mozilla.org/xmlextras/domparser;1"].getService(Components.interfaces.nsIDOMParser);
    var dom = p.parseFromString(xml, "text/xml");
    if (dom.documentElement.nodeName == "parsererror") {
        output("error parsing serialized dom");
        output(s.serializeToString(dom));
        return false;
    } else {
        var filePath = getURLFilename(location.href);
        Chickenfoot.SimpleIO.write(filePath+".dom", xml);
        output("wrote to: "+filePath+".dom");
        return true;
    }
}

function saveToFile() {
    var filePath = getURLFilename(location.href);
    Chickenfoot.SimpleIO.write(filePath+".pairs", getPairTableJSON());
    output("wrote to: "+filePath+".pairs");
}

function startMatch() {
    for (m = find("textbox"); m.hasMatch; m = m.next) {
        var textboxLabel = findLabelFor(m.element);
        var text = textboxLabel ? textboxLabel.textContent : null;
        pairObject = {textbox: m.element,
                      textboxName: m.element.name,
                      label: textboxLabel,
                      labelText: text};
        pairTable[pairTable.length] = pairObject;
    }
    for (m = find("listbox"); m.hasMatch; m = m.next) {
        var textboxLabel = findLabelFor(m.element);
        var text = textboxLabel ? textboxLabel.textContent : null;
        pairObject = {textbox: m.element,
                      textboxName: m.element.name,
                      label: textboxLabel,
                      labelText: text};
        pairTable[pairTable.length] = pairObject;
    }
    for (m = find("checkbox"); m.hasMatch; m = m.next) {
        var textboxLabel = findLabelFor(m.element);
        var text = textboxLabel ? textboxLabel.textContent : null;
        pairObject = {textbox: m.element,
                      textboxName: m.element.name,
                      label: textboxLabel,
                      labelText: text};
        pairTable[pairTable.length] = pairObject;
    }
    for (m = find("radiobutton"); m.hasMatch; m = m.next) {
        var textboxLabel = findLabelFor(m.element);
        var text = textboxLabel ? textboxLabel.textContent : null;
        pairObject = {textbox: m.element,
                      textboxName: m.element.name,
                      label: textboxLabel,
                      labelText: text};
        pairTable[pairTable.length] = pairObject;
    }

    newDiv = document.createElement('div');
    newDiv.setAttribute('style','width: '+document.body.scrollWidth+'px; height: '+document.body.scrollHeight+'px; position: absolute; top: 0px; left: 0px; z-index: 3;');
    document.body.appendChild(newDiv);
    lineDiv = document.createElement('div');
    lineDiv.setAttribute('style','width: '+document.body.scrollWidth+'px; height: '+document.body.scrollHeight+'px; position: absolute; top: 0px; left: 0px; z-index: 2;');
    document.body.appendChild(lineDiv);
    createCanvas();
    saveToFile();
}

function makeOffsetParentCache(elmt) {
    var xpath = generateXPath(elmt.offsetParent);
    var hash = opCache[xpath];
    if (!hash) opCache[xpath] = new Array(elmt);
    else opCache[xpath][hash.length] = elmt;
    for (var i=0; i<elmt.childNodes.length; i++) {
        makeOffsetParentCache(elmt.childNodes[i]);
    }
}

removeUselessNodes(document);
output("useless nodes gone");
if (saveDOMToFile())
{
    makeOffsetParentCache(document.body);
    output("offset parents cached");
    startMatch();
}






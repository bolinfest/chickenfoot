goog.require('ckft.dom');

/**
    Animates a growing green transparent rectangle over the given node,
    and when it's done, it calls "thenDoThis".
    
    @param  node        A node in a webpage.
    @param  thenDoThis  A function that will get called after the animation is complete (or null)
    @return             Returns a feeling of awe.
*/
function /*void*/ animateTransparentRectangleOverNode(/*Node*/ node, /*function*/ thenDoThis) {

    // set a local version of document and window for use in the following helper functions,
    // so they can feel as if they are in a webpage
    var document = node.ownerDocument
    var window = document.defaultView

    // helper function to get the position of a node
    function getNodePosition(node) {
        var pos = {}
        if ("offsetLeft" in node) {
            pos.x = node.offsetLeft
            pos.y = node.offsetTop
            pos.w = node.offsetWidth
            pos.h = node.offsetHeight
            if (node.offsetParent != null) {
                var parentPos = getNodePosition(node.offsetParent)
                pos.x += parentPos.x
                pos.y += parentPos.y
            }
        } else if (node.parentNode != null) {
            pos = getNodePosition(node.parentNode)
        } else {
            pos.x = 0
            pos.y = 0
            pos.w = 0
            pos.h = 0
        }
        return pos
    }
    
    // helper function to set location, size, opacity and color of a div
    function setDivStyle(div, x, y, w, h, o, color) {
        if (color == undefined) {
            color = "green"
        }
        div.style.position = "absolute"
        div.style.left = x + "px"
        div.style.top = y + "px"
        div.style.width = w + "px"
        div.style.height = h + "px"
        div.style.backgroundColor = color
        div.style.opacity = o
        
        // NOTE: this is not a magic number, we just want something bigger than anything on the page,
        // and 1000000 is usually good enough
        div.style.zIndex = 1000000
    }
    
    // helper function to create a div with the desired location, size, opacity and color    
    function createDiv(x, y, w, h, o, color) {
        var div = document.createElement("DIV")
        setDivStyle(div, x, y, w, h, o, color)
        document.body.appendChild(div)
        return div
    }
    
    // if the node is a listitem in some combo box,
    // then we usually want to highlight the combo box itself,
    // which is the parent of the listitem
    if (ckft.dom.getTagName(node) == "OPTION") {
        node = node.parentNode
    }
    
    // the idea is this,
    // we create two divs (div and div2) both at the location of the original node,
    // and then we create a series of timer events which enlarges one of the divs,
    // and makes it more transparent as it gets bigger,
    // and in the end, we call "thenDoThis"

    // we initialize these variables here, and we'll reference them inside the timer event handler below
    var pos = getNodePosition(node)
    var o = 1.0
    var div = createDiv(pos.x, pos.y, pos.w, pos.h, o, "green")
    var div2 = createDiv(pos.x, pos.y, pos.w, pos.h, 0.5, "green")
    
    var totalUpdates = 8
    var timeBetweenUpdates = 50
    
    for (var i = 1; i <= totalUpdates; i++) {
        var inc = 3
        window.setTimeout(function () {
            pos.x -= inc
            pos.y -= inc
            pos.w -= -2 * inc
            pos.h -= -2 * inc
            o /= 1.3
            
            try {
                setDivStyle(div, pos.x, pos.y, pos.w, pos.h, o, "green")
            } catch (e) {}
        }, i * timeBetweenUpdates)
    }
    window.setTimeout(function () {
        div.parentNode.removeChild(div)
        div2.parentNode.removeChild(div2)
        if (thenDoThis != undefined) {
            thenDoThis()
        }
    }, totalUpdates * timeBetweenUpdates + 100)
}

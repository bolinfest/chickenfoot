
/**
    Takes a DOM object (nsIDOM3Document I believe) and creates a string of xml text.
    
    @param  dom             An HTMLDocument object to convert.
    @return                 A string representation of dom.
*/
function /*string*/ domToString(/*nsIDOM3Document*/ dom) {
    var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].
        createInstance(Components.interfaces.nsIDOMSerializer)
    return serializer.serializeToString(dom)
}

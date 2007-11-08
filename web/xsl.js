/**
 * This is a JavaScript library to transform an XML file using XSL in JavaScript.
 * Presumably, this works on Fx 1.0.2 and IE6, as those browsers support XSLT:
 *
 * http://www.w3schools.com/xsl/xsl_browsers.asp
 *
 * The code for this library was adapted from these web pages:
 *
 * http://www.webxpertz.net/forums/showthread.php?t=30178
 * http://devzone.skillfusion.com/ajaxArticle10.php
 */

function getXhtml(xmlUri, xslUri, id) {
	if(navigator.appName.toLowerCase().indexOf('microsoft') == -1) {
		return getXhtmlMoz(xmlUri, xslUri, id);
	} else {
		return getXhtmlIe(xmlUri, xslUri, id);
	}
}

function getXhtmlMoz(xmlUri, xslUri, id) {

  //Load the XML document
	var myXMLHTTPRequest = new XMLHttpRequest();
	myXMLHTTPRequest.open("GET", xmlUri, false);
	myXMLHTTPRequest.send(null);

	var xmlDoc = myXMLHTTPRequest.responseXML;

  //Load the XSL stylesheet
	myXMLHTTPRequest = new XMLHttpRequest();
	myXMLHTTPRequest.open("GET", xslUri, false);
	myXMLHTTPRequest.send(null);

	var xslStylesheet = myXMLHTTPRequest.responseXML;
	var xsltProcessor = new XSLTProcessor();
	xsltProcessor.importStylesheet(xslStylesheet);

  //Transform
	var fragment = xsltProcessor.transformToFragment(xmlDoc, document);

  //Insert HTML
  var ele = document.getElementById(id);
  //ele.innerHTML = "";
  //ele.innerHTML = fragment.textContent;
	ele.appendChild(fragment);
}

function getXhtmlIe(xmlUri, xslUri, id) {
  
  // Load XML 
  var xml = new ActiveXObject("Microsoft.XMLDOM")
  xml.async = false
  xml.load(xmlUri)
  
  // Load XSL
  var xsl = new ActiveXObject("Microsoft.XMLDOM")
  xsl.async = false
  xsl.load(xslUri)
  
  // Transform
  document.getElementById(id).innerHTML = xml.transformNode(xsl); 
  //document.write(xml.transformNode(xsl))
  /*
    //Load the XML document
  	var xmlDoc = new ActiveXObject("msxml.DOMDocument");
  	xmlDoc.load(xmlUri);
  
    //Load the XSL stylesheet
  	var xslStylesheet = new ActiveXObject("msxml.DOMDocument");
  	xslStylesheet.load(xslUri);
  
    //Transform
  	var xhtml = xmlDoc.transformNode(xslStylesheet);
  
    //Insert HTML
  	document.getElementById(id).innerHTML = xhtml;
  	*/
}

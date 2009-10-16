/**
 * @fileoverview Functions for syncing via Google Docs.
 */


/**
 * Gets a GData Google Docs auth token to use with the Google Account that
 * corresponds to the specified email address. Uses Google's ClientLogin to
 * obtain the token:
 * http://code.google.com/apis/accounts/docs/AuthForInstalledApps.html
 * @param {string} email Email address of the account to get an auth token for.
 * @param {string} password Password for the account.
 * @return {string?} The auth token
 */
function getGDocsAuth(email, password) {
  var authToken = null;
  var googUrl = "https://www.google.com/accounts/ClientLogin";
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open("POST", googUrl, asynchronous);

  var params = "accountType=GOOGLE&Email=" + encodeURIComponent(email) +
      "&Passwd=" + encodeURIComponent(password) + "&service=writely";
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.setRequestHeader("GData-Version", "2.0");
  request.setRequestHeader("Connection", "close");
  request.send(params);

  if (request.status == 200) {
    var data = request.responseText;
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i];
      var match = line.match(/^Auth=([\w-]+)$/);
      if (match) {
        authToken = match[1];
        break;
      }
    }
  } else {
    throw new Error('Login error: ' + request.status + ' ' +
        request.statusText);
  }
  return authToken;
}


/**
 * Makes an authenticated GET request to GDocs.
 * @param {string} authToken Token acquired using getGDocsAuth().
 * @param {string} url GDocs URL to make the request to.
 * @return {string} The text of the response from the GDocs server.
 */
function getGDocsXMLfromURL(authToken, url) {
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open("GET", url, asynchronous);

  request.setRequestHeader("GData-Version", "2.0");
  request.setRequestHeader("Authorization", "GoogleLogin auth=" + authToken);
  request.setRequestHeader("Connection", "close");
  request.send(null);

  if (request.status == 200) {
    return request.responseText;
  } else {
    throw new Error('Error making GET request: ' + request.status + ' ' +
        request.statusText);
  }
}


/**
 * Makes an authenticated POST request to GDocs that sends XML.
 * @param {string} authToken Token acquired using getGDocsAuth().
 * @param {string} url GDocs URL to make the request to.
 * @param {string} xml
 * @return {string}
 */
function getGDocsXMLfromURL_sendXML(authToken, url, protocol, xml) {
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open(protocol, url, asynchronous);

  request.setRequestHeader("Content-Type", "application/atom+xml");
  request.setRequestHeader("GData-Version", "2.0");
  request.setRequestHeader("Authorization", "GoogleLogin auth=" + authToken);
  request.setRequestHeader("Content-Length", xml.length);
  request.setRequestHeader("Connection", "close");
  request.send(xml);

  if (request.status == 201) {
    var data = request.responseText;
    return data;
  } else {
    throw new Error('ERROR: ' + request.status + ' ' +
        request.statusText);
  }
}


function _constructContentBody(docTitle, docType, contentBody, contentType) {
  var atom = "<?xml version='1.0' encoding='UTF-8'?>" +
             '<entry xmlns="http://www.w3.org/2005/Atom">' +
             '<category scheme="http://schemas.google.com/g/2005#kind"' +
             ' term="http://schemas.google.com/docs/2007#' + docType + '" label="' + docType + '"/>' +
             '<title>' + docTitle + '</title>' +
             '</entry>';

  var body = '--END_OF_PART\r\n' +
             'Content-Type: application/atom+xml;\r\n\r\n' +
             atom + '\r\n' +
             '--END_OF_PART\r\n' +
             'Content-Type: ' + contentType + '\r\n\r\n' +
             contentBody + '\r\n' +
             '--END_OF_PART--\r\n';  
  return body;  
}  

// make a plain text request to GDocs
function getGDocsXMLfromURL_sendText(auth, URL, protocol, thingToSend) {
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open(protocol, URL, asynchronous);
  
  request.setRequestHeader("GData-Version", "2.0");
  request.setRequestHeader("Authorization", "GoogleLogin auth=" +auth);
  request.setRequestHeader("If-Match", "*"); 
  request.setRequestHeader("Connection", "close");
  request.setRequestHeader("Content-Length", thingToSend.length);
  request.setRequestHeader("Content-Type", "text/plain;");
  request.send(thingToSend);

  if (request.status == 200) {
     var data = request.responseText;
     return data;
  } else {
   throw new Error('ERROR: ' + request.status + ' ' +
   request.statusText);
  }
} 

// send multipart content
function getGDocsXMLfromURL_sendMultipart(auth, URL, protocol, thingToSend) {
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open(protocol, URL, asynchronous);
  
  request.setRequestHeader("GData-Version", "2.0");
  request.setRequestHeader("Authorization", "GoogleLogin auth=" +auth);
  request.setRequestHeader("If-Match", "*"); 
  request.setRequestHeader("Connection", "close");
  request.setRequestHeader("Content-Length", thingToSend.length);
  request.setRequestHeader("Content-Type", "multipart/related; boundary=END_OF_PART");
  request.send(thingToSend);

  if (request.status == 200) {
     var data = request.responseText;
     return data;
  } else {
   throw new Error('ERROR: ' + request.status + ' ' +
   request.statusText);
  }
}

// make chickenfoot triggers folder
function createGDocsChickenfootFolder(auth) {
  var url = "http://docs.google.com/feeds/documents/private/full";
  var entry = "";

  entry += '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">';
  entry += '<atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#folder" label="folder"/>';
  entry += '<atom:title>Chickenfoot Triggers</atom:title>';
  entry += '</atom:entry>';
  
  var result = getGDocsXMLfromURL_sendXML(auth, url, "POST", entry);
  return result;
}

// create empty file in chickenfoot triggers folder
function createGDocsEmptyFile(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var entry = "";

  entry += '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">';
  entry += '<atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#document" label="document"/>';
  entry += '<atom:title>' + filename + '</atom:title>';
  entry += '</atom:entry>';
  
  var result = getGDocsXMLfromURL_sendXML(auth, url, "POST", entry);
  return result;
}

// get chickenfoot triggers folder id
function getGDocsChickenfootFolderID(auth) {
  var url = "http://docs.google.com/feeds/documents/private/full?showfolders=true";
  var result = getGDocsXMLfromURL(auth, url);
  
  var id = _findTitleInXML(result, "Chickenfoot Triggers");
  // if not found, create folder
  if (id == "") {
    result = createGDocsChickenfootFolder(auth);
    id = _findTitleInXML(result, "Chickenfoot Triggers");
  }
  
  return id;
}

// get all file names in chickenfoot folder
function getGDocsAllChickenfootFileNames(auth, folderid) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url);
  
  var titles = new Array();
  var j = 0;
  var parser = new DOMParser();
  var doc = parser.parseFromString(result, "text/xml");
  var entries = doc.getElementsByTagName('entry');
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    if (entry.getElementsByTagName('title').length > 0) {
      var title = entry.getElementsByTagName('title')[0].textContent;
      titles[j] = title;
      j++;
    }
  }
  
  return titles;
}

// check if folder contains filename
function containsGDocsChickenfootScript(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url);
  
  var id = _findTitleInXML(result, filename);
  return (id != "");
}

// get document id of a chickenfoot script (create empty if not exist)
function getGDocsChickenfootScriptID(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url);
  
  var id = _findTitleInXML(result, filename);
  // if not found, create empty file
  if (id == "") {
    result = createGDocsEmptyFile(auth, folderid, filename);
    id = _findTitleInXML(result, filename);
  }
  
  return id;
}

// get document's edit link for a chickenfoot script (create empty if not exist)
function getGDocsChickenfootScriptEditLink(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url);

  var editlink = _findEditLinkByTitleInXML(result, filename);
  // if not found, create empty file
  if (editlink == "") {
    result = createGDocsEmptyFile(auth, folderid, filename);
    editlink = _findEditLinkByTitleInXML(result, filename);
  }
  return editlink;
}

function updateGDocsDocument(auth, editlink, title, content) {
  var url = editlink;
  var result = getGDocsXMLfromURL_sendMultipart(auth, url, "PUT", _constructContentBody(title, 'document', content, 'text/plain'));
  return result;
}

function _findTitleInXML(xml, title) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, "text/xml");
  var entries = doc.getElementsByTagName('entry');
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    var titles = entry.getElementsByTagName('title');
    if (titles.length > 0) {
      if (titles[0].textContent == title) {
        var id_str = entry.getElementsByTagName('id')[0].textContent;
        return id_str.substring(id_str.lastIndexOf("%3A")+3);
      }
    }
  }
  return "";
}

function _findEditLinkByTitleInXML(xml, title) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, "text/xml");
  var entries = doc.getElementsByTagName('entry');
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    var titles = entry.getElementsByTagName('title');
    if (titles.length > 0) {
      if (titles[0].textContent == title) {
        var links = entry.getElementsByTagName('link');
        for (var j=0; j<links.length; j++) {
          if (links[j].getAttribute('rel') == 'self') {
            var href = links[j].getAttribute('href');
            return 'http://docs.google.com/feeds/media/private/full/' + href.substring(href.indexOf('document%3A'));
          }
        }
      }
    }
  }
  return "";
}

// read a file in GDocs
function readGDocsDocument(auth, folderid, filename) {
  var documentid = getGDocsChickenfootScriptID(auth, folderid, filename);
  var url = "http://docs.google.com/feeds/download/documents/Export?docID=" + documentid + "&exportFormat=txt";
  var result = getGDocsXMLfromURL(auth, url);
  
  return result;
}

// escape from GDocs txt to normal txt (replacing double < and double > with single ones)
function escapeGDocs(content) {
  var ltRegExp = new RegExp(String.fromCharCode(171), "g");
  var gtRegExp = new RegExp(String.fromCharCode(187), "g");
  content = content.replace(ltRegExp, "<");
  content = content.replace(gtRegExp, ">");
  return content;
}

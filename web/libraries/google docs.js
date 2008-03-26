include('fileio.js');

function gDocsInterface() {
this.authKey = "";
this.email = "";
this.loggedIn = false;
this.fetchedInfo = false;
this.procedureQ = new Array();
this.files = new Array();
this.chickenfootTriggersFolder = "Chickenfoot Triggers";
}

function gDoc(name, dateModified, url) {
  this.name = name;
  this.url = url;
  this.dateModified = dateModified;
}

gDocsInterface.prototype.login = function(user, pass) {
  this.email = user;
	var xmlhttp = new XMLHttpRequest();
	var gIObj = this;
	var url = "https://www.google.com/accounts/ClientLogin";
	var postStr = "accountType=GOOGLE" +
		      "&Email=" + encodeURI(user) +
		      "&Passwd=" + encodeURI(pass) +
		      "&service=writely" +
		      "&source=" + encodeURI("UID-Chickenfoot-1.0.1");

	if(xmlhttp!=null) {
		xmlhttp.onreadystatechange = stateChange;
		xmlhttp.open("POST", url, true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.setRequestHeader("Content-length", postStr.length);
		xmlhttp.send(postStr);
	}
	function stateChange() {
		// if xmlhttp request is complete
		if (xmlhttp.readyState==4) {
			// if status is OK
			if (xmlhttp.status==200) {
				var loginResponse = xmlhttp.responseText;
				gIObj.authKey = loginResponse.match(/Auth=(.*)/)[1];
				gIObj.loggedIn = true;
				output("login success");
				gIObj.executeQ();
			}
			else {
				output("Error:\n" + xmlhttp.responseText);
				alert("Error in login request");
			}
		}
	}
}

gDocsInterface.prototype.executeQ = function() {
  output("executing Q");
  while(this.procedureQ.length != 0) {
    var func = this.procedureQ.pop();
    func();
  }
}

gDocsInterface.prototype.doProcedure = function(func) {
  if(this.loggedIn) {
    func();
  } else {
    this.procedureQ.unshift(func);
  }
}

gDocsInterface.prototype.getQuery = function(url, doneHandler) {
	var xmlhttp = new XMLHttpRequest();
	var gIObj = this;
	if(xmlhttp!=null) {
		xmlhttp.onreadystatechange = stateChange;
		xmlhttp.open("GET", url, true);
		xmlhttp.setRequestHeader("Authorization", "GoogleLogin auth="+this.authKey);
		xmlhttp.send(null);
	}
	
	function stateChange() {
		// if xmlhttp request is complete
		if (xmlhttp.readyState==4) {
			// if status is "OK"
			if (xmlhttp.status==200) {
				//call done handler
				output("GET successful");
				doneHandler(gIObj, xmlhttp);
			}
			else {
				alert("Error in getting request");
			}
		}
	}
}

gDocsInterface.prototype.postFile = function(fileName, data) {
  var xmlhttp = new XMLHttpRequest();
  var url = "http://docs.google.com/feeds/documents/private/full";
  var postStr = ["Media multipart posting",
                  "--END_OF_PART",
                  "Content-Type: application/atom+xml",
                  "",
                  "<?xml version='1.0' encoding='UTF-8'?>",
                  "<atom:entry xmlns:atom=\"http://www.w3.org/2005/Atom\">",
                  "  <atom:category scheme=\"http://schemas.google.com/docs/2007/folders/" + this.email + "\"", 
                  "      term=\"" + this.chickenfootTriggersFolder + "\" />",
                  "  <atom:category scheme=\"http://schemas.google.com/g/2005#kind\"", 
                  "      term=\"http://schemas.google.com/docs/2007#document\" />",
                  "  <atom:title>" + fileName + "</atom:title>",
                  "</atom:entry>",
                  "--END_OF_PART",
                  "Content-Type: text/plain",
                  "",
                  data,
                  "",
                  "--END_OF_PART--"].join("\n");
	if(xmlhttp!=null) {
		xmlhttp.onreadystatechange = stateChange;
		xmlhttp.open("POST", url, true);
		xmlhttp.setRequestHeader("Authorization", "GoogleLogin auth="+this.authKey);
		xmlhttp.setRequestHeader("Content-type", "multipart/related; boundary=END_OF_PART");
		xmlhttp.setRequestHeader("Content-length", postStr.length);
		xmlhttp.setRequestHeader("Slug", fileName);
		xmlhttp.setRequestHeader("MIME-version", "1.0");
		xmlhttp.send(postStr);
	}
	function stateChange() {
		// if xmlhttp request is complete
		if (xmlhttp.readyState==4) {
			// if status is OK
			if (xmlhttp.status==201) {
			  output("file post successful");
			  output(xmlhttp.responseXML);
			}
			else {
				output("Error:\n" + xmlhttp.responseText);
				alert("Error in posting file");
			}
		}
	}
}

function processFeed(gIObj, xmlHTTPRequest) {
  output("processing response XML");
  var xmlDoc = xmlHTTPRequest.responseXML;
  var feed = xmlDoc.getElementsByTagName('feed').item(0);
  var entryCollection = feed.getElementsByTagName('entry');
  var entry;
  for(var i=0; i<entryCollection.length; i++) {
    entry = entryCollection.item(i);
    var categoryCollection = entry.getElementsByTagName('category');
    var category;
    for(var j=0; j<categoryCollection.length; j++) {
      category = categoryCollection.item(j);
      var scheme = /folders/;
      var folder = new RegExp(gIObj.chickenfootTriggersFolder);
      if(scheme.test(category.getAttribute('scheme')) &&
          folder.test(category.getAttribute('label'))) {
        var dateUpdated = entry.getElementsByTagName('updated').item(0).textContent;
        var fileName = entry.getElementsByTagName('title').item(0).textContent;
        var url = entry.getElementsByTagName('content').item(0).getAttribute('src');
        var file = new gDoc(fileName, dateUpdated, url);
        gIObj.files.push(file);
      }
    }
  }
  gIObj.fetchedInfo = true;
  output("done fetching");
  gIObj.postFile("test file", "This is a test. This should; transmit properly\n If not life sux;");
}

function getRssFeed() {
  gInterface.getQuery("http://docs.google.com/feeds/documents/private/full", processFeed);
}

var gInterface = new gDocsInterface();
gInterface.login("username@gmail.com", "password"); //use password manager
output("login() returned");
gInterface.doProcedure(getRssFeed);
output("submitQuery() returned");

























// ==UserScript==
// @name Install Trigger Script Button
// @when Pages Match
// @description inserts a button to install chickenfoot scripts from the wiki
// @include http://groups.csail.mit.edu/uid/chickenfoot/scripts/index.php/*
// ==/UserScript==

function installTriggerButtons(document) {

if(document.location.wrappedJSObject.href.match(/http:\/\/groups.csail.mit.edu\/uid\/chickenfoot\/scripts\/index.php\/*/) == null) { return; }
var pred = function (node) {
  var results = [];
  for (var h=0; h<node.childNodes.length; h++) {
    if (node.childNodes[h].tagName == "PRE") {results.push(node.childNodes[h]);}
  }
  return ((node.tagName == "DIV") && (node.childNodes.length > 0) && (results.length > 0));
}
var treewalker = Chickenfoot.createDeepTreeWalker(document.wrappedJSObject, NodeFilter.SHOW_ALL, pred);
var current = treewalker.nextNode();

while(current) {
  if (current.wrappedJSObject) {current = current.wrappedJSObject;}

  //search for user script attributes
  var preElements = filterElements(current.childNodes, "PRE");
  for (var t=0; t<preElements.length; t++) {
    var codeBody = preElements[t].textContent;
    var attMap = Chickenfoot.extractUserScriptAttributes(codeBody);
    var count=0;
    for (prop in attMap) {count++;}
    if (count > 0) {
      var map = { name : attMap.name,
                  when : attMap.when,
                  description : attMap.description,
                  include : attMap.include,
                  exclude : attMap.exclude,
                  code : codeBody
                }
      var button = document.wrappedJSObject.createElement('button');
      var buttonText = document.wrappedJSObject.createTextNode('Install Script as Trigger');
      button.appendChild(buttonText);
      button.map = map;
      button.id = "chickenfootInstallScriptButton" + t;
      button.onclick = function(event) {makeTrigger(document.wrappedJSObject.getElementById(this.id).map);};
      preElements[t].appendChild(button);
    }
  }
  current = treewalker.nextNode();
}

function filterElements(elements, tag) {
  var results = [];  var m=0;
  for (var k=0; k<elements.length; k++) {
    if (elements[k].tagName == tag) {results[m] = elements[k]; m++;}
  }
  return results;
}

function makeTrigger(foundMap) {
  //default trigger properties
  var name = "no name";
  var when = "Pages Match";
  var description = "no description";
  var includes = new Chickenfoot.SlickSet();
  var excludes = new Chickenfoot.SlickSet();
  
  if (foundMap.name) {name = foundMap.name[0];}
  if (foundMap.when) {when = foundMap.when[0];}
  if (foundMap.description) {description = foundMap.description[0];}
  if (foundMap.include) {includes.addAll(foundMap.include);}
  if (foundMap.exclude) {excludes.addAll(foundMap.exclude);}

  var map = { name : name,
              when : when,
              description : description,
              includes : includes,
              excludes : excludes
            };
  var newCode = Chickenfoot.updateAttributes(foundMap.code, map);

  var trigger = new Chickenfoot.Trigger(
    name,
    newCode,
    description,
    true, //enabled boolean
    foundMap.include, // includes Array
    foundMap.exclude, // excludes Array
    undefined,  // path
    when);    // when to enable the trigger

  //add to triggers xml file and chickenfoot profile directory
  Chickenfoot.gTriggerManager.triggers.push(trigger);
  Chickenfoot.gTriggerManager.saveTriggers();
}
debug('');

}
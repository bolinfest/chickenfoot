/**
 * This function adds install-trigger buttons to pages on the Chickenfoot scripts wiki. The
 * buttons are added to the bottom of the divs that contain scripts. This function should only
 * be called when at the Chickenfoot scripts wiki, i.e. when pages match :
 *    http://groups.csail.mit.edu/uid/chickenfoot/scripts/index.php/*
 * NOTE: This function was written to be a built-in trigger, see where it is registered as a load
 *       listener in Chickenfoot.js
 *
 * @param document : Document //this is the HTML document node of the Chickenfoot scripts wiki page
 */
function installTriggerButtons(/*Document*/document) {
//search the DOM for divs that contain scripts
var pred = function (node) {
  var results = [];
  for (var h=0; h<node.childNodes.length; h++) {
    if (node.childNodes[h].tagName == "PRE") {results.push(node.childNodes[h]);}
  }
  return ((node.tagName == "DIV") && (node.childNodes.length > 0) && (results.length > 0));
}
var treewalker = Chickenfoot.createDeepTreeWalker(document.wrappedJSObject, NodeFilter.SHOW_ALL, pred);
var current = treewalker.nextNode();

//iterate through all the scripts divs found and put a button at the bottom of each one
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
                
      //create the button html element, then attach it to the script div
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

/**
 * This function filters a list of DOM elements for the ones that have the specified tag name
 *
 * @param elements : Array DOM elements //this is the list of DOM nodes to filter
 * @param tag : String //this is the tagname to check the nodes against
 *
 * @return an array of the filtered elements
 */
function filterElements(/*Array DOM elements*/elements,/*String*/tag) {
  var results = [];  var m=0;
  for (var k=0; k<elements.length; k++) {
    if (elements[k].tagName == tag) {results[m] = elements[k]; m++;}
  }
  return results;
}

/**
 * This function creates a new trigger given a map of its properties.
 * The new created trigger is NOT RETURNED at the end of the function, this function returns nothing.
 *
 * @param foundMap : Object //this is the object whose properties store the new trigger's information
 */
function makeTrigger(/*Object*/foundMap) {
  //default trigger properties
  var name = "no name";
  var when = "Pages Match";
  var description = "no description";
  var includes = new Chickenfoot.SlickSet();
  var excludes = new Chickenfoot.SlickSet();
  
  //if given values for trigger properties, use these instead of default trigger properties
  if (foundMap.name) {name = foundMap.name[0];}
  if (foundMap.when) {when = foundMap.when[0];}
  if (foundMap.description) {description = foundMap.description[0];}
  if (foundMap.include) {includes.addAll(foundMap.include);}
  if (foundMap.exclude) {excludes.addAll(foundMap.exclude);}

  //put the trigger's information into the actual script file as metadata
  var map = { name : name,
              when : when,
              description : description,
              includes : includes,
              excludes : excludes
            };
  var newCode = Chickenfoot.updateAttributes(foundMap.code, map);

  //create the new trigger object
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
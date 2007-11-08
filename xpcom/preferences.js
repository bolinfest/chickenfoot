
var chickenfootPreferenceBranch;

/**
 * @return nsIPrefBranch2 object corresponding to "chickenfoot" branch in 
 * Firefox preferences
 */
function getPrefBranch() {
  if (!chickenfootPreferenceBranch) {
    chickenfootPreferenceBranch = 
           Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("chickenfoot.")
                .QueryInterface(Components.interfaces.nsIPrefBranch2);
  }
  return chickenfootPreferenceBranch;
}

/**
 * Test whether there are any preferences set in a branch.
 * Useful to see if the user has ever opened Chickenfoot sidebar.
 */
function hasPreferences(/*nsIPrefBranch*/ branch) {
  // getChildList() takes *output* parameters, which in the Javascript
  // are represented by an Object on which a value property is stored.
  var count = {};
  var children = {};
  branch.getChildList("", count, children);
  return count.value > 0;  
}

/**
 * Listen for changes to a preference.
 * @param branch nsIPrefBranch2 object
 * @param name name of preference to listen to
 * @param handler function called whenever preference changes
 *
 * e.g. addPreferenceListener(getPrefBranch(), "ignoreAllTriggers", function() {...} );
 */
function addPreferenceListener(/*nsIPrefBranch2*/ branch, /*String*/ name, /*function*/ handler) {
  observer = {observe: function(subject,topic,prefName) {
    handler();
  }};
  handler._observer = observer;
  branch.addObserver(name, observer, false);
}

/**
 * Stop listening for changes to a preference.
 * @param branch nsIPrefBranch object
 * @param name name of preference to listen to
 * @param handler function called whenever preference changes
 */
function removePreferenceListener(/*nsIPrefBranch2*/ branch, /*String*/ name, /*function*/ handler) {
  branch.removeObserver(name, handler._observer);
}

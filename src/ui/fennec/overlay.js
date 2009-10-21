function getDocument() {
    return getLoadedHtmlDocument(window, getBrowser().contentWindow);
}

var ChickenfootTriggers = [];

var Chickenfoot = Components.classes["@uid.csail.mit.edu/Chickenfoot/;1"]
                  .getService(Components.interfaces.nsISupports)
                  .wrappedJSObject;

var ChickenfootUI = function() {
    var triggersControlWrapper = null;
                      
    function getTriggersControlWrapper(){
        if (triggersControlWrapper == null) {
            triggersControlWrapper = setupTriggersUI();
        }
        return triggersControlWrapper;
    }

    function chickenfootToggle() {
        var triggersControl = getTriggersControlWrapper();
        triggersControl.refreshTriggersListBox();
        triggersControl.showTriggersControl();
    }
    
    function triggerOptionsToggle() {
        document.getElementById('triggers-control').hidden = true;
        getTriggersControlWrapper().showTriggersOptions();
    }

    function onLoad() {
        Chickenfoot.debug('chickenfoot ui onLoad');
      
        Chickenfoot.chickenfootCommandLineHandler = null;
        Chickenfoot.setupWindow(window);
        Chickenfoot.debug("chickenfoot setupWindow done");
      
        // hack to get interpreter working
        Chickenfoot.enableStopButton = function() {Chickenfoot.debug('fake enablestop')};    
        
        Chickenfoot.debug("chickenfoot setup done");
    }
  
    function temp() {
        alert("foobar");
    }
    
    return {
        'chickenfootToggle': chickenfootToggle,
        'triggerOptionsToggle': triggerOptionsToggle,
        'onLoad': onLoad,
        'temp': temp
    };
}();

window.addEventListener("load", function(e) { ChickenfootUI.onLoad(e); }, false);
Chickenfoot.debug('overlay loaded.');

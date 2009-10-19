log('overlay loading.');

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
        log('chickenfoot ui onLoad');
      
        Chickenfoot.chickenfootCommandLineHandler = null;
        Chickenfoot.setupWindow(window);
        log("chickenfoot setupWindow done");
      
        // hack to get interpreter working
        Chickenfoot.enableStopButton = function() {log('fake enablestop')};    
        
        log2("chickenfoot setup done");
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
log('overlay loaded.');

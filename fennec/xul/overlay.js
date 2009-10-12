log('overlay loading.');

function getDocument() {
    return getLoadedHtmlDocument(window, getBrowser().contentWindow);
}

var ChickenfootTriggers = [];

var ChickenfootUI = function() {
    var triggersControlWrapper = null;
    
    function getTriggersControlWrapper(){
        if (triggersControlWrapper == null) {
            triggersControlWrapper = setupTriggersUI();
        }
        return triggersControlWrapper;
    }

    function chickenfootToggle() {
        getTriggersControlWrapper().refreshTriggersListBox();
        getTriggersControlWrapper().showTriggersControl();
    }
    
    function triggerOptionsToggle() {
        document.getElementById('triggers-control').hidden = true;
        getTriggersControlWrapper().showTriggersOptions();
    }

    function onLoad() {
        log('chickenfoot ui onLoad');
      
        // TODO: call service using Components class getService?
        // setupService doesn't work either, need to figure out whats wrong with Components class
        // Chickenfoot.setupService();
        Chickenfoot.gTriggerManager = new TriggerManager();
        Chickenfoot.chickenfootCommandLineHandler = null;
        log("manager initialized");
      
        Chickenfoot.setupWindow(window);
      
        // hack to get interpreter working
        enableStopButton = function() {log('fake enablestop')};    
        TC = function() {};
        XPath = function() {};
  
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

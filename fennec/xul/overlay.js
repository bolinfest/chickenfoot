
function getDocument() {
    return getLoadedHtmlDocument(window, getBrowser().contentWindow);
}

// TODO: move sample scripts away and find them a better home

function doIconSearch() {
    var inputs = getDocument().getElementsByTagName("input");
	var text = inputs[1].value;
	getBrowser().contentWindow.location = "http://images.google.com/advanced_image_search?hl=en";
	doAdvancedSearch(text);
}

function doAdvancedSearch(text) {
    var document = getDocument();
    document.getElementsByTagName("input")[0].value = text; // enter('all of the words', text)
    document.getElementsByTagName("option")[1].selected = true; // pick('small')
    document.getElementsByTagName("option")[7].selected = true; // pick('GIF')
    document.getElementsByTagName("input")[2].click(); // click('search button')    
}

var sample_one = function() {
	var button = getDocument().createElement("input");
	button.type = "button";
	button.value = "Icon Search";
	button.addEventListener("click", doIconSearch, false);
	var inputs = getDocument().getElementsByTagName("input");
	var parent = inputs[1].parentNode;
	var search = inputs[2];
	parent.insertBefore(button, search);
}

function doKindaLuckySearch() {
    var inputs = getDocument().getElementsByTagName("input");
	var search = inputs[1];
	search.value = "mit uid";
	inputs[2].click();
	var links = getDocument().getElementsByClassName('l');
	var urls = [];
	
	var min = links.length;
	min = (min < 5) ? min : 5;
	for (var i=0; i<min; i++) {
	    urls.push(links[i].href);
	}
	for (var i=0; i<min; i++) {
	    if (!confirm("continue to visit next link (" + (i+1) + " of first " + min + ") ? ")) break;
	    getBrowser().contentWindow.location = urls[i];
	    getBrowser();
	    sleepImpl(window, 5000);
	}
}

var sample_two = function() {
    var button = getDocument().createElement("input");
	button.type = "button";
	button.value = "I'm Feeling ~Kinda~ Lucky";
	button.addEventListener("click", doKindaLuckySearch, false);
	
	var inputs = getDocument().getElementsByTagName("input");
	var parent = inputs[2].parentNode;
	var search = inputs[3];
	
	parent.insertBefore(button, search);
}

var ChickenfootTriggers = [];

var ChickenfootUI = {

    onClick : function() {
        // populate triggers list
        var triggersListBox = document.getElementById('triggers-control-items');
        while (triggersListBox.firstChild) {
            triggersListBox.removeChild(triggersListBox.firstChild);
        }
        
        log("# triggers: " + Chickenfoot.gTriggerManager.triggers.length);
        for (var i=0; i<Chickenfoot.gTriggerManager.triggers.length; i++) {
            let mytrigger = Chickenfoot.gTriggerManager.triggers[i];
            
            var listItem = document.createElement("richlistitem");
            listItem.setAttribute("class", "trigger-item");
            listItem.setAttribute("value", mytrigger.name);
            
            var labelButton = document.createElement("hbox");
            labelButton.setAttribute("flex", "1");
            
            var labels = document.createElement("vbox");
            labels.setAttribute("flex", "2");
            
            var label = document.createElement("label");
            label.setAttribute("class", "trigger-text");
            label.setAttribute("value", mytrigger.name);
            label.setAttribute("flex", "1");
            labels.appendChild(label);
            
            var descLabel = document.createElement("label");
            descLabel.setAttribute("class", "trigger-text-second");
            descLabel.setAttribute("value", mytrigger.description);
            descLabel.setAttribute("flex", "1");
            labels.appendChild(descLabel);
            labelButton.appendChild(labels);
            
            var spring = document.createElement("spring");
            spring.setAttribute("flex", "1");
            labelButton.appendChild(spring);
            
            let buttonEnabled = document.createElement("button");
            buttonEnabled.setAttribute("autocheck", false);
            buttonEnabled.setAttribute("checked", mytrigger.enabled);
            buttonEnabled.addEventListener("click", function()
                {
                    mytrigger.enabled=!mytrigger.enabled;
                    buttonEnabled.setAttribute("checked", mytrigger.enabled);
                    Chickenfoot.gTriggerManager.saveTriggers();
                }, 
                true);
            labelButton.appendChild(buttonEnabled);
            
            listItem.appendChild(labelButton);
            
            triggersListBox.appendChild(listItem);
        }
        
        // TODO: set sizes dynamically
        document.getElementById('triggers-control').hidden = false;
    },

  onLoad : function() {
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
      // Link = function() {};
      // Button = function() {};
      TC = function() {};
      XPath = function() {};
  
      log2("chickenfoot setup done");
      
    
      
      /*
      
      
      
      // initialize sample triggers
      var trigger;
      trigger = new Trigger("Google Icon Search", sample_one, "first sample script", true, ["http://images.google.com/","http://images.google.com/imghp?hl=en"], [""]);
      ChickenfootTriggers.push(trigger);
      trigger = new Trigger("I'm Feeling Kinda Lucky", sample_two, "second sample script", true, ["http://www.google.com/","http://www.google.com/webhp?hl=en*"], [""]);
      ChickenfootTriggers.push(trigger);
  
      window.getBrowser().addEventListener("load", triggerListener, true);
		
      function triggerListener(event) {
          ChickenfootUI.runTriggers();
      }
      
      */
  },

  runTriggers : function(aEvent) {
  //alert(getBrowser().contentWindow);
  //alert(window.getBrowser);
  //alert(getLoadedHtmlDocument);
  //alert(window.getBrowser().webProgress);
  
        /* find matching triggers */
        var url = Browser.currentBrowser.currentURI.spec.toString();
        var matchedTriggers = [];
        for (var i=0; i<ChickenfootTriggers.length; i++) {
            var trigger = ChickenfootTriggers[i]; 
            
            if (trigger.enabled) {     
              for (var j = 0; j < trigger.includesRegExps.length; j++) {
                if (url.match(trigger.includesRegExps[j])) {
                  var matched = true;
                  for (var k = 0; k < trigger.excludesRegExps.length; k++) {
                    if (url.match(trigger.excludesRegExps[k])) {
                      // this trigger should be excluded
                      matched = false;
                    }
                  }
                  if (matched) matchedTriggers.push(trigger.source);
                  // this trigger is decidedly included
                }
              }
            }
    	}
    	
    	/* run triggers */
    	for (var i=0; i<matchedTriggers.length; i++) {
    	    matchedTriggers[i]();
    	}
	}
};

window.addEventListener("load", function(e) { ChickenfootUI.onLoad(e); }, false);
log('overlay loaded.');

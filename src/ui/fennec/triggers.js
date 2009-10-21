

// set up the UI of triggers control and return a wrapper
function setupTriggersUI() {
    
    var triggersControl = document.getElementById('triggers-control');
    var triggersListBox = document.getElementById('triggers-control-items');
    var triggersOptions = document.getElementById('triggers-options');
    
    function _setupTriggersOptions() {
        var triggersOptionsSignin = document.getElementById('triggers-options-signin');
        var triggersOptionsAutosync = document.getElementById('triggers-options-autosync');
        var triggersOptionsManualsync = document.getElementById('triggers-options-manualsync');
        var triggersOptionsSigninButton = document.getElementById('triggers-options-signin-button');
        var triggersOptionsAutosyncButton = document.getElementById('triggers-options-autosync-button');
        var triggersOptionsManualsyncButton = document.getElementById('triggers-options-manualsync-button');
        
        function _refreshOptions(isSignedIn) {
            triggersOptionsAutosync.setAttribute('disabled', !isSignedIn);
            triggersOptionsManualsync.setAttribute('disabled', !isSignedIn);
            triggersOptionsAutosyncButton.setAttribute('disabled', !isSignedIn);
            triggersOptionsManualsyncButton.setAttribute('disabled', !isSignedIn);
        }
        
        triggersOptionsSigninButton.addEventListener("click", function() {
            if (Chickenfoot.gTriggerManager.syncEnabled) {
                Chickenfoot.gTriggerManager.syncEnabled = false;
                Chickenfoot.gTriggerManager.googleAuthKey = '';
            } else {
                _setupSync();
            }
            triggersOptionsSigninButton.setAttribute("checked", Chickenfoot.gTriggerManager.syncEnabled);
            _refreshOptions(Chickenfoot.gTriggerManager.syncEnabled);
          }, true);
        
        triggersOptionsManualsyncButton.addEventListener("click", function() {
            if (Chickenfoot.gTriggerManager.syncEnabled) {
                Chickenfoot.debug('starting download...');
                Chickenfoot.gTriggerManager.downloadAllTriggers();
                refreshTriggersListBox();
                Chickenfoot.debug('done downloading...');
            }
          }, true);
        
        triggersOptionsSigninButton.setAttribute("checked", Chickenfoot.gTriggerManager.syncEnabled);
        _refreshOptions(Chickenfoot.gTriggerManager.syncEnabled);
    }
    
    /**
     * copied from triggers.js setupSync()
     * TODO: use the code from triggers.js
     * Configure sync. 
     * Initialize TriggerManager to have sync enbaled.
     * Make sure TriggerManager has either syncEnabled=false or has successfully logged into Google 
     */
    function _setupSync() {
      var dialogArguments = {};
      Chickenfoot.gTriggerManager.setSyncEnabled(true);
      // TODO: make accessor method in TriggerManager for whether we are logged in
      while ((Chickenfoot.gTriggerManager.googleAuthKey == "") && (Chickenfoot.gTriggerManager.syncEnabled == true)) {
        try {
          window.openDialog("chrome://chickenfoot/content/googleLoginDialog.xul",
            "showmore",
            "chrome,modal,centerscreen,dialog,resizable",
            dialogArguments
            );
          Chickenfoot.gTriggerManager.setGoogleSync(!dialogArguments.disable, dialogArguments.email, dialogArguments.password);
        } catch(e) {
          alert(e.message);
        } 
      }
      return;
    }

    // refreshes contents of triggersListBox
    function refreshTriggersListBox() {
        // clear list box
        while (triggersListBox.firstChild) {
            triggersListBox.removeChild(triggersListBox.firstChild);
        }
        // add triggers to listbox
        Chickenfoot.debug("# triggers: " + Chickenfoot.gTriggerManager.triggers.length);
        for (var i=0; i<Chickenfoot.gTriggerManager.triggers.length; i++) {
            let mytrigger = Chickenfoot.gTriggerManager.triggers[i];
            
            var listItem = document.createElement("richlistitem");
            listItem.setAttribute("class", "control-item");
            listItem.setAttribute("value", mytrigger.name);
            
            var labelButton = document.createElement("hbox");
            labelButton.setAttribute("flex", "1");
            
            var labels = document.createElement("vbox");
            labels.setAttribute("flex", "2");
            
            var label = document.createElement("label");
            label.setAttribute("class", "control-text");
            label.setAttribute("value", mytrigger.name);
            label.setAttribute("flex", "1");
            labels.appendChild(label);
            
            var descLabel = document.createElement("label");
            descLabel.setAttribute("class", "control-text-second");
            descLabel.setAttribute("value", mytrigger.description);
            descLabel.setAttribute("flex", "1");
            labels.appendChild(descLabel);
            labelButton.appendChild(labels);
            
            var spring = document.createElement("spring");
            spring.setAttribute("flex", "1");
            labelButton.appendChild(spring);
            
            let buttonEnabled = document.createElement("button");
            buttonEnabled.setAttribute("class", "toggle");
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
    }
    
    // show triggers control
    function showTriggersControl() {
        // set dimension and show
        triggersControl.width = window.innerWidth;
        triggersControl.height = window.innerHeight;
        triggersControl.hidden = false;
    }
    
    // show triggers options
    function showTriggersOptions() {
        triggersOptions.width = window.innerWidth;
        triggersOptions.height = window.innerHeight;
        triggersOptions.hidden = false;
    }
    
    function loginGoogleDocs() {
    }
    
    function setAutoSync(autoSync) {
    }
    
    function downloadSyncTriggers() {
    }
    
    _setupTriggersOptions();
    
    return {
        'refreshTriggersListBox': refreshTriggersListBox,
        'showTriggersControl': showTriggersControl,
        'showTriggersOptions': showTriggersOptions,
        'downloadSyncTriggers': downloadSyncTriggers,
        'loginGoogleDocs': loginGoogleDocs,
        'setAutoSync': setAutoSync
    };
}
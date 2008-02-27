/*
*  This implements the PasswordManagerInterface for the login-manager provided
*  by Firefox 3
*/

/*
* PasswordManagerInterface
* void addEntry(hostname, username, password, formSubmitURL, usernameField, passwordField)
** This method adds an entry into the passwordManager/loginManager.
*** @param hostname - String: the host website for which this password is being used
*** @param username - String: the username for this password manager entry
*** @param password - String: the password. This is the only field that is stored securely in the password/login manager
*** @param (semi-optional) formSubmitURL - String: Required for Firefox 3 and not required for previous versions.
***                                                Represents the url of the target location of the HTML login form for this entry
*** @param (optional) usernameField - String: Not required for FF2, optional for FF3. Represnts the username field name of the HTML login form 
*** @param (optional) usernameField - String: Not required for FF2, optional for FF3. Represnts the password field name of the HTML login form 
*
* void removeEntry(hostname, username)
** This method removes a password entry from the passwordManager/loginManager.
*** @param hostname - String: the host website for which this password is being used. This will be converted to a regular expression and matched against stored hostnames
*** @param username - String: the username for this password manager entry
*
* Entry retrieveEntry(hostname, username)
** This method retrieves an entry from the passwordManager/loginManager.
*** @param hostname - String: the host website for which this password is being used. This will be converted to a regular expression and matched against stored hostnames
*** @param (optional) username - String: the username for this password manager entry. If not supplied returns the first
*** @return : passwordEntry (object) - {String username, String Password}
*/

function LoginManager() {
}

LoginManager.addEntry = function(hostname, username, password, formSubmitURL, usernameField, passwordField) {
    var loginManager = Components.classes["@mozilla.org/login-manager;1"]
                           .getService(Components.interfaces.nsILoginManager);
    var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                                               Components.interfaces.nsILoginInfo,
                                               "init");	  
    var entry = new nsLoginInfo(hostname, formSubmitURL, null, username, password, usernameField, passwordField);
    loginManager.addLogin(entry);
}


LoginManager.removeEntry = function(hostname, username, formSubmitURL) {
  var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
     // Get Login Manager 
     var loginManager = Components.classes["@mozilla.org/login-manager;1"]
                           .getService(Components.interfaces.nsILoginManager);
   
     // Find users for this extension 
     var entries = loginManager.getAllLogins({});
        
     for (var i = 0; i < entries.length; i++) {
        if (entries[i].hostname.match(host)) {
           if(entries[i].username == username) {
             loginManager.removeLogin(entries[i]);
           }
        }
     }
     Chickenfoot.debug("Entry not found while removing entry from login manager: hostname=" + hostname + ", username=" + username);
}

LoginManager.retrieveEntry = function(hostname, username) {
     var retrievedEntry = {};
     
     // convert strings into regexes
     var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
     // Get Login Manager 
     var loginManager = Components.classes["@mozilla.org/login-manager;1"]
                           .getService(Components.interfaces.nsILoginManager);
   
     // Find users for this extension 
     var entries = loginManager.getAllLogins({});
        
     for (var i = 0; i < entries.length; i++) {
        if (entries[i].hostname.match(host)) {
          if(username) {
            //if username specified check against it
            if(entries[i].username == username) {
              retrievedEntry.username = entry.username;
              retrievedEntry.password = entry.password;
              return retrievedEntry;
            }
          }
          else {
            //if no username specified, just return first one in list for the hostname
            retrievedEntry.username = entry.username;
            retrievedEntry.password = entry.password;
            return retrievedEntry;
          }
        }
     }
     return null;
}


/* Test cases
var p = new LoginManager();
p.addEntry('http://www.facebook.com/', 'prannay@mit.edu', 'abc');
p.addEntry('http://www.facebook.com/', 'jaja_binx@mit.edu', 'blurb', null, 'email', 'pass');
output(p.retrieveEntry('www.facebook.com', 'prannay@mit.edu'));
output(p.retrieveEntry('www.facebook.com'));
*/
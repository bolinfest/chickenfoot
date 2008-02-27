/*
*  This implements the PasswordManagerInterface for the login-manager provided
*  by Firefox 3
*/


/*
* PasswordManagerInterface
* boolean addEntry(hostname, username, password, formSubmitURL, usernameField, passwordField)
** This method adds an entry into the passwordManager/loginManager.
*** @param hostname - String: the host website for which this password is being used
*** @param username - String: the username for this password manager entry
*** @param password - String: the password. This is the only field that is stored securely in the password/login manager
*** @param (semi-optional) formSubmitURL - String: Required for Firefox 3 and not required for previous versions.
***                                                Represents the url of the target location of the HTML login form for this entry
*** @param (optional) usernameField - String: Not required for FF2, optional for FF3. Represnts the username field name of the HTML login form 
*** @param (optional) usernameField - String: Not required for FF2, optional for FF3. Represnts the password field name of the HTML login form 
*** @return : true - if add successful
***           false - if unsuccessful
*
* boolean removeEntry(hostname, username)
** This method removes a password entry from the passwordManager/loginManager.
*** @param hostname - String: the host website for which this password is being used. This will be converted to a regular expression and matched against stored hostnames
*** @param username - String: the username for this password manager entry
*** @return : true - if remove successful
***           false - if unsuccessful
*
* boolean retrieveEntry(retrievedEntry, hostname, formSubmitURL, username)
** This method retrieves an entry from the passwordManager/loginManager.
*** @param retrievedEntry - out String[2]: The retrieved entry which consistes of an array {username, password}
*** @param hostname - String: the host website for which this password is being used. This will be converted to a regular expression and matched against stored hostnames
*** @param (semi-optional) formSubmitURL - String: Required for Firefox 3 and not required for previous versions. Represents the url of the target location of the HTML login form for this entry
*** @param (optional) username - String: the username for this password manager entry. If not supplied returns the first
*** @return : true - if the entry was successfully, retrievedEntry contains the entry retrieved
***           false - if failed to retrieve the entry. retrievedEntry is as was supplied to method
*/

function LoginManager() {
}

LoginManager.prototype.addEntry = function(hostname, username, password, formSubmitURL, usernameField, passwordField) {
  try {
    var loginManager = Components.classes["@mozilla.org/login-manager;1"]
                           .getService(Components.interfaces.nsILoginManager);
    var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                                               Components.interfaces.nsILoginInfo,
                                               "init");	  
    var entry = new nsLoginInfo(hostname, formSubmitURL, null, username, password, usernameField, passwordField);
    loginManager.addLogin(entry);
  } catch(ex) {
    //failed
  }
  return true;
}


LoginManager.prototype.removeEntry = function(hostname, username, formSubmitURL) {
  var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
  try {
     // Get Login Manager 
     var loginManager = Components.classes["@mozilla.org/login-manager;1"]
                           .getService(Components.interfaces.nsILoginManager);
   
     // Find users for this extension 
     var entries = loginManager.getAllLogins({});
        
     for (var i = 0; i < entries.length; i++) {
        if (entries[i].hostname.match(host)) {
           if(entries[i].username == username) {
             loginManager.removeLogin(entries[i]);
             return true;
           }
        }
     }
  }
  catch(ex) {
     // This will only happen if there is no nsILoginManager component class
     Chickenfoot.debug("Exception while removing entry from login manager: hostname=" + hostname + ", username=" + username);
     return false;
  }
  Chickenfoot.debug("Entry not found while removing entry from login manager: hostname=" + hostname + ", username=" + username);    
  return false; //entry not found
}

LoginManager.prototype.retrieveEntry = function(retrievedEntry, hostname, formSubmitURL, username) {
  var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
  try {
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
              retrievedEntry[0] = entry.username;
              retrievedEntry[1] = entry.password;
              return true;
            }
          }
          else {
            //if no username specified, just return first one in list for the hostname
            retrievedEntry[0] = entry.username;
            retrievedEntry[1] = entry.password;
            return true;
          }
        }
     }
  }
  catch(ex) {
     // This will only happen if there is no nsILoginManager component class
     Chickenfoot.debug("Exception while retrieving entry from login manager: hostname=" + hostname + ", username=" + username);
     Chickenfoot.debug("There is no nsILoginManager class");
     return false;
  }
  Chickenfoot.debug("Entry not found while retrieving entry from login manager: hostname=" + hostname + ", username=" + username);    
  return false; //entry not found
}


/* Test cases
var p = new LoginManager();
p.addEntry('http://www.facebook.com/', 'prannay@mit.edu', 'abc');
p.addEntry('http://www.facebook.com/', 'jaja_binx@mit.edu', 'blurb', null, 'email', 'pass');
var info = new Array(2);
output(p.retrieveEntry(info, 'www.facebook.com', null, 'prannay@mit.edu'));
output(info);
output(p.retrieveEntry(info, 'www.facebook.com'));
output(info);
*/
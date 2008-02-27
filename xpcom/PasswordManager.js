/*
*  This implements the PasswordManagerInterface for the password manager
*  implemented in Firefox 2.X.X and below.
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

function PasswordManager() {
}

PasswordManager.addEntry = function(hostname, username, password, formSubmitURL, usernameField, passwordField) {
    var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                  .getService(Components.interfaces.nsIPasswordManagerInternal);
    passwordManager.addUserFull(hostname, username, password, usernameField, passwordField);
}


PasswordManager.removeEntry = function(hostname, username) {
  // convert strings into regexes
  var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
  var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                .getService(Components.interfaces.nsIPasswordManager);
  var e = passwordManager.enumerator;
  // step through each password in the password manager until we find the one we want:
  while (e.hasMoreElements()) {
      // Use the nsIPassword interface for the password manager entry.
      // This contains the actual password...
      var entry = e.getNext().QueryInterface(Components.interfaces.nsIPassword);
      if (entry.host.match(host)) {
        if(username == entry.user) {
          passwordManager.removerUser(entry.host, entry.user)
          return;
        }
      }
  }
  Chickenfoot.debug("Entry not found while removing entry from password manager: hostname=" + hostname + ", username=" + username);
}

PasswordManager.retrieveEntry = function(hostname, username) {
  var retrievedEntry = {};
  
  // convert strings into regexes
  var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
  var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                .getService(Components.interfaces.nsIPasswordManager);
  var e = passwordManager.enumerator;
  // step through each password in the password manager until we find the one we want:
  while (e.hasMoreElements()) {
      // Use the nsIPassword interface for the password manager entry.
      // This contains the actual password...
      var entry = e.getNext().QueryInterface(Components.interfaces.nsIPassword);
      if (entry.host.match(host)) {
        if(username) {
          // if a username was specified
          if(username == entry.user) {
            retrievedEntry.username = entry.user;
            retrievedEntry.password = entry.password;
            return retrievedEntry;
          }
        } else {
          //if no username was specified just return the first one found for the host
          retrievedEntry.username = entry.user;
          retrievedEntry.password = entry.password;
          return retrievedEntry;
        }
      }
  }
  return null; // not found
}

/* Test cases
var p = new PasswordManager();
p.addEntry('http://www.facebook.com/', 'prannay@mit.edu', 'abc');
p.addEntry('http://www.facebook.com/', 'jaja_binx@mit.edu', 'blurb', null, 'email', 'pass');
output(p.retrieveEntry('www.facebook.com', 'prannay@mit.edu'));
output(p.retrieveEntry('www.facebook.com'));
*/
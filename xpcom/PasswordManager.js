/*
*  This implements the PasswordManagerInterface for the password manager
*  implemented in Firefox 2.X.X and below.
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

function PasswordManager() {
}

PasswordManager.prototype.addEntry = function(hostname, username, password, formSubmitURL, usernameField, passwordField) {
  try {
    var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                  .getService(Components.interfaces.nsIPasswordManagerInternal);
    passwordManager.addUserFull(hostname, username, password, usernameField, passwordField);
  } catch(ex) {
    //adding failed
    Chickenfoot.debug("Adding entry to password manager failed for hostname=" + hostname + ", username=" + username);
    return false;
  }
  return true; //adding successful
}


PasswordManager.prototype.removeEntry = function(hostname, username) {
  // convert strings into regexes
  var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
  var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                .getService(Components.interfaces.nsIPasswordManager);
  var e = passwordManager.enumerator;
  // step through each password in the password manager until we find the one we want:
  while (e.hasMoreElements()) {
    try {
      // Use the nsIPassword interface for the password manager entry.
      // This contains the actual password...
      var entry = e.getNext().QueryInterface(Components.interfaces.nsIPassword);
      if (entry.host.match(host)) {
        if(username == entry.user) {
          passwordManager.removerUser(entry.host, entry.user)
          return true;
        }
      }
    } catch (ex) {
      // This will only happen if there is no nsIPasswordManager component class
       Chickenfoot.debug("Exception while removing entry from password manager: hostname=" + hostname + ", username=" + username);
       Chickenfoot.debug("There is no nsIPasswordManager class");
       return false;
    }
  }
  Chickenfoot.debug("Entry not found while removing entry from password manager: hostname=" + hostname + ", username=" + username);    
  return false; //entry not found
}

PasswordManager.prototype.retrieveEntry = function(retrievedEntry, hostname, formSubmitURL, username) {
  // convert strings into regexes
  var host = new RegExp(hostname.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1"));  
  var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                .getService(Components.interfaces.nsIPasswordManager);
  var e = passwordManager.enumerator;
  // step through each password in the password manager until we find the one we want:
  while (e.hasMoreElements()) {
    try {
      // Use the nsIPassword interface for the password manager entry.
      // This contains the actual password...
      var entry = e.getNext().QueryInterface(Components.interfaces.nsIPassword);
      if (entry.host.match(host)) {
        if(username != null) {
          // if a username was specified
          if(username == entry.user) {
            retrievedEntry[0] = entry.user;
            retrievedEntry[1] = entry.password;
            return true;
          }
        } else {
          //if no username was specified just return the first one found for the host
          retrievedEntry[0] = entry.user;
          retrievedEntry[1] = entry.password;
          return true;
        }
      }
    } catch (ex) {
      return false;
    }
  }
  return false; // not found
}

/* Test cases
var p = new PasswordManager();
p.addEntry('http://www.facebook.com/', 'prannay@mit.edu', 'abc');
p.addEntry('http://www.facebook.com/', 'jaja_binx@mit.edu', 'blurb', null, 'email', 'pass');
var info = new Array(2);
output(p.retrieveEntry(info, 'www.facebook.com', null, 'prannay@mit.edu'));
output(info);
output(p.retrieveEntry(info, 'www.facebook.com'));
output(info);
*/
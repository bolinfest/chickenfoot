/*
* Checks whether nsIPasswordManager is available and uses it
* otherwise its Firefox 3, so use nsILoginManager
*/

function addPasswordImpl(hostname, username, password, formSubmitURL, usernameField, passwordField) {
  if ("@mozilla.org/passwordmanager;1" in Components.classes) {
    PasswordManager.addEntry(hostname, username, password, formSubmitURL, usernameField, passwordField);
  }
  else if ("@mozilla.org/login-manager;1" in Components.classes) {
    LoginManager.addEntry(hostname, username, password, formSubmitURL, usernameField, passwordField);
  }
}

function removePasswordImpl(hostname, username) {
  if ("@mozilla.org/passwordmanager;1" in Components.classes) {
    PasswordManager.removeEntry(hostname, username);
  }
  else if ("@mozilla.org/login-manager;1" in Components.classes) {
    LoginManager.removeEntry(hostname, username);
  }
}

function retrievePasswordImpl(retrievedEntry, hostname, formSubmitURL, username) {
  if ("@mozilla.org/passwordmanager;1" in Components.classes) {
    PasswordManager.retrieveEntry(retrievedEntry, hostname, formSubmitURL, username);
  }
  else if ("@mozilla.org/login-manager;1" in Components.classes) {
    LoginManager.retrieveEntry(retrievedEntry, hostname, formSubmitURL, username);
  }
}
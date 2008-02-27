/*
* Checks whether nsIPasswordManager is available and uses it
* otherwise its Firefox 3, so use nsILoginManager
*/

function addPasswordImpl(hostname, username, password, formSubmitURL, usernameField, passwordField) {
  if ("@mozilla.org/passwordmanager;1" in Components.classes) {
    return PasswordManager.addEntry(hostname, username, password, formSubmitURL, usernameField, passwordField);
  }
  else if ("@mozilla.org/login-manager;1" in Components.classes) {
    return LoginManager.addEntry(hostname, username, password, formSubmitURL, usernameField, passwordField);
  }
}

function removePasswordImpl(hostname, username) {
  if ("@mozilla.org/passwordmanager;1" in Components.classes) {
    return PasswordManager.removeEntry(hostname, username);
  }
  else if ("@mozilla.org/login-manager;1" in Components.classes) {
    return LoginManager.removeEntry(hostname, username);
  }
}

function getPasswordImpl(hostname, username) {
  if ("@mozilla.org/passwordmanager;1" in Components.classes) {
    return PasswordManager.retrieveEntry(hostname, username);
  }
  else if ("@mozilla.org/login-manager;1" in Components.classes) {
    return LoginManager.retrieveEntry(hostname, username);
  }
}
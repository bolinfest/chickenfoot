function SimpleIO() {}

/**
 * @param fileNameOrURL the file or URL to be read (either nsIFile or String)
 * @return string - the contents of the file
 * @throws exception if file not found or other I/O error
 */
SimpleIO.read = function(/*nsIFile or String*/ fileNameOrURL) {
  if (isRemoteURL(fileNameOrURL)) {
    return loadRemoteURL(fileNameOrURL);
  } else if (isLocalURL(fileNameOrURL)) {
    return loadLocalURL(fileNameOrURL);
  } else {
    return loadFile(fileNameOrURL);
  }

  function isRemoteURL(/*any*/ obj) {
    return (typeof obj == 'string' || instanceOf(obj, String)) &&
       obj.toString().match(/^(https?|ftp):\/\//);
  }
  function loadRemoteURL(/*string*/ url) {
    // TODO(mbolin): Creating the XMLHttpRequest fails for me
    // on Mac OS 10.6.1, Firefox 3.5.3. This causes includeTest.js to fail.
    var request = new XMLHttpRequest();

    var asynchronous = false;
    var scriptContent = null;
    request.open("GET", url, asynchronous);
    request.send(null);
    if (request.status == 200) {
      return request.responseText;
    } else {
      throw new Error('read error: ' + request.status + ' ' + request.statusText);
    }
  }

  function isLocalURL(/*any*/ obj) {
    return (typeof obj == 'string' || instanceOf(obj, String)) &&
       obj.toString().match(/^(file|chrome|data|resource):\/\//);
  }
  function loadLocalURL(/*string*/ url) {
    // http://forums.mozillazine.org/viewtopic.php?p=921150
    var ioService=Components.classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService);
    var scriptableStream=Components
      .classes["@mozilla.org/scriptableinputstream;1"]
      .getService(Components.interfaces.nsIScriptableInputStream);  
    var channel = ioService.newChannel(url, null, null);
    var input=channel.open();
    scriptableStream.init(input);
    var str=scriptableStream.read(input.available());
    scriptableStream.close();
    input.close();
    return str;
  }
  
  function loadFile(/*nsIFile or string*/ fileName) {
      // http://kb.mozillazine.org/index.phtml?title=Dev_:_Extensions_:_Example_Code_:_File_IO#Reading_from_a_file
      var file = instanceOf(fileName, Components.interfaces.nsIFile)
         ? fileName : SimpleIO.toFile(fileName);
      var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Components.interfaces.nsIFileInputStream);
      var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
        .createInstance(Components.interfaces.nsIScriptableInputStream);
    
      fstream.init(file, 1, 0, false);
      sstream.init(fstream);
      var data = "" + sstream.read(-1);
      sstream.close();
      fstream.close();
      var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"]
         .getService(Components.interfaces.nsIUTF8ConverterService);
      data = utf8Converter.convertURISpecToUTF8 (data, "UTF-8"); 
      return data;  
  }
}


/**
 * @param file the file to be opened (either nsIFile or String)
 * @param string data the content to be written to the file
 * @throws exception if file not found or other I/O error
 *
 * Write the data as UTF-8 rather than straight bytes.
 */
// http://kb.mozillazine.org/index.phtml?title=Dev_:_Extensions_:_Example_Code_:_File_IO
SimpleIO.write = function(/*nsIFile or String*/ fileName,
                          /*string*/ data, 
                          /*optional boolean*/ append) {
    
  if (append && !SimpleIO.exists(fileName)) {
      return SimpleIO.write(fileName, data, false)
  } else {    
      var file = instanceOf(fileName, Components.interfaces.nsIFile)
          ? fileName : SimpleIO.toFile(fileName);
      if (file.parent) SimpleIO.makeDir(file.parent);
            
      var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Components.interfaces.nsIFileOutputStream);
      // use  to open file for appending.
      stream.init(file, 
                  append ? (0x02 | 0x10)
                         : (0x02 | 0x08 | 0x20), // write, create, truncate
                  0664, 0); 
      var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
               .createInstance(Components.interfaces.nsIConverterOutputStream);
      os.init(stream, "UTF-8", 0, 0x0000);
      os.writeString(data);
      os.close();
      stream.close();
  }
}

/**
 * @param file the file to be opened (either nsIFile or String)
 * @param string data the content to be written to the file
 * @throws exception if file not found or other I/O error
 *
 * Write the data as straight bytes.
 */
SimpleIO.writeBytes = function(/*nsIFile or String*/ fileName,
                               /*string*/ data, 
                               /*optional boolean*/ append) {
    
  if (append && !SimpleIO.exists(fileName)) {
      return SimpleIO.write(fileName, data, false)
  } else {    
      var file = instanceOf(fileName, Components.interfaces.nsIFile)
          ? fileName : SimpleIO.toFile(fileName);
      if (file.parent) SimpleIO.makeDir(file.parent);
      
      var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Components.interfaces.nsIFileOutputStream);
      // use  to open file for appending.
      stream.init(file, 
                  append ? (0x02 | 0x10)
                         : (0x02 | 0x08 | 0x20), // write, create, truncate
                  0664, 0); 
      stream.write(data, data.length);
      stream.close();
  }
}

/**
 * @param fileName (string) filename
 * @param dir (optional nsIFile) directory where the file should be referenced;
 *                        defaults to downloadDir() if not given
 * @return nsIFile object representing fileName
 */
SimpleIO.toFile = function(/*String*/ fileName, /*optional nsIFile*/ dir) {  
  var file = Components.classes["@mozilla.org/file/local;1"].
	             createInstance(Components.interfaces.nsILocalFile);
  try {
    // absolute pathname?
    file.initWithPath(fileName);
    return file;
  } catch (e) {
    // not an absolute pathname
  }
  
  // interprete relative filenames with respect to dir 
  file = (dir) ? dir.clone() : SimpleIO.downloadDir();
  
  // handle subdirectories in the relative filename
  var parts = fileName.split(/[\\\/]/);
  for (var i = 0; i < parts.length; ++i) {
    if (parts[i]) file.append(parts[i]);
  }
  
  return file;
}

/**
 * @param fileName string filename
 * @return nsIFile object representing fileName in Chickenfoot's directory in the current profile.
 *   (Doesn't check whether the file actually exists, of course)
 */
SimpleIO.toFileInChickenfootDirectory = function(/*String*/ fileName) {
  var profileDirectory = Components.classes["@mozilla.org/file/directory_service;1"]
    .getService(Components.interfaces.nsIProperties)
    .get("ProfD", Components.interfaces.nsILocalFile);
  var myFile = profileDirectory.clone();
  myFile.append("chickenfoot");
  myFile.append(fileName);
  return myFile;
}

/**
 * On Linux, calling file.exists() may throw an exception instead
 * of just returning false, so we wrap file.exists() in a try/catch here
 */
SimpleIO.exists = function(/*nsIFile or String*/ fileName) {
  if (!fileName) return false;
  try {
    var file = instanceOf(fileName, Components.interfaces.nsIFile)
        ? fileName : SimpleIO.toFile(fileName);
    return file.exists();
  } catch(e) {
    return false;
  }
}

/**
 *Checks whether a path is a valid file system path or not
 * @param fileName string Name of file.
 */
SimpleIO.checkPathValidity = function(/*String*/ fileName) {
  if (!fileName) return false;
  var file = Components.classes["@mozilla.org/file/local;1"].
	             createInstance(Components.interfaces.nsILocalFile);
  try {
    file = file.initWithPath(fileName);
    return true;
  } catch(e) {
    return false;
  }
}


/**
 * @return nsIFile representing download directory for firefox
 */
SimpleIO.downloadDir = function () {
  var downloadPref = Components.classes["@mozilla.org/preferences-service;1"]
                     .getService(Components.interfaces.nsIPrefService)
                     .getBranch('browser.download.')
                     .QueryInterface(Components.interfaces.nsIPrefBranch2);
  if(downloadPref.getIntPref('folderList') == 0) {
    return SimpleIO.desktopDir();
  } else {
    var dir =  SimpleIO.toFile(downloadPref.getCharPref('dir'));
	return dir.clone();
  }
}


/**
 * @return nsIFile object representing desktop directory of the operating system
 */
SimpleIO.desktopDir = function () {
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                       .getService(Components.interfaces.nsIProperties)
                       .get("Desk", Components.interfaces.nsIFile);
  return file.clone();
}

/**
 * @return nsIFile object representing home directory of the operating system.
 */
SimpleIO.homeDir = function () {
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                       .getService(Components.interfaces.nsIProperties)
                       .get("Home", Components.interfaces.nsIFile);
  return file.clone();
}

/**
 * Makes a directory.  Does nothing if directory already exists.
 *
 * @param dirName (string or nsIFile) directory to be created
 */
SimpleIO.makeDir = function(/*String*/ dirName) {
  var dir = instanceOf(dirName, Components.interfaces.nsIFile)
     ? dirName : SimpleIO.toFile(dirName);
  if (!dir.exists() || !dir.isDirectory()) {
    dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0664);
  }
}

SimpleIO.getChromeContent = SimpleIO.read;

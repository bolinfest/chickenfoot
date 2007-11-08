function SimpleIO() {}

/**
 * @param file the file to be read (either nsIFile or String)
 * @return string - the contents of the file
 * @throws exception if file not found or other I/O error
 */
// http://kb.mozillazine.org/index.phtml?title=Dev_:_Extensions_:_Example_Code_:_File_IO#Reading_from_a_file
SimpleIO.read = function(/*nsIFile or String*/ fileName) {
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
  return data;  
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
 * @param fileName string filename
 * @param userDir nsIFile custom directory where the file should be referenced
 * @return nsIFile object representing fileName
 */
SimpleIO.toFile = function(/*String*/ fileName, /*nsIFile*/ userDir) {  
  var file = Components.classes["@mozilla.org/file/local;1"].
	             createInstance(Components.interfaces.nsILocalFile);
	
	//if file name is a valid path name
  //else mutate the filename to represent a valid path
  if(!SimpleIO.checkPathValidity(fileName))
  {
  	var dir = userDir ? userDir.clone() : SimpleIO.downloadDir() ;  //saves to downloads directory by default
  	  //check whether filename has subdirectories of 
  	  //the form subdir/filename.png
  	  try {
      	while(fileName.indexOf('/')!=-1){
        	  dir.append(fileName.substring(0, fileName.indexOf('/')));
        	  if( !dir.exists() || !dir.isDirectory() ) {   // if it doesn't exist, create
              dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0664);
            }
          fileName = fileName.substring(fileName.indexOf('/')+1);
        }
        dir.append(fileName);
        fileName = dir.path;
      } catch (e) {
      	//directory names may be invalid
      	throw new Error("The path is invalid: "+ fileName);
      }
  }
  
  file.initWithPath(fileName);
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
    var dir =  SimpleIO.toFile(downloadPref.getCharPref('downloadDir'));
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
 * @param dirName string directory name
 * 
 * Create a folder inside Profile directory
 */
SimpleIO.makeDir = function(/*String*/ dirName) {
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
  file.append(dirName);
  if(!file.exists() || !file.isDirectory()) {   // if the directory doesn't exist, create it
    return file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0664);
  }else{
    return "fail to create directory";
  }
}

// http://forums.mozillazine.org/viewtopic.php?p=921150
SimpleIO.getChromeContent = function(/*String*/ aURL){
  if((aURL.substring(0,7) == "http://") || (aURL.substring(0,8) == "https://")) {
    var request = new XMLHttpRequest();
    var asynchronous = false;
    var scriptContent = null;
    request.open("GET", aURL, asynchronous);
    request.send(null);
    if (request.status == 200) {
      scriptContent = request.responseText;
    }
    else {
      throw new Error('getChromeContent URL Error: ' + request.status + ' ' + request.statusText);
    }
    return scriptContent;
  }
  else{
    var ioService=Components.classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService);
    var scriptableStream=Components
      .classes["@mozilla.org/scriptableinputstream;1"]
      .getService(Components.interfaces.nsIScriptableInputStream);  
    var channel = ioService.newChannel(aURL, null, null);
    var input=channel.open();
    scriptableStream.init(input);
    var str=scriptableStream.read(input.available());
    scriptableStream.close();
    input.close();
    return str;
  }
}

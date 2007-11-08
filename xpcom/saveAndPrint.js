function printPageImpl(chromeWindow, /* String */ printerName){
	var utils = chromeWindow.PrintUtils;
	var wbp = utils.getWebBrowserPrint();
	var settings = utils.getPrintSettings();
	settings.printSilent = true
	if (arguments.length>1){
		settings.printerName=arguments[1];
 	}
	wbp.print(settings, null);
}


function savePageCompleteImpl(chromeWindow, doc, /* no agurments or String fileName or String relativePath or String fullpath or
		nsILocalFile relativePath or nsILocalFile fullpath*/ f){
//f is either a directory, a file name, a directory and filename or nothing
//determine which one

if(f instanceof Components.interfaces.nsILocalFile){
	if(Chickenfoot.SimpleIO.exists(f)){
		if(f.isDirectory()){
			savePageToDirectoryComplete(chromeWindow, doc, f);
		}else{
		if(f.isFile()){
			savePageToPathComplete(chromeWindow, doc, f);
		}else{
			//output('The valid is neither a file nor a directory, cannot save.');
		}
		}
	}else{
	//file does not exist
		savePageToPathComplete(chromeWindow,doc, f)
	}
}else{

//f is a String

if( Chickenfoot.SimpleIO.checkPathValidity(f)){
	//it is an attempt at a file or directory
	file=Chickenfoot.SimpleIO.toFile(f);
	if(Chickenfoot.SimpleIO.exists(file)){
	//file exists
		if(file.isDirectory()) {
			savePageToDirectoryComplete(chromeWindow, doc, file);
		}else{
			if(file.isFile()){
				savePageToPathComplete(chromeWindow, doc, file);
			}else{
				//output('bad syntax on file or directory')
			}
		}
	}else{
	//file does not exist user wants to save this as an exact path string
		savePageToPathComplete(chromeWindow, doc, file);
	}
}else{
	//it is not a file or directory
	if(f==null){
		savePageWithDefaultsComplete(chromeWindow, doc);
	}else{
	var filename=f;
		savePageToDefaultDirectoryWithFilenameComplete(chromeWindow, doc, filename);
	}
}
}
}

function savePageImpl(chromeWindow, doc, /* no arguments or String fileName or String relativePath or String fullpath or
		nsILocalFile relativePath or nsILocalFile fullpath*/ f){
//f is either a directory, a file name, a directory and filename or nothing
//determine which one

if(f instanceof Components.interfaces.nsILocalFile){
	if(Chickenfoot.SimpleIO.exists(f)){
		if(f.isDirectory()){
			savePageToDirectory(chromeWindow, doc, f);
		}else{
		if(f.isFile()){
			savePageToPath(chromeWindow, doc, f);
		}else{
			//output('The valid is neither a file nor a directory, cannot save.');
		}
		}
	}else{
	//file does not exist
		savePageToPath(chromeWindow, doc, f)
	}
}else{

//f is a String

if( Chickenfoot.SimpleIO.checkPathValidity(f)){
	//it is an attempt at a file or directory
	file=Chickenfoot.SimpleIO.toFile(f);

	if(Chickenfoot.SimpleIO.exists(file)){
	//file exists
		if(file.isDirectory()) {	
			savePageToDirectory(chromeWindow, doc, file);
		}else{
			if(file.isFile()){
				savePageToPath(chromeWindow, doc, file);
			}else{
				//output('bad syntax on file or directory')
			}
		}
	}else{
	//file does not exist user wants to save this as an exact path string
		savePageToPath(chromeWindow, doc, file);
	}
}else{
	//it is not a file or directory
	//output(doc);
	//output(f);
	if(f==null){
		//chromeWindow.alert('arg len ==1');
		savePageWithDefaults(chromeWindow, doc);
	}else{
		//alert('arg[1] '+arguments[1]);
		var filename=f;
		savePageToDefaultDirectoryWithFilename(chromeWindow, doc, filename);
	}
}
}
}



function makeFileFromParts(/* nsIFile */ directory, title, collisionCount, ext){
	fileText=title+"."+ext;
	if(collisionCount>0){
		fileText=title+"("+collisionCount+")."+ext;
	}
	directory.append(fileText)	
	return directory;
}

function savePageToDirectoryComplete(chromeWindow, doc, /* nsILocalFile */ dir){
	var pageTitle=doc.title;
	//rip out illegal file names!
	pageTitle= pageTitle.replace(':', "");
	var extension = "htm";
	var collisionCount = 0;
	var file=makeFileFromParts(dir, pageTitle, collisionCount, extension);
	while (file.exists()) {
		collisionCount++;
		file=makeFileFromParts(dir.parent, pageTitle, collisionCount, extension);
    }
	w=chromeWindow.makeWebBrowserPersist();
	var datapath=file.parent
	datapath.append(pageTitle+'_files');
	w.saveDocument(doc, file, datapath, null, 0,0);
//output(file);
}

function savePageToPathComplete(chromeWindow, doc, path){
	var file=path.leafName;
	file=file.replace(':', "");
	file= file.replace(/\.[^.]*$/, "")
	w=chromeWindow.makeWebBrowserPersist();
	var datapath=path.parent;
	datapath.append(file+'_files');
	w.saveDocument(doc, path, datapath, null, 0,0);
}

function savePageWithDefaultsComplete(chromeWindow, doc){
	var dir=Chickenfoot.SimpleIO.downloadDir();
	var pageTitle=doc.title;
	//rip out illegal file names!
	pageTitle= pageTitle.replace(':', "");
	var extension = "htm";
	var collisionCount = 0;
	var file=makeFileFromParts(dir, pageTitle, collisionCount, extension);
	//output(file);
	while (file.exists()) {
            collisionCount++;
			file=makeFileFromParts(dir.parent, pageTitle, collisionCount, extension);
    }
	var leafName=file.leafName;
	leafName= leafName.replace(/\.[^.]*$/, "")
	
	var datapath=file.parent;
	datapath.append(leafName+'_files');
	w=chromeWindow.makeWebBrowserPersist();
	w.saveDocument(doc, file, datapath, null, 0,0);

}

function savePageToDefaultDirectoryWithFilenameComplete(chromeWindow, doc, filename){
	var leafName=filename.replace(/\.[^.]*$/, "");
	leafName=leafName.replace(':', "");
	var file=Chickenfoot.SimpleIO.toFile(filename.replace(':', ""));	
	var datapath=file.parent
	datapath.append(leafName+'_files');
	w=chromeWindow.makeWebBrowserPersist();
	w.saveDocument(doc, file, datapath, null, 0,0);

}


//just save HTML helpers

function savePageToDirectory(chromeWindow, doc, /* nsILocalFile */ dir){
	var pageTitle=doc.title;
	//rip out illegal file names!
	pageTitle= pageTitle.replace(':', "");
	var extension = "htm";
	var collisionCount = 0;
	var file=makeFileFromParts(dir, pageTitle, collisionCount, extension);
	while (file.exists()) {
            	collisionCount++;
		file=makeFileFromParts(dir.parent, pageTitle, collisionCount, extension);
        }
	w=chromeWindow.makeWebBrowserPersist();
	w.saveDocument(doc, file, null, null, 0,0);
}

function savePageToPath(chromeWindow, doc, path){
	w=chromeWindow.makeWebBrowserPersist();
	w.saveDocument(doc, path, null, null, 0,0);
}

function savePageWithDefaults(chromeWindow, doc){
	var dir=Chickenfoot.SimpleIO.downloadDir();
	var pageTitle=doc.title;
	//rip out illegal file names!
	pageTitle= pageTitle.replace(':', "");
	var extension = "htm";
	var collisionCount = 0;
	var file=makeFileFromParts(dir, pageTitle, collisionCount, extension);
	//output(file);
	while (file.exists()) {
            collisionCount++;
			file=makeFileFromParts(dir.parent, pageTitle, collisionCount, extension);
    }
	w=chromeWindow.makeWebBrowserPersist();
	w.saveDocument(doc, file, null, null, 0,0);
}

function savePageToDefaultDirectoryWithFilename(chromeWindow, doc, filename){
	filename=filename.replace(':', "");
	var file=Chickenfoot.SimpleIO.toFile(filename);	
	w=chromeWindow.makeWebBrowserPersist();
	w.saveDocument(doc, file, null, null, 0,0);

}









/*
 * Chickenfoot end-user web automation system
 *
 * Copyright (c) 2004-2007 Massachusetts Institute of Technology
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Chickenfoot homepage: http://uid.csail.mit.edu/chickenfoot/
 */

package chickenfoot;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.jar.JarOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public final class ExportXpi {

	private static final Map<String, String> TEMPLATE_TO_JAR_PATH;

	static {
		Map<String, String> map = new HashMap<String, String>();
		map.put("contents.rdf", "content/contents.rdf");
		map.put("overlay.xul", "content/overlay.xul");
		map.put("chickenscratch.xul", "content/chickenscratch.xul");
		TEMPLATE_TO_JAR_PATH = Collections.unmodifiableMap(map);
	}

	private static Map<String, String> TEMPLATE_TO_XPI_PATH;

	static {
		Map<String, String> map = new HashMap<String, String>();
		map.put("Chickenfoot.js", "components/Chickenfoot.js");
		map.put("Chicken-bypass.js", "components/Chicken-bypass.js");

		// Don't copy this!
		// The current thinking is that ChickenfootCommandLineHandler will
		// interfere with Chickenfoot, if it is also installed.
		// But be aware that we are not copying it.
		// map.put("ChickenfootCommandLineHandler.js", "components/ChickenfootCommandLineHandler.js");
		
		map.put("update.template.rdf", "update.rdf");
		map.put("install.template.rdf", "install.rdf");
		map.put("preferences.js", "defaults/preferences/preferences.js");
		TEMPLATE_TO_XPI_PATH = map; //Collections.unmodifiableMap(map);
	}

	/** Utility class -- do not instantiate */
	private ExportXpi() {
	}

	/**
	 * 
	 * @param xmlStringsArray
	 * @param outputPath
	 * @param templateTagsArray
	 * @param extensionPath - may need to convert from file:///C:/... to
	 *        something Java understands
	 * @param userFilesArray -of strings representing file pathnames
	 * @param iconPath
	 * @return
	 */
	public static String xpiTie(String xmlString, String outputPath, String[] templateTagsArray, 
			String extensionPath, String[] userFiles, String iconPath)
	throws IOException {
		// deserialize templateTagsArray into a map
		Map<String, String> tagMap = new HashMap<String, String>();
		for (int i = 0; i < templateTagsArray.length; i += 2) {
			tagMap.put(templateTagsArray[i], templateTagsArray[i + 1]);
		}

		// populate templates in xpi-tie directory
		File xpiTieDirectory = new File(extensionPath, "export");
		File[] templateFiles = xpiTieDirectory.listFiles();
		Map<String, String> fileName2populatedTemplate = new HashMap<String, String>();
		for (File template : templateFiles) {
			fileName2populatedTemplate.put(template.getName(),
					populateTemplate(getFileContents(template), tagMap));
		}

		//only write the update.rdf file to disk if an update url was specified
		if(tagMap.get("EXTENSION_URL") != null && !tagMap.get("EXTENSION_URL").equals("")) {
			File extensionDir = (new File(outputPath)).getParentFile();
			File updateRdf = new File(extensionDir, "update.rdf");
			FileWriter w = new FileWriter(updateRdf);
			w.write(fileName2populatedTemplate.get("update.template.rdf"));
			w.flush();
			w.close();
		}
		//take it out of the map so that it isn't added to the xpi file
		TEMPLATE_TO_XPI_PATH.remove("update.template.rdf");
		
		// write ASCII entries into JAR
		File jarFile = File.createTempFile("output", ".jar");
		JarOutputStream jarStream = new JarOutputStream(new FileOutputStream(
				jarFile));
		for (String fileName : TEMPLATE_TO_JAR_PATH.keySet()) {
			String jarFilePath = TEMPLATE_TO_JAR_PATH.get(fileName);
			JarEntry jarEntry = new JarEntry(jarFilePath);
			jarStream.putNextEntry(jarEntry);
			jarStream.write(fileName2populatedTemplate.get(fileName).getBytes());
			jarStream.closeEntry();
		}

		//write logo to JAR
		if ((iconPath != null) && (iconPath != "")) {
			writeFileToJar(iconPath, jarStream, "", "icon.png");
		}
		else {
			File chromeDirectory = new File(extensionPath, "chrome");
			JarFile chickenfootChromeJar = new JarFile(new File(chromeDirectory, "chickenfoot.jar"));
			JarEntry logo = chickenfootChromeJar.getJarEntry("skin/classic/beak-32.png");

			JarEntry insertedLogo = new JarEntry("content/icon.png");
			jarStream.putNextEntry(insertedLogo);
			InputStream entryStream = chickenfootChromeJar.getInputStream(logo);
			try {
				// Allocate a buffer for reading the entry data.
				byte[] buffer = new byte[1024];
				int bytesRead;
				// Read the entry data and write it to the output file.
				while ((bytesRead = entryStream.read(buffer)) != -1) {
					jarStream.write(buffer, 0, bytesRead);
				}
			} finally {
				entryStream.close();
			}
			jarStream.closeEntry();
		}

		// write libraries into JAR
		// TODO(mbolin): read libraries out of chickenfoot-java.jar instead of libraries directory
		// so there does not have to be two copies of each library file in chickenfoot.xpi
		File librariesDirectory = new File(extensionPath, "libraries");
		File[] libraryFiles = librariesDirectory.listFiles();
		for (File library : libraryFiles) {
			insertLibraryFileIntoJar(library, jarStream, null);
		}

		jarStream.finish();
		jarStream.close();

		// write ASCII entries into XPI
		File xpiFile = new File(outputPath);
		ZipOutputStream zipStream = new ZipOutputStream(new FileOutputStream(
				xpiFile));
		for (String fileName : TEMPLATE_TO_XPI_PATH.keySet()) {
			String xpiFilePath = TEMPLATE_TO_XPI_PATH.get(fileName);
			String contents = fileName2populatedTemplate.get(fileName);
			addStringToZip(contents, zipStream, xpiFilePath);
		}

		// write native libraries into XPI
		File componentDirectory = new File(extensionPath, "components");
		File[] componentFiles = componentDirectory.listFiles();
		for (File component : componentFiles) {
			String name = component.getName();
			if (name.indexOf("ChickenSleep") != -1) {
				addFileToZip(component, zipStream, "components", null);
			}
		}
		
		//write user files, including trigger files, into XPI
		for (int k=0; k<userFiles.length; k++) {
			try {
				File current = new File(userFiles[k]);
				addFileToZip(current, zipStream, null, null);
			}
			catch(IOException err) {
				continue;
			} 
		}
		
		//write triggers.xml into XPI
		File tempFile = File.createTempFile("triggers", ".xml");
		FileWriter writer = new FileWriter(tempFile);
		writer.write(xmlString);
		writer.close();
		addFileToZip(tempFile, zipStream, null, "triggers.xml");
		tempFile.delete();

		// write JAR into XPI
		addFileToZip(jarFile, zipStream, "chrome", "chickenfoot-xpi-tie.jar");

		// copy the "java" directory into the XPI
		{
			String dirName = "java";
			File dir = new File(extensionPath, dirName);
			for (File file : dir.listFiles()) {
				addFileToZip(file, zipStream, "java", null);
			}
		}

		// close XPI
		zipStream.finish();
		zipStream.close();

		return xpiFile.getCanonicalPath();
	}

	private static String populateTemplate(String template,
			Map<String, String> tagMap) {
		// TODO: eliminate this loop by using a lambda-replace
		for (String tag : tagMap.keySet()) {
			template = template.replaceAll("@" + tag + "@", tagMap.get(tag));
		}
		return template;
	}

	private static void insertLibraryFileIntoJar(File library, JarOutputStream jarStream, String prefix) throws IOException {
		if (library.isDirectory()) {
			File[] files = library.listFiles();
			prefix = (prefix == null) ? library.getName() : prefix + "/" + library.getName();            
			for (File f : files) {
				insertLibraryFileIntoJar(f, jarStream, prefix);
			}
		} else {
			String path = library.getName();
			if (prefix != null) path = prefix + "/" + path;
			path = "content/libraries/" + path;
			JarEntry jarEntry = new JarEntry(path);
			jarStream.putNextEntry(jarEntry);
			jarStream.write(getFileContents(library).getBytes());
			jarStream.closeEntry();
		}
	}

	private static String getFileContents(File file) throws IOException {
		StringBuilder sb = new StringBuilder();
		BufferedReader reader = new BufferedReader(new FileReader(file));
		char[] chars = new char[1024];
		int numRead = 0;

		while((numRead=reader.read(chars)) != -1){
			String readData = String.valueOf(chars, 0, numRead);
			sb.append(readData);
			chars = new char[1024];
		}
		reader.close();
		return sb.toString();
	}

	private static void addFileToZip (File currentFile, ZipOutputStream zipStream, String dirName, String newName) throws IOException {
		String fileName = "";
		if (dirName == null) {
			dirName = "";
		}
		else {dirName += "/";}
		if (newName == null) {
			fileName = currentFile.getName();
		}
		else { fileName = newName; }
		if (currentFile.isFile()) {
			try {
				zipStream.putNextEntry(new ZipEntry(dirName + fileName));
				FileInputStream in = new FileInputStream(currentFile);
				byte[] buf = new byte[2048];
				int n;
				while ((n = in.read(buf)) != -1) {
					zipStream.write(buf, 0, n);
				}
			} finally { 
				zipStream.closeEntry();
			}
		}
		else {
			dirName = dirName + currentFile.getName();
			File[] current = currentFile.listFiles();
			for (int i=0; i<current.length; i++) {
				addFileToZip(current[i], zipStream, dirName, null);
			}
		}
	}

	private static void addStringToZip (String contents, ZipOutputStream zipStream, String pathInZip) throws IOException {
		zipStream.putNextEntry(new ZipEntry(pathInZip));
		zipStream.write(contents.getBytes());
		zipStream.closeEntry();
	}

	private static void writeFileToJar(String filePathname, JarOutputStream jarStream, String dirName, String newName) throws IOException {
		File currentFile = new File (filePathname);

		String fileName = "";
		if (dirName == "") {
			dirName = "content/";
		}
		if (newName == null) {
			fileName = currentFile.getName();
		}
		else { fileName = newName; }
		if (currentFile.isFile()) {
			FileInputStream entryStream = new FileInputStream(filePathname);
			JarEntry newFile = new JarEntry(dirName + fileName);
			jarStream.putNextEntry(newFile);
			try {
				// Allocate a buffer for reading the entry data.
				byte[] buffer = new byte[1024];
				int bytesRead;
				// Read the entry data and write it to the output file.
				while ((bytesRead = entryStream.read(buffer)) != -1) {
					jarStream.write(buffer, 0, bytesRead);
				}
			} finally { 
				entryStream.close();
				jarStream.closeEntry();
			}
		}
		else {
			dirName = dirName + currentFile.getName() + "/";
			File[] current = currentFile.listFiles();
			for (int i=0; i<current.length; i++) {
				writeFileToJar(current[i].getAbsolutePath(), jarStream, dirName, null);
			}
		}
	}

	/**
	 * Test of ExportXpi -- uses paths hardcoded to mbolin's computer
	 */
	/*    public static void main(String[] args) throws IOException {
	String guid = "6";
	String chickenfootContractId = "7";
	String chickenfootGuid = "9";
	String[] templateTags = new String[] {
		"EXTENSION_NAME", guid,
		"EXTENSION_DISPLAY_NAME", "Foo Bar",
		"EXTENSION_AUTHOR", "bolinfest",
		"GUID", guid,
		"VERSION", "0.1",
		"DESCRIPTION", "The best foo.bar in town.",
		"DEFAULT_INCLUDES", "\"['*']\"",
		"DEFAULT_EXCLUDES", "\"[]\"",
		"CHICKENFOOT_CONTRACT_ID", chickenfootContractId,
		"CHICKENFOOT_GUID", chickenfootGuid,
		"IS_EXPORTED_XPI", "true"
	};

	String outputPath = xpiTie(
		"document.title = 6",
		"c:\\my.xpi",
		templateTags,
	"C:\\Documents and Settings\\mbolin\\Application Data\\Mozilla\\Firefox\\Profiles\\47z749tv.default\\extensions\\{896b34a4-c83f-4ea7-8ef0-51ed7220ac94}\\",
	new String[0], "");

	System.out.println("Wrote extension to: " + outputPath);
    }*/
}

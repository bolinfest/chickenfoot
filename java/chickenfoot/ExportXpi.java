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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public final class ExportXpi {

	/**
	 * This is a utility class and should not be instantiated.
	 */
	private ExportXpi() { }


	/**
	 * This method writes all files inside the temporary directory to a zip file located at the
	 * output path. The temporary directory itself is NOT written to the zip file, only its contents.
	 * The files in the temporary directory are not modified or deleted, only copied.
	 * 
	 * @param tempDirPath : String //full absolute path of the temporary directory
	 * @param outputPath : String //full absolute path where the zip file will be written to
	 * 
	 * @requires tempDirPath, outputPath != null
	 * @throws IOException
	 */
	public static void writeToZip(String tempDirPath, String outputPath) throws IOException {
		//references to tempDir and output zip file
		File tempDir = new File(tempDirPath);
		File zipFile = new File(outputPath);
		
		//use the same zip stream for writing all entries
		ZipOutputStream zipStream = new ZipOutputStream(new FileOutputStream(zipFile));
		
		//iterate through all files in tempDir and write them to output file
		File[] tempFiles = tempDir.listFiles();
		for(int i=0; i<tempFiles.length; i++) { writeFileToZip(tempFiles[i], zipStream, null); }
		zipStream.finish(); zipStream.close();
	}


	/**
	 * This method writes a single file or directory to a zip file using the given zip stream.
	 * For directories, this method recursively calls itself on each of the files in the directory.
	 * The file or directory is not modified or deleted, only copied. This method never uses a reference
	 * to the actual zip file or its path, it only uses the given zip stream.
	 * 
	 * @param currentFile : File //File object to be written to the zip file
	 * @param zipStream : ZipOutputStream //zip output stream used to write to the zip file
	 * @param dirName : String //optional prefix to attach to the file name in the zip file, ignored if null
	 * 
	 * @requires currentFile, zipStream != null
	 * @throws IOException
	 */
	private static void writeFileToZip(File currentFile, ZipOutputStream zipStream, String dirName) throws IOException {
		if (currentFile.isFile()) { //currentFile is a file (i.e. not a directory)
			//file name in zip file
			String fileName = currentFile.getName();
			if(dirName != null) { fileName = dirName + fileName; }
			
			//read bytes from file into a buffer, then write to the zip file from this buffer
			FileInputStream entryStream = new FileInputStream(currentFile);
			zipStream.putNextEntry(new ZipEntry(fileName));
			try {
				byte[] buffer = new byte[2048]; int bytesRead;
				while ((bytesRead = entryStream.read(buffer)) != -1) { zipStream.write(buffer, 0, bytesRead); }
			} finally {
				//close the file input stream and the zip stream entry
				entryStream.close();
				zipStream.closeEntry();
			}
		}
		else { //currentFile is a directory
			//directory prefix in zip
			String subDirName = currentFile.getName() + "/";
			if(dirName != null) { subDirName = dirName + subDirName; }
			
			//iterate through the contents of the directory and recursively call this method on each one
			File[] current = currentFile.listFiles();
			for(int i=0; i<current.length; i++) { writeFileToZip(current[i], zipStream, subDirName); }
		}
	}
}

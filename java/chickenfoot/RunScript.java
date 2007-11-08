/* -*- Mode: java; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is Rhino code, released
 * May 6, 1998.
 *
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1999 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the
 * terms of the GNU Public License (the "GPL"), in which case the
 * provisions of the GPL are applicable instead of those above.
 * If you wish to allow use of your version of this file only
 * under the terms of the GPL and not to allow others to use your
 * version of this file under the NPL, indicate your decision by
 * deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL.  If you do not delete
 * the provisions above, a recipient may use your version of this
 * file under either the NPL or the GPL.
 */
package chickenfoot;

import org.mozilla.javascript.*;
import java.io.StringReader;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import java.util.*;

public class RunScript {
	Timer timer;
	public final static double THRESHHOLD = .20;
	public RunScript() {
		timer = new Timer();
	}
	public RunScript(String s) {
		
	}

	public void fireEnterEvent(int keyEvent) {
		if (keyEvent==13) {
			timer.schedule(new EnterButton(), 100);
		}
		
	}
	// Verify takes a string of javascript and returns an array.
	// array[0] is a boolean about whether it thinks the string is javascript or not.
	// array[1] is a percent of how many lines caused syntax errors.
	// The rest of the array is filled with detailed error explanations.
	
	public ErrorReport verify(String s) {
		String[] line_by_line = s.split("\n");
		CompilerEnvirons environ = new CompilerEnvirons();
		ErrorLogger logger = new ErrorLogger();
		Parser parser = new Parser(environ, logger);
		try {
			parser.parse(new StringReader(s), "", 0);
		} catch (Exception e) {
		}
		Error[] errors = logger.errors.toArray(new Error[0]);
		ErrorReport report = new ErrorReport(line_by_line.length, errors);
	
		return report;
	}
	/**
	 * Makes a stringReader representing a string starting from line and going to the end of the array.
	 * @param s - an array of strings
	 * @param line - the last line not to be added
	 * @return
	 */
	public StringReader makeStringReader(String[] stringArray, int line) {
		if (line >= stringArray.length) {
			return null;
		}
		String s = "";
		for (int i = line; i<stringArray.length; i++) {
			s += stringArray[i] + "\n";
		}
		return new StringReader(s);
	}

	private class EnterButton extends TimerTask {
		public void run() {
			try {
				Robot robot = new Robot();
				robot.keyPress(KeyEvent.VK_ENTER);
				robot.keyRelease(KeyEvent.VK_CONTROL);
				robot.keyRelease(KeyEvent.VK_ENTER);
			} catch(Exception e){
				throw new RuntimeException(e.getMessage());
			}	
		}
	}
}


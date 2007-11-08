package chickenfoot;
import java.util.ArrayList;

import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

public class ErrorLogger implements ErrorReporter {
	public int counter = 0;
	public ArrayList<Error> errors;
	public Error error;
	public ErrorLogger() {
		errors = new ArrayList<Error>();
	}
	public void error(String message, String sourceName, int line, String lineSource, int lineOffset, int length) {
		
		Error e = new Error(message, line, lineOffset);
		error = e;
		errors.add(e);
		counter++;
		//error = new Error(message, line, lineOffset);
	}
	public void error(String message, String sourceName, int line, String lineSource, int lineOffset) {
		
		Error e = new Error(message, line, lineOffset);
		error = e;
		errors.add(e);
		counter++;
		
		//error = new Error(message, line, lineOffset);
	}
	public Error getLastError() {
		return error;
	}
	public void flushError() {
		error = null;
	}
	public EvaluatorException runtimeError(String message, String sourceName, int line,	String lineSource, int lineOffset) {
		throw new EvaluatorException(message, sourceName, line);
	}
	
	// Functions I don't actually need
	public void info(String mesage, String sourceName, int line, String lineSource,	int lineOffset, int length) {}
	public void warning(String message, String sourceName, int line, String lineSource, int lineOffset, int length) {}
	public void warning(String message, String sourceName, int line, String lineSource,	int lineOffset) {}
	public void invalidIdentifier(String idName, String sourceName, int line) {}
	public void output(String str) {}
}

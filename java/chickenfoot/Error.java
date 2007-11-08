package chickenfoot;

public class Error {
	String message;
	int line;
	int lineOffset;
	public Error(String message, int line, int lineOffset) {
		this.message = message;
		this.line = line;
		this.lineOffset = lineOffset;
	}
	public String toString() {
		return "Error: "+message+" Line: "+line+" Character: "+lineOffset;
	}
	
	public int getLine() {
		return line;
	}
}

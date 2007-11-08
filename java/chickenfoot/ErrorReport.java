package chickenfoot;

public class ErrorReport {
	public static final double THRESHHOLD = .8;
	private int numLines;
	private int numErrors;
	private double percentError;
	Error[] errors;
	
	public ErrorReport(int numLines, Error[] errors) {
		this.numLines = numLines;
		int line = -1;
		int errorCounter = 0;
		for (int i=0; i<errors.length; i++) {
			Error e = errors[i];
			if (e.line==line) {
				continue;
			}
			line = e.line;
			errorCounter++;
		}
		this.numErrors = errorCounter;
		this.errors = errors;
		percentError = (double) numErrors / (double) numLines;
	}
	
	public boolean isJS() {
		return percentError < THRESHHOLD;
	}
	
	public double getPercentError() {
		return percentError;
	}
	
	public int getNumLines() {
		return numLines;
	}
	
	public int getNumErrors() {
		return numErrors;
	}
	
	public Error[] getErrors() {
		return errors;
	}
	
	
}


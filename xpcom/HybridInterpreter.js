/*
  This class is used for executing keyword commands and javascript simultaneously.  
  It uses Interpreter as well as KeywordCommandInterpreter
*/
var JAVASCRIPT_START_TAG = "<javascript>";
var JAVASCRIPT_END_TAG = "</javascript>";
var KEYWORD_TAG = "keyword";
function evaluateHybrid(/*  ChromeWindow */ chromeWindow, 
                        /* String */ code,
                        /*nsIFile*/ sourceDir) {
  var htmlWindow = getVisibleHtmlWindow(chromeWindow);

  var buffer_array = code.split('\n');
  var code_to_evaluate = "";
  var forceJS = false;
  for (var i = 0; i<buffer_array.length; i++) {
    var doc = getLoadedHtmlDocument(htmlWindow);
    var line = buffer_array[i];
    // For now check if <javascript> is contained in the line.  
    // Eventually check to see that it is a comment.  
    if (line.indexOf(JAVASCRIPT_START_TAG)>=0) {
      forceJS = true;
      continue;
    }
    else if (line.indexOf(JAVASCRIPT_END_TAG)>=0) {
      forceJS = false;
      continue;
    }
    var useKW = false;
    if (forceJS) {
      if (line.indexOf(KEYWORD_TAG) >= 0) {
        useKW = true;
        line = line.replace(KEYWORD_TAG, '');
      }
    }
    else {
      useKW = isLineKeyword(line);
    }
    if (useKW) {
      code_to_evaluate+="Chickenfoot.evaluateKeywordCommand(document, '"+line+"')"+"\n";
    }
    else {
      code_to_evaluate+=line+"\n";
    }
    
  }
  //debug(code_to_evaluate);
  evaluate(chromeWindow, code_to_evaluate, true, null, null, sourceDir);
}
  function evaluateKeywordCommand(doc, line) {
    var interpretations = interpretKeywordCommand(doc, line);
    var bestInterpretation = interpretations[0];
    if (bestInterpretation.node) {
        animateTransparentRectangleOverNode(bestInterpretation.node,
          function() { bestInterpretation.execute(); });
      } 
    else {
      bestInterpretation.execute();
    }
  }
  
/*
  Uses a set of heuristics to determine if a particular string
  is believed to be keyword commands
*/
function /* boolean */ isLineKeyword(/* String */ line) {
  // First strip out any strings.  
  var clean = line.replace(/(?:\".*\")|(?:\'.*\')/, "");
  
  
  // Check to see if the format is word space word.
  if (clean.match(/^\w+\s\w+/)) {
    // If the first word is a JavaScript keyword, then it is probably not keyword commands.
    if (clean.match(/^\s*(?:var|const)/)) {
      return false;
    }
  }
  else if (clean.match(/[\(\);{}]/)) {
    return false;
  }
  return true;
  
}
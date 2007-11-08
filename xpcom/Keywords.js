/**
 * Split a string into an array of tokens for keyword pattern matching.
 * @param pattern   Keyword pattern to split
 * @return String[] with some additional fields and methods:
 *     .pattern   
 *           Original pattern argument, uncanonicalized
 
 *     .canonicalPattern 
 *           Pattern converted to lowercase, with runs of punctuation and whitespace 
 *           replaced by a single space
 *
 *     .match()
 *           Matching method, see below.
 */
function splitIntoKeywords(/*String*/ pattern) {
  if (!pattern) pattern = "";

  // split pattern into canonicalized tokens  
  var keywords = [];
  var matchedTokens = pattern.match(/\w+|'[^']+'|"[^"]+"/g);
  if (matchedTokens) {
    for (var i = 0; i < matchedTokens.length; ++i) {
      keywords[i] = canonicalize(matchedTokens[i].toString());
    }
  }
    
  keywords.pattern = pattern;
  keywords.canonicalPattern = canonicalize(pattern);

  /**
   * Test whether a string matches this keyword pattern.
   * @param text   String to test
   * @return 
   *      0 if no keywords can be found in text (or keywords is empty)
   *      1 if all keywords are found in text
   *      2 if canonical pattern is an exact match for canonical text
   *      a fraction in [0,1] indicating the fraction of keywords 
   *          that were found in text.
   *
   * This function is useful because
   * oftentimes the user's input string will
   * not match the HTML exactly.
   */
  keywords.match = function(/*String*/ text) {
    text = canonicalize(text);
    if (text == this.canonicalPattern) return 2;
    
    if (!this.length) return 0;
    
    if (!this._regex) {
       // create regexes for each token
       this._regex = [];
       for (var i = 0; i < this.length; ++i) {
          this._regex[i] = new RegExp("\\b" + this[i] + "\\b");
       }
    }
       
    var m = 0;
    for (var i = 0; i < this._regex.length; ++i) {
      if (text.match(this._regex[i])) ++m;
    }
    return m / this.length;
  }
  
  /**
   * Generate another keywords object, derived from the same original
   * pattern, but with a new list of tokens.
   */
  keywords.derive = function(/*String[]*/ tokens) {
    tokens.pattern = this.pattern;
    tokens.canonicalPattern = this.canonicalPattern;
    tokens.match = this.match;
    tokens.derive = this.derive;
    return tokens;    
  }

  return keywords;
}

function canonicalize(/*String*/ s) {
  return trim(s.replace(/\W+/g, " ")).toLowerCase();
}

/*
function editDistance(s1, s2) {
  if (!javaEditDistance) {
    javaEditDistance = 
      getJavaClass("chickenfoot.experimental.StringMetrics")
        .getMethod("editDistance",
                   [Packages.java.lang.String, Packages.java.lang.String]);
  }
  return javaEditDistance.invoke(null, [s1, s2]);
}
*/

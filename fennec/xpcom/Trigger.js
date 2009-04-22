
function Trigger(name, source, description, enabled, includes, excludes) { // , path, when) {
	/*String*/  this.name = name;
	/*String*/  this.source = source; // TODO remove
	/*String*/  this.description = description;
	/*boolean*/ this.enabled = enabled;
	/*String[]*/this.includes = (includes) ? includes : [ "*" ];
	/*String[]*/this.excludes = (excludes) ? excludes : [];
}

/**
 * If any element of includes is not a valid trigger pattern,
 * then an exception will be thrown and includes will not be updated
 */
Trigger.prototype.includes setter = function(/*String[]*/ includes) {
  if (!includes) throw Error("includes passed to setIncludes was null");
  var newRegExps = [];
  for (var i = 0; i < includes.length; i++) {
    newRegExps[i] = Trigger.convert2RegExp(includes[i]);
  }
  this._includes = includes;
  this.includesRegExps = newRegExps;
}

Trigger.prototype.includes getter = function() { return this._includes; }

/**
 * If any element of excludes is not a valid trigger pattern,
 * then an exception will be thrown and excludes will not be updated
 */
Trigger.prototype.excludes setter = function(/*String[]*/ excludes) {
  if (!excludes) throw Error("excludes passed to setExcludes was null");
  var newRegExps = [];
  for (var i = 0; i < excludes.length; i++) {
    newRegExps[i] = Trigger.convert2RegExp(excludes[i]);
  }
  this._excludes = excludes;
  this.excludesRegExps = newRegExps;
}

Trigger.prototype.excludes getter = function() { return this._excludes; }

Trigger.convert2RegExp = function(pattern) {
  pattern = pattern.toString(); // make sure pattern is a String
  // if pattern starts with /, then assume it is already a valid RegExp
  if (pattern.length && pattern.charAt(0) == '/') {
    var match = pattern.match(/\/(.*)\/([img]*)$/);
    if (!match) throw new Error(pattern + " did not evaluate to a RegExp!");
    return new RegExp(match[1], match[2]);
  }
  
  var re = "/^";
  for (var i = 0; i < pattern.length; i++) {
    switch (pattern[i]) {
      case ' ' :
        break;
      case '*' :
        re += ".*"; break;
      case '\\' :
        re += "\\\\"; break;
      case '/' :
			case '.' : 
			case '?' :
			case '^' : 
			case '$' : 
			case '+' :
			case '{' :
			case '[' : 
			case '|' :
			case '(' : 
			case ')' :
			case ']' :
			  re += "\\" + pattern[i]; break;
			default  :
			  re += pattern[i]; break;
    }
  }
  re += "$/i";
  return eval(re);
}


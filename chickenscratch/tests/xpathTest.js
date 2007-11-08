var Test = Chickenfoot.Test;
var Pattern = Chickenfoot.Pattern;
var StringBuffer = Chickenfoot.StringBuffer;

var prefix = "file://" + scriptDir.path + "/pages/";

// if useFetch is true, testing happens in the background, using fetch().
// otherwise, uses go().
var useFetch = false;


// These tests make sure pick() does the right thing.

var t = new Test();

var testName;  // name of current test, inferred from load() argument

load("google.html");
testCount(1, null, new XPath('/html'));
testCount(1, null, new XPath('/html/body'));
testCount(13, null, new XPath('//a'));
testCount(3, null, new XPath('/html/body/center/form/table[2]//td'));
testCount(34, new XPath('//*/text()'));

var pg = fetch(prefix + "personalized-google.html");
testCount(45, null, new XPath('//*/text()'), pg);
pg.close();

// Summarize testing
t.close();



///////////////
// internal methods
//

var fetched = null;

function load(file) {
  var url = prefix + file;
  if (useFetch) {
    fetched = fetch(url);
  } else {
    go(url);
  }
  
  // extract the basename of the filename and use
  // it as the test name
  testName = file.match(/^([^\.]*)(\.|$)/)[1]
}

function getDocument() {
  if (useFetch) {
    return fetched.document;
  } else {
    return document;
  }
}

  
function doFind(type, pattern, /*optional*/ context) {
  pattern = patternToString(type,pattern);

  if (context) {
    return context.find(pattern);
  } else if (useFetch) {
    return fetched.find(pattern);
  } else {
    return find(pattern);
  }
}

function testElement(attr,val,type,pattern, /*optional*/ context) {
  var m; 
  t.test(testName, function() {
    m = doFind(type,pattern,context);
    var matches = matchesToString(m);
    Test.assertEquals(m.count, 1, 
                    patternToString(type,pattern) + " matched " + m.count + " times:\n" + matches);

    var attrValue = m.element.getAttribute(attr);
    Test.assertEquals(val, attrValue, 
                    patternToString(type,pattern) + " matched " + attrValue + " instead of " + val + ":\n" + matches);
  });
  return m; 
}

function testCount(count,type,pattern, /*optional*/ context) {
  var m; 
  t.test(testName, function() {
    m = doFind(type, pattern, context); 
    Test.assertEquals(count, m.count, 
                    patternToString(type,pattern) + " matched " + m.count + " times instead of " + count + ": \n" + matchesToString(m));
  });
  return m;
}

function patternToString(type,pattern) {
  if (!pattern) return type;
  else if (!type) return pattern;
  else return pattern + " " + type;
}

function matchesToString(m) {
  var sb = new StringBuffer();
  while (m.hasMatch) {
    sb.append(m.html + "\n");
    m = m.next;
  }
  return sb.toString();
}




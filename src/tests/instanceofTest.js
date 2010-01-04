include("Test.js");

var instanceOf = Chickenfoot.instanceOf;

var t = new Test("instanceofTest");



// String objects
t.test(function() {
  var s = new String("test");
  Test.assert(instanceOf(s, String), "s should be instanceof String");
  Test.assert(instanceOf(s, Object), "s should be instanceof Object");
  Test.assert(!instanceOf(s, Date), "s should not be instanceof Date");
});

// Array objects
t.test(function() {
  var a = [];
  Test.assert(instanceOf(a, Array), "a should be instanceof Array");
  Test.assert(instanceOf(a, Object), "a should be instanceof Object");
  Test.assert(!instanceOf(a, Number), "a should not be instanceof Number");
});

// XPCOM objects
t.test(function() {
  var r = new XMLHttpRequest;
  Test.assert(instanceOf(r, XMLHttpRequest), "r should be instanceof XMLHttpRequest");

  Test.assert(instanceOf(chromeWindow, chromeWindow.ChromeWindow), "chromeWindow should be instanceof ChromeWindow");
});

// Invalid objects
t.test(function() {
  Test.assert(!instanceOf(5, Number), "literal should not be instanceof Number");
  Test.assert(!instanceOf("s", String), "literal should not be instanceof String");
  Test.assert(!instanceOf(null, Object), "null should not be instanceof Object");
});

// user-created classes
t.test(function() {
  function C() {}
  var c = new C();

  Test.assert(instanceOf(c, C), "c should be instanceof C");
  Test.assert(instanceOf(c, Object), "c should be instanceof Object");
  Test.assert(!instanceOf(c, String), "c should not be instanceof String");

  // make a subclass of C
  function D() {}
  D.prototype = new C();
  var d = new D();
  Test.assert(instanceOf(d, D), "d should be instanceof D");
  Test.assert(instanceOf(d, C), "d should be instanceof C");
  Test.assert(!instanceOf(c, D), "c should not be instanceof D");
  Test.assert(instanceOf(d, Object), "d should be instanceof Object");
  Test.assert(!instanceOf(d, Date), "d should not be instanceof Date");
});

// anonymous classes
t.test(function() {
  var E = function() {};
  var e = new E();

  Test.assert(instanceOf(e, E), "e should be instanceof E");
  Test.assert(instanceOf(e, Object), "e should be instanceof Object");
  Test.assert(!instanceOf(e, String), "e should not be instanceof String");
});

// Firefox 1.0.3 bug

t.test(function() {

    Test.assert(instanceOf(document, Document), "document should be instanceof Document");

    Test.assert(!instanceOf(document, String), "document should not be instanceof String");
});



// classes in other namespaces
t.test(function() {
  Test.assert(instanceOf(window.document, chromeWindow.Document), "window.document should be instanceof chromeWindow.Document");

  var s = new String("s");

  Test.assert(instanceOf(s, Chickenfoot.String), "s should be instanceof Chickenfoot.String");
  Test.assert(instanceOf(s, chromeWindow.String), "s should be instanceof chromeWindow.String");

  Test.assert(instanceOf(s, Chickenfoot.Object), "s should be instanceof Chickenfoot.Object");
  Test.assert(instanceOf(s, chromeWindow.Object), "s should be instanceof chromeWindow.Object");

  Test.assert(!instanceOf(s, Chickenfoot.Number), "s should not be instanceof Chickenfoot.Number");
});

t.test(function() {
  Test.assert(!instanceOf(document.documentElement, Document), "node should not be instanceof Document");
});

// RegExp objects
t.test(function() {
  var r = /\w+/;
  Test.assert(instanceOf(r, RegExp), "r should be instanceof RegExp");
  Test.assert(instanceOf(r, Object), "r should be instanceof Object");
  Test.assert(!instanceOf(r, Number), "r should not be instanceof Number");

  Test.assert(instanceOf(r, Chickenfoot.RegExp), "r should be instanceof Chickenfoot.RegExp");
  Test.assert(instanceOf(r, chromeWindow.RegExp), "r should be instanceof chromeWindow.RegExp");
});


t.close();





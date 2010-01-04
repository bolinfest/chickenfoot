include("Test.js");

var t = new Test("namespaceTest");


t.test(function() {
  // Chickenscratch primitives
  go; fetch; openTab;
  click; enter; pick; unpick; check; uncheck;  
  find;
  insert; remove; replace;
  before; after;
  document; window; chromeWindow;
  Chickenfoot;
  Link; Button;
  onClick;
  output; clear;
  wait; ready; whenLoaded;
  sleep;  
  back; forward;
  
  // Core Javascript
  String; Number; Boolean;
  Date;
  Array;
  
  // Useful client-side Javascript
  Packages; java;
  alert;
  setTimeout;
  Node; NodeFilter;
  Document; DocumentFragment;
  Range;
  XPathResult;
  XMLHttpRequest;
  
  // Firefox specific
  Components;
});

// Bug #122: Chickenscratch commands not available in exception handlers.
t.test(function() {
  try {throw 0} catch(e) {
    // Now we're in an exception handler.
    // Make sure Chickenscratch commands are still defined.
    output;
    Chickenfoot;
    find;
    click;
  }
});

t.close();


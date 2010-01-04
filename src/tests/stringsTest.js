include("Test.js");

with (Chickenfoot) {
  goog.require('ckft.util.strings');
  goog.require('ckft.util.strings.DeleteMap');
  
  var t = new Test("stringsTest");
  
  t.test(function() {
    Test.assertEquals(ckft.util.strings.condenseSpaces("hello"), "hello");
    Test.assertEquals(ckft.util.strings.condenseSpaces(""), "");
    Test.assertEquals(ckft.util.strings.condenseSpaces("  he  l l\r\n\t\no   "), "he l l o");
  });
    
  var d;
  
  t.test(function() {
    Test.assertEquals(ckft.util.strings.condenseSpaces("hello", d=new ckft.util.strings.DeleteMap()), "hello");
    Test.assertEquals(d.map.length, 0);
    Test.assertEquals(d.cookedToRaw(0), 0);
    Test.assertEquals(d.cookedToRaw(3), 3);
  });
  
  t.test(function() {
    Test.assertEquals(ckft.util.strings.condenseSpaces("", d=new ckft.util.strings.DeleteMap()), "");
    Test.assertEquals(d.map.length, 0);
  });
    
  t.test(function() {
    Test.assertEquals(ckft.util.strings.condenseSpaces("  he  l l\r\n\t\no   ", d=new ckft.util.strings.DeleteMap()), "he l l o");
    Test.assertEquals(d.cookedToRaw(0), 2);
    Test.assertEquals(d.cookedToRaw(1), 3);
    Test.assertEquals(d.cookedToRaw(4), 7);
    Test.assertEquals(d.cookedToRaw(5), 8);
    Test.assertEquals(d.cookedToRaw(6), 9);
    Test.assertEquals(d.cookedToRaw(7), 13);
    Test.assertEquals(d.cookedToRaw(8), 14);
  });

  t.close();
    
}


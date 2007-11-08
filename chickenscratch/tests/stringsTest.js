with (Chickenfoot) {
  
  var t = new Test();
  
  t.test(function() {
    Test.assertEquals(condenseSpaces("hello"), "hello");
    Test.assertEquals(condenseSpaces(""), "");
    Test.assertEquals(condenseSpaces("  he  l l\r\n\t\no   "), "he l l o");
  });
    
  var d;
  
  t.test(function() {
    Test.assertEquals(condenseSpaces("hello", d=new DeleteMap()), "hello");
    Test.assertEquals(d.map.length, 0);
    Test.assertEquals(d.cookedToRaw(0), 0);
    Test.assertEquals(d.cookedToRaw(3), 3);
  });
  
  t.test(function() {
    Test.assertEquals(condenseSpaces("", d=new DeleteMap()), "");
    Test.assertEquals(d.map.length, 0);
  });
    
  t.test(function() {
    Test.assertEquals(condenseSpaces("  he  l l\r\n\t\no   ", d=new DeleteMap()), "he l l o");
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


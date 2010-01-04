include("Test.js");

with (Chickenfoot) {
  goog.require('ckft.dom.Box');
  
  var t = new Test("BoxTest"); 

  t.test(function() {
      var b = new ckft.dom.Box(3, 4, 10, 20);
      Test.assertTrue(b.x == 3);
      Test.assertTrue(b.y == 4);
      Test.assertTrue(b.w == 10);
      Test.assertTrue(b.h == 20);
      Test.assertTrue(b.width == 10);
      Test.assertTrue(b.height == 20);
      Test.assertTrue(b.x1 == 3);
      Test.assertTrue(b.y1 == 4);
      Test.assertTrue(b.x2 == 13);
      Test.assertTrue(b.y2 == 24);
  });  

  // Box.forNode() is tested by findTest

  t.close();    
}

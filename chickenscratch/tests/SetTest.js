// imports
var Test = Chickenfoot.Test
var SlickSet = Chickenfoot.SlickSet

/**
 * Tests an implementation of Set
 */

/* Map API:
 *
 * obj add(obj)
 * bool contains(obj)
 * bool remove(obj)
 * int size()
 * bool isEmpty()
 * void clear()
 * Array toArray()
 */

function createSet() {
  // README: implement this function so
  // that it returns the implementation
  // of Map that you want to test
  
  return new SlickSet();
}

var t = new Test();


s = createSet();
var retVal = null;

t.test(function() {
Test.assertEquals(s.size(), 0, "size() should be 0 for new set");
Test.assertTrue(s.isEmpty(), "set should be empty for new set");

});

t.test(function() {
s.add("foo");
s.add("bar");
s.add("baz");
Test.assertEquals(s.size(), 3, "size() should now be 3");

});

t.test(function() {
Test.assertTrue(s.remove("bar"), "bar should have been removed");
Test.assertTrue(s.size(), 2, "size() should be 2 after removal");
Test.assertFalse(s.remove("bar"), "bar should have already been removed");

});

t.test(function() {
s.clear();
Test.assertEquals(s.size(), 0, "size() should be 0 for new set");
Test.assertTrue(s.isEmpty(), "set should be empty for new set");

});

t.close();


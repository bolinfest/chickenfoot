// imports
var Test = Chickenfoot.Test
var SlickMap = Chickenfoot.SlickMap
var HashMap = Chickenfoot.HashMap


/**
 * Tests an implementation of Map
 */

/* Map API:
 *
 * void clear()
 * bool containsKey(obj)
 * obj get(obj)
 * obj put(obj, obj)
 * bool remove(obj)
 * int size()
 * bool isEmpty()
 * Array entries()
 * Array keys()
 * Array values()
 */
 
function createMap() {
  // README: implement this function so
  // that it returns the implementation
  // of Map that you want to test
  
  return new HashMap();
  //return new SlickMap();
}

// test empty map
function testEmptyMap(map) {
  Test.assertEquals(map.size(), 0, "empty map should have size 0");
  Test.assertTrue(map.isEmpty(), "empty map should be empty");
  Test.assertFalse(map.containsKey(null), "empty map should not contain null key");
  Test.assertFalse(map.containsKey(new Object()), "empty map should not contain obj as key");
  Test.assertFalse(map.containsKey("a"), "empty map should not contain string as key");
  Test.assertEquals(map.entries().length, 0, "empty map should have empty entrySet");
}

/*------ BEGIN TEST ------*/

var t = new Test();


var map = createMap();

t.test(function() { testEmptyMap(map); });

t.test(function() {
var retVal = map.put("a", "b");

Test.assertEquals(retVal, null, "first put should return null");
Test.assertEquals(map.size(), 1, "map should have one element");
Test.assertFalse(map.isEmpty());
Test.assertTrue(map.containsKey("a"), 'map should contain "a"');
//Test.assertTrue(map.containsKey(new String("a")), 'map should contain new String("a")');
Test.assertEquals(map.get("a"), "b", "map['a'] should return b");

})

t.test(function() {
retVal = map.put("a", "c");

Test.assertEquals(retVal, "b");
Test.assertEquals(map.size(), 1, "map should have one element");
Test.assertFalse(map.isEmpty());
Test.assertTrue(map.containsKey("a"), 'map should contain "a"');
//Test.assertTrue(map.containsKey(new String("a")), 'map should contain new String("a")');
Test.assertEquals(map.get("a"), "c", "map['a'] should return c");

});

t.test(function() {
retVal = map.remove("a");

Test.assertEquals(retVal, "c", 'remove() did not return "c"');
Test.assertEquals(map.get("a"), null, 'map did not remove "a"');
testEmptyMap(map);

})

t.test(function() {
map.put("abc", "def");
map.put("abc2", "def");
map.put("abc", "def");

Test.assertEquals(map.entries().length, 2, "there should be 2 entries in the map");

})

t.close();



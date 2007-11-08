/**
 * A Set implementation that composes a Map.
 *
 * A SlickSet can contain any value except null or undefined.
 */

/**
 * Creates a new, empty Set.
 */
function SlickSet() {
  this.map = new SlickMap(); 
}

/**
 * A private dummy object that is
 * the value for a key in the SlickMap
 */
SlickSet.DUMMY = new Object();

/**
 * Adds the specified object to the set.
 * @return a boolean indicating if
 *   this was a new addition to the Set
 */
SlickSet.prototype.add = function(obj) {
  return this.map.put(obj, SlickSet.DUMMY) == null;
}

/**
 * Adds each element of the specified array to the set
 */
SlickSet.prototype.addAll = function(arr) {
  for (var i = 0; i < arr.length; ++i) {
    this.add(arr[i]);
  }
}

/**
 * Removes the specified object from the map.
 * @return a boolean indicating if
 *   the obj was there to be removed
 */
SlickSet.prototype.remove = function(obj) {
  return this.map.remove(obj) == SlickSet.DUMMY;
}

/**
 * @return the size of the set
 */
SlickSet.prototype.size = function() {
  return this.map.size();
}

/**
 * @return a boolean indicating if the set is empty
 */
SlickSet.prototype.isEmpty = function() {
  return this.map.size() == 0;
}

/**
 * @return a boolean indicating of the obj
 *  is an element of the set
 */
SlickSet.prototype.contains = function(obj) {
  return this.map.containsKey(obj);
}

/**
 * Removes all of the entries from the set
 */
SlickSet.prototype.clear = function() {
  this.map.clear();
}

/**
 * @return the elements of the set in an array
 */
SlickSet.prototype.toArray = function() {
  return this.map.keys();
}

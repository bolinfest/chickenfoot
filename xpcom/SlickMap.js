/**
 * SlickMap is an implementation of Map.
 *
 * SlickMap trivially mutates keys in the Map by
 * adding two fields (see implementation details below).
 * If it is unacceptable for such fields to be added,
 * use HashMap instead. We expect that SlickMap will
 * outperform HashMap, on average.
 *
 * Any value can be used as a key in SlickMap,
 * except for null and undefined.
 *
 * The same object can be a key in multiple SlickMaps.
 *
 * How it works under the hood:
 *   If a key in SlickMap is a String, Number, Boolean,
 *   or primitive version thereof, then the primitive
 *   value is stored as a key in the primitives associative array.
 *   The value associated with the key is stored
 *   in the associated array as well.
 *   Because associated arrays do not know their size,
 *   the primitiveSize field has to be kept in synch with
 *   primitives to ensure that primitiveSize is equal to
 *   the number of entries in primitives.
 *
 *   If a key in SlickMap is some other type of object,
 *   then SlickMap adds two fields to the key.
 *   The first is a unqiue string prefixed with
 *   "SlickMapSpecialKey" followed by a unique integer
 *   for the SlickMap to which the key is being added.
 *   The second field has the same name as the first field
 *   with the addition of the string "Index."
 *   The value associated with this field is
 *   the index of the key in SlickMap's objects array. 
 *   Each key in SlickMap needs to know its index
 *   in the objects array so that it can be removed from
 *   SlickMap in constant time. When a key is removed
 *   from the middle of the objects array, the object at
 *   the end of the array is inserted into the removed
 *   key's index, the index of the swapped key is
 *   reassigned, and the length of the objects array
 *   is decremented by one.
 *
 *   When a lookup is performed on a String, Number, Boolean,
 *   or primitive version thereof, then a simple
 *   lookup is done in the primitives associative array.
 *   Otherwise, the key is tested to see if it has
 *   the special SlickMap index field, and if so,
 *   the value associated with the special key field is returned.
 *   Thus, the values associated with non-primitive keys
 *   are not stored in SlickMap itself, but rather
 *   as fields of the keys themselves.
 *
 *   When a key is removed from SlickMap, the fields that were
 *   added to the key by SlickMap are deleted, indicating
 *   that the key no longer belongs to SlickMap.
 *
 * Representation Invariant (properties that must always hold):
 * (1) number of entries in SlickMap == primitiveSize + objects.length
 * (2) foreach non-primitive key, it has specialKey and specialKeyIndex as fields
 *       such that specialKey points to the value with which the key is
 *       associated under the SlickMap mapping, and
 *     specialKeyIndex points to an integer which is equal to the
 *       index in SlickMap's objects array that points to the key
 * (3) foreach primitive key, its key/value pair is stored in primitives
 *
 */

/**
 * Creates an empty Map
 *
 * Running time: O(1)
 */
function SlickMap() {
  if (SlickMap.NEXT_ID === undefined) SlickMap.NEXT_ID = 1;
  this.specialKey = 'SlickMapSpecialKey' + SlickMap.NEXT_ID++;
  this.specialKeyIndex = this.specialKey + "Index";
  this.primitives = {}
  this.primitiveSize = 0;
  this.objects = [];
}

/**
 * Clears all of the entries
 * from this Map
 *
 * Running time: O(n)
 */
SlickMap.prototype.clear = function() {
  this.primitives = {};
  this.primitiveSize = 0;
  var len = this.objects.length;
  for (var i = 0; i < len; i++) {
    var key = this.objects[i];
    delete key[this.specialKey];
    delete key[this.specialKeyIndex];
  }
  this.objects = [];
}

/**
 * Returns the number of entries in the Map
 *
 * Running time: O(1)
 */
SlickMap.prototype.size = function() {
  return this.primitiveSize + this.objects.length;
}

/**
 * Returns true if there are no entries in the Map
 *
 * Running time: O(1)
 */
SlickMap.prototype.isEmpty = function() {
  return this.primitiveSize == 0 && this.objects.length == 0;
}

/**
 * "PRIVATE STATIC"
 */
SlickMap.simplify = function(key) {
  if (SlickMap.isPrimitiveValue(key)) {
    return key.valueOf();
  } else {
    return key;
  }
}

SlickMap.isPrimitiveValue = function(key) {
    return (instanceOf(key, String) ||
            instanceOf(key, Number) ||
            instanceOf(key, Boolean));
}

SlickMap.isObject = function(key) {
  // used to be key instanceof Object, but this returns false for many wrapped
  // objects in FF 1.5
    return typeof key == "object";
}

/**
 * Associates the key with the value in the Map
 *
 * Running time: O(1)
 */
SlickMap.prototype.put = function(key, value) {
  if (key === null || key === undefined) return undefined;
  key = SlickMap.simplify(key);
  if (SlickMap.isObject(key)) {
    if (this.specialKeyIndex in key) {
      // key object already in Map, replace mapping
      var oldValue = key[this.specialKey];
      key[this.specialKey] = value;
      return oldValue;
    } else {
      // add new object entry in Map
      key[this.specialKey] = value;
      key[this.specialKeyIndex] = this.objects.length;
      this.objects.push(key);
      return null;
    }
  } else {
    if (key in this.primitives) {
      // primitive key already in Map, replace mapping
      var oldValue = this.primitives[key];
      this.primitives[key] = value;
      return oldValue;
    } else {
      // add new primitive entry in Map
      this.primitives[key] = value;
      this.primitiveSize++;
      return null;
    }
  }
}

/**
 * Running time: O(1)
 */
SlickMap.prototype.get = function(key) {
  if (key === null || key === undefined) return undefined;
  key = SlickMap.simplify(key);
  if (SlickMap.isObject(key)) {
    return key[this.specialKey];
  } else {
    return this.primitives[key];
  }
}

/**
 * Running time: O(1)
 */
SlickMap.prototype.containsKey = function(key) {
  if (key === null || key === undefined) return false;
  key = SlickMap.simplify(key);
  if (SlickMap.isObject(key)) {
    return this.specialKeyIndex in key;
  } else {
    return key in this.primitives;
  }
}

/**
 * Running time: O(1)
 */
SlickMap.prototype.remove = function(key) {
  if (key === null || key === undefined) return;
  key = SlickMap.simplify(key);
  if (SlickMap.isObject(key)) {
debug("checking for special key: " + (this.specialKeyIndex in key));
    if (this.specialKeyIndex in key) {
      var oldValue = key[this.specialKey];
      var index = key[this.specialKeyIndex];
      delete key[this.specialKey];
      delete key[this.specialKeyIndex];
      var lastKey = this.objects.pop();
      if (this.objects.length > 0
          && index < this.objects.length) {
        this.objects[index] = lastKey;
        lastKey[this.specialKeyIndex] = index;
      }
      return oldValue;
    } else {
      return null;
    }
  } else {
    if (key in this.primitives) {
      var oldValue = this.primitives[key];
      delete this.primitives[key];
      this.primitiveSize--;
      return oldValue;
    } else {
      return null;
    }
  }
}

/**
 * Running time: O(n)
 */
SlickMap.prototype.entries = function() {
  var arr = [];
  var len = this.objects.length;
  for (var i = 0; i < len; i++) {
    var key = this.objects[i];
    arr.push(
      { 'key' : key,
        'value' : key[this.specialKey] });
  }
  for (var k in this.primitives) {
    arr.push(
      { 'key' : k,
        'value' : this.primitives[k] });       
  }
  return arr;
}

/**
 * Running time: O(n)
 */
SlickMap.prototype.keys = function() {
  var arr = [];
  var len = this.objects.length;
  for (var i = 0; i < len; i++) {
    arr.push(this.objects[i]);
  }
  for (var k in this.primitives) {
    arr.push(k);   
  }
  return arr;
}

/**
 * Running time: O(n)
 */
SlickMap.prototype.values = function() {
  var arr = [];
  var len = this.objects.length;
  for (var i = 0; i < len; i++) {
    var key = this.objects[i];
    arr.push(key[this.specialKey]);
  }
  for (var k in this.primitives) {
    arr.push(this.primitives[k]);
  }
  return arr;
}

/**
 * A string with the toString() of each key and value
 * in this SlickMap
 */
SlickMap.prototype.toString = function() {
  var sb = new StringBuffer('SlickMap:');
  var entries = this.entries();
  var len = entries.length;
  for (var i = 0; i < len; i++) {
    sb.append('[key=');
    sb.append(entries[i].key);
    sb.append(',value=');
    sb.append(entries[i].value);
    sb.append('],');
  }
  return sb.toString();
}

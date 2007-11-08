// TODO make HashMap double the number of buckets when
// when it has too many entries

/** java.util.Collections */



function Collections() {}

Collections.hash = function(obj) {
  var type = typeof(obj);
  if (type == 'number') return Math.floor(obj);
  if (type == 'boolean') return (obj ? 1 : 0);
  if (type == 'undefined' || obj == null) return 0;
  if (!obj || !(str = obj.toString())) return 0;
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
      hash = 31*hash + str.charCodeAt(i);
      hash &= 0xFFFFFFFF;  
  }
  return hash;
}

/** java.util.Map.Entry */

function Entry(key, value) {
  this.k = key;
  this.v = value;
  this.h = Collections.hash(key);
}

Entry.prototype.__defineGetter__("key",
  function() { return this.k; });

Entry.prototype.__defineGetter__("value",
  function() { return this.v; });

Entry.prototype.__defineSetter__("value",
  function(v) { this.v = v; });

Entry.prototype.hashCode = function() {
  return this.h;
}

Entry.prototype.toString = function() {
  var sb = new StringBuffer();
  sb.append('[Entry: key=').append(this.key);
  sb.append(', value=').append(this.value);
  sb.append(']');
  return sb.toString();
}

/**
 * java.util.HashMap
 */
function HashMap() {
  if (arguments && typeof(arguments[0]) == 'number') {
    this.entryLists =
      new Array(Math.floor(arguments[0]));
  } else {
    this.entryLists =
      new Array(HashMap.DEFAULT_CAPACITY);
  }
  this.entryCount = 0;
}

HashMap.DEFAULT_CAPACITY = 16;

HashMap.prototype.clear = function() {
  this.entryLists =
    new Array(HashMap.DEFAULT_CAPACITY);
  this.entryCount = 0;
}

HashMap.prototype.findEntry = function(key) {
  var hash = Collections.hash(key);
  var index = hash % this.entryLists.length;
  if (!this.entryLists[index]) {
    this.entryLists[index] = [];
  }
  var list = this.entryLists[index];
  var count = list.length;
  for (var i = 0; i < count; i++) {
    var entry = list[i];
    if (hash == entry.hashCode()) {
      var type = typeof(key);
      if (type == 'number'
          || type == 'string'
          || type == 'boolean'
          || !instanceOf(key,Number)
          || !instanceOf(key, String)
          || !instanceOf(key, Boolean)) {
        if (key == entry.key) return entry;
      } else {
        if (key === entry.key) return entry;
      }
    }
  }
  return null;
}

HashMap.prototype.remove = function(key) {
  var entry = this.findEntry(key);
  if (!entry) return null;
  var index = entry.h % this.entryLists.length;
  var list = this.entryLists[index];
  var count = list.length;
  for (var i = 0; i < count; i++) {
    if (entry === list[i]) {
      list.splice(i, 1);
      this.entryCount--;
      return entry.value;
    }
  }
}

HashMap.prototype.containsKey = function(key) {
  var entry = this.findEntry(key);
  return ((entry) ? true : false);
}

HashMap.prototype.get = function(key) {
  var entry = this.findEntry(key);
  return ((entry) ? entry.value : null);
}

HashMap.prototype.put = function(key, value) {
  var entry = this.findEntry(key);
  if (entry) {
    var oldValue = entry.value;
    entry.value = value;
    return oldValue;
  }
  entry = new Entry(key, value);
  var i = entry.hashCode() % this.entryLists.length;
  if (!this.entryLists[i]) {
    this.entryLists[i] = [ entry ];
  } else {
    this.entryLists[i].push(entry);
  }
  this.entryCount++;
  return null;
}

HashMap.prototype.size = function() {
  return this.entryCount;
}

HashMap.prototype.isEmpty = function() {
  return this.entryCount == 0;
}

/** NOT a view! */
HashMap.prototype.entries = function() {
  var arr = [];
  for (var i = 0; i < this.entryLists.length; i++) {
    if (this.entryLists[i]) {
      for (var j = 0; j < this.entryLists[i].length; j++) {
        arr.push(this.entryLists[i][j]);
      }
    }
  }
  return arr;
}

/** NOT a view! */
HashMap.prototype.keys = function() {
  var arr = [];
  for (var i = 0; i < this.entryLists.length; i++) {
    if (this.entryLists[i]) {
      for (var j = 0; j < this.entryLists[i].length; j++) {
        arr.push(this.entryLists[i][j].key);
      }
    }
  }
  return arr;
}

/** NOT a view! */
HashMap.prototype.values = function() {
  var arr = [];
  for (var i = 0; i < this.entryLists.length; i++) {
    if (this.entryLists[i]) {
      for (var j = 0; j < this.entryLists[i].length; j++) {
        arr.push(this.entryLists[i][j].value);
      }
    }
  }
  return arr;
}

HashMap.prototype.toString = function() {
  var sb = new StringBuffer('HashMap:');
  for (var i = 0; i < this.entryLists.length; i++) {
    sb.append(this.entryLists[i]);
    sb.append(',');
  }
  return sb.toString();
}

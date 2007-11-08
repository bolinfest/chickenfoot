/**
 * Create a new StringBuffer,
 * optionally passing str as the initial contents of the StringBuffer
 * 
 * If str is a String, then str will be the initial contents of the buffer.
 * If str is non-null, then str.toString() will be the initial contents.
 * Otherwise, the buffer will initially be empty.
 */
function StringBuffer(str) {
  if (arguments.length && (str = StringBuffer.asString(str))) {
    this.buffer = [ str ];
  } else {
    this.buffer = [];
  }
}

/**
 * Append the string (or toString()) of the provided argument
 * to this StringBuffer
 *
 * @return this
 */
StringBuffer.prototype.append = function(str) {
  str = StringBuffer.asString(str);
  if (str) this.buffer.push(str);
  return this;
}

/**
 * Prepend the string (or toString()) of the provided argument
 * to this StringBuffer
 *
 * @return this
 */
StringBuffer.prototype.prepend = function(str) {
  str = StringBuffer.asString(str);
  if (str) this.buffer.unshift(str);
  return this;
}

/**
 * Remove all the characters from this StringBuffer
 *
 * @return this
 */
StringBuffer.prototype.clear = function() {
  this.buffer = [];
  return this;
}

/**
 * @return the contents of this StringBuffer as a string
 */
StringBuffer.prototype.toString = function() {
  var str = this.buffer.join("");
  this.buffer = [ str ];
  return str;
}

/**
 * @return the number of characters in this StringBuffer
 */
// has the side-effect of compacting this.buffer by invoking toString()
StringBuffer.prototype.__defineGetter__("length", function() {
  return this.toString().length;
});

// TODO: make this a "static" method of StringBuffer
// returns a string of at least one character, or null
StringBuffer.asString = function(obj) {
  if (typeof(obj) == 'string') {
    return obj;
  } else if (obj != null) {
    return obj.toString();
  } else {
    return null;
  }
}

/** Test Code for StringBuffer 
sb = new StringBuffer('Thomas');

debug(sb);
sb.append(' Bolin');
debug(sb);
sb.prepend('Michael ');
debug(sb);
debug(sb.length);

sb2 = new StringBuffer();
debug(sb2.length);
sb2.append('Whatever');
debug(sb2);
debug(sb2.length);

sb3 = new StringBuffer(null);
debug(sb3);
debug(sb3.length);
debug(sb3.prepend('Mr.'));
debug(sb3.append(null));
debug(sb3.append(' Rogers'));
*/


/**
 * A JavaScript serialization/deserialization library that optionally outputs to JSON.
 * To learn about JSON, visit http://www.json.org/
 *
 * This library is targeted at the Mozilla/Firefox implementation of JavaScript.
 * It may behave differently in other implementations.
 */

/**
 * Takes an element in JavaScript and returns it as a string that
 * can be eval'd to recreate the element. The string is only guaranteed to
 * be valid JSON if serialize() is used in strict mode.
 *
 * ***Beware that this function may suffer from infinite recursion
 * if the element is an object that has properties that refer to one another.***
 *
 * There are certain JavaScript values, such as functions, RegExps, and undefined,
 * that cannot be expressed in JSON. When serialize() is used in strict mode,
 * serialize() will throw an error if it encounters one of these values, but
 * when non-strict mode is used, then serialize() will do its best to serialize
 * a value so that it can be restored when passed to deserialize().
 *
 * @param obj {object}
 * @param strict {boolean} indicating whether to encode obj in strict JSON,
 *   in which case it will throw an error if it encounters a function,
 *   RegExp, or undefined.
 *   strict is an optional argument whose default value is true
 * @return {string} the JSON representation of obj
 */
var serialize;

/**
 * Translates a string of serialized JavaScript into the value(s) that it encodes.
 *
 * @param json {string}
 * @param strict {boolean} indicating whether to decode json according to
 *   the JSON spec, or simply to decode it as JavaScript
 *   strict is an optional argument whose default value is true (currently ignored)
 * @return the json as the corresponding JavaScript value
 */
var deserialize;

/**
 * Pretty-prints JSON. Currently unimplemented -- contributions welcome!
 * @throw Error "not implemented"
 */
var prettyPrint;

(function () {

  /** Escape sequences for some special characters */
  // taken from: http://www.json.org/json.js
  var _escapeCharMap = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  };

  /**
   * Takes a string and returns its string representation that can
   * be eval'd in JavaScript to reproduce the original string.
   * @param str {string}
   * @return string
   * @private
   */
  function _asString(str) {
    // taken from: http://www.json.org/json.js
    if (/["\\\x00-\x1f]/.test(str)) {
      str = str.replace(/([\x00-\x1f\\"])/g, function(a, b) {
          var ch = _escapeCharMap[b];
          if (ch) return ch;
          ch = b.charCodeAt();
          return '\\u00' + Math.floor(ch / 16).toString(16) + (ch % 16).toString(16);
      });
    }
    return '"' + str + '"';
  }

  serialize = function(obj, strict) {
    strict = ((arguments.length < 2) || strict);
    var consName = (obj && obj.constructor) ? obj.constructor.name : undefined;
    var type = typeof obj;
    if (type == 'object') {
      // if obj is a wrapper type, then unwrap it
      if (consName && consName.indexOf("String Number Boolean") >= 0) {
        obj = obj.valueOf();
        type = typeof obj;
      }
    }
    switch (type) {
    case 'object':
      if (obj === null) return 'null';
      var buffer = "", arr = [];
      if (consName === 'Array') {
        buffer += '[';
        for (var i = 0; i < obj.length; ++i) {
          arr.push(serialize(obj[i], strict));
        }
        buffer += arr.join(',') + ']';
      } else {
        buffer += '{';
        for (var property in obj) {
          arr.push(_asString(property) + ':' + serialize(obj[property], strict));
        }        
        buffer += arr.join(',') + '}';
      }
      return buffer;

    case 'function':
      if (strict) throw new Error("a function cannot be expressed in strict JSON");
      if (consName === 'RegExp') {
        return obj.toString();
      }
      var name = obj.name;
      if (typeof name !== 'string') throw new Error("function does not have a name field");
      if (name.length) {
        return obj.toString().replace(name, '');
      } else {
        return obj.toString();
      }

    case 'number':
      if (isNaN(obj)) {
        if (strict) {
          throw new Error("NaN cannot be expressed in JSON");
        } else {
          return 'NaN';
        }
      } else if (!isFinite(obj)) {
        if (strict) {
          throw new Error("this value is not finite and cannot be expressed in JSON: " + obj);
        } else {
          return (obj > 0) ? 'Infinity' : '-Infinity';
        }
      }
      return obj.toString();

    case 'boolean':
      return obj ? 'true' : 'false';

    case 'string':
      return _asString(obj);

    case 'undefined':
      if (strict) throw new Error("undefined cannot be expressed in strict JSON");
      return 'undefined';

    default:
      throw new Error('serialize() does not know how express the following in JSON: ' + obj);
    }
  };

  deserialize = function(json, strict) {
    // TODO(mbolin): If strict, run a regexp over json to ensure it is valid
    return eval('(' + json + ')');
  };

  prettyPrint = function(json) {
    throw new Error("not implemented!");
  };

})();


go('http://java.sun.com/docs/books/tutorial/collections/interfaces/collection.html')

primitives = {
 'int' : 0,
 'char' : 0,
 'boolean' : 0,
 'double' : 0,
 'float' : 0,
 'long' : 0,
 'byte' : 0,
 'short' : 0,
 'void' : 0,
};

for (type = find('Java.Type'); type.hasMatch; type = type.next) {
  if (type in primitives) continue
  var func = new Function("displayType(\'" + type + "\')")
  replace(type, new Link(type.toString(), func))
}

/**
 * Opens a new tab to the Java 1.5 Javadoc for 'type'
 * If no Javadoc exists for 'type', then
 * the user is alerted that it could not be found.
 *
 * Implemented in JavaScript for performance reasons
 * There are over 3000 links on the 'All Classes' page,
 * so it takes awhile to parse.
 */
displayType = function(type) {
  if (type.substr(-2) == '[]') type = type.substr(0, type.length - 2)
  // TODO make this 1.5 compatible, i.e., strip <E> as well
  
//openTab('http://java.sun.com/j2se/1.5.0/docs/api/allclasses-frame.html')
go('http://java.sun.com/j2se/1.5.0/docs/api/allclasses-frame.html') 
  for (var i = 0; i < document.links.length; i++) {
    if (document.links[i].text == type) {
      document.location = document.links[i].toString()
      return;
    }
  }
  alert("No Java type found for: " + type + ".\n" +
    "Perhaps " + type + " is part of a nonstandard Java library.")
}



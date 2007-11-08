/**
 * Define a unique ID generator
 */

// Define unique ID generator constructor

function UidGen() {
   // Initialize object properties
   this.id = 0;
}

UidGen.prototype.nextId = function() {
  return this.id++;
}

UidGen.prototype.current = function() {
  return this.id;
}

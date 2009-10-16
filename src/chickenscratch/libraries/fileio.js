/**
 * Returns the contents of the given file as a string.
 *
 * @param {string} filename of the file to read.
 * @return {string} the contents of the file as a string.
 */
function read(filename) {
    return Chickenfoot.SimpleIO.read(filename)
}

/**
 * Creates a file with the given contents. 
 * Write the data as UTF-8 rather than straight bytes.
 *
 * @param {string} filename of the file to create (or overwrite)
 * @param {string} data to write to the file
 */
function write(filename, data) {
    return Chickenfoot.SimpleIO.write(filename, data)
}

/**
 * Creates a file with the given contents.
 * Write the data as straight bytes.
 *
 * @param {string} filename of the file to create (or overwrite)
 * @param {string} data to write to the file
 */
function writeBytes(filename, data) {
    return Chickenfoot.SimpleIO.writeBytes(filename, data)
}

/**
 * Appends the given data to the given file.
 *
 * @param {string} filename of the file to append to
 * @param {string} data to append to the file
 */
function append(filename, data) {
    return Chickenfoot.SimpleIO.write(filename, data, true)
}

/**
 * Tests whether the given file exists.
 *
 * @param {string} filename of the file to test
 * @return {boolean} true if the given file exists, and false otherwize
 */
function exists(filename) {
    return Chickenfoot.SimpleIO.exists(filename)
}

/**
 * Returns the home directory of the operating system
 * @return nsIFile referencing the home directory
 */
function homeDir() {
  return Chickenfoot.SimpleIO.homeDir();
}

/**
 * Returns the desktop directory of the operating system
 * @return nsIFile referencing the desktop directory
 */
function desktopDir() {
  return Chickenfoot.SimpleIO.desktopDir();
}

/**
 * Returns the downloads directory of Firefox
 * @return nsIFile referencing the downloads directory
 */
function downloadDir() {
  return Chickenfoot.SimpleIO.downloadDir();
}

/**
 * Returns the created directory inside Profile folder
 * @return nsIFile referencing the created directory
 */
function makeDir(dirname) {
  return Chickenfoot.SimpleIO.makeDir(dirname);
}
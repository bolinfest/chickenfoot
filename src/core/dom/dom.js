/* 
 * This file has miscellaneous DOM utility functions.
 */
 
goog.provide('ckft.dom');

goog.require('ckft.util.strings');

/**
 * Get tag name of an element.
 * @param {Node} node
 * @return {string?} tag name in upper case, e.g. SCRIPT, or null if node is not an element.
 */
ckft.dom.getTagName = function(node) {
    return ckft.util.strings.upperCaseOrNull(node.nodeName);
};
#!/usr/bin/env python

# The Closure Library does not have version numbers, so this script is used
# to take a snapshot from the Closure Library and copy it into Chickenfoot's
# codebase.

# REQUIREMENTS FOR RUNNING THIS SCRIPT
#
# (1) This script assumes that the Closure Library is checked out from
# Subversion in a sibling directory of the root chickenfoot directory for this
# project and that the directory containing the Library is named
# "closure-library".
# (2) This script assumes that it is run from the directory in which it lives.

import fileinput
import os
import os.path
import re
import shutil
import subprocess

# Get the version number from `svn info`.
svn_info_process = subprocess.Popen(["svn", "info"],
    cwd="../../../closure-library", stdout=subprocess.PIPE)
svn_info_output = svn_info_process.communicate()[0]
print svn_info_output
revision_re = re.compile("^Revision: (.*)$", re.MULTILINE)
revision_match = revision_re.search(svn_info_output)

# Until the Closure Library supports official version numbers, use the revision
# number from Subversion
closure_library_version_number = "r" + revision_match.groups()[0]

# Update closure-version.js with the revision number.
function_template = """
var goog = goog || {};

goog.getClosureLibraryVersion = function() {
  return '%(version)s';
};
"""
javascript = function_template % {"version": closure_library_version_number}
closure_version_js = open("closure-version.js", "w")
closure_version_js.write(javascript)
closure_version_js.close()

# The list of files the transitive dependency of all-includes.js.
# TODO(mbolin): Use calcdeps.py to generate this array.
files_to_copy = [
  "goog/base.js",
  "goog/array/array.js",
  "goog/disposable/disposable.js",
  "goog/dom/tagname.js",
  "goog/dom/classes.js",
  "goog/math/coordinate.js",
  "goog/math/size.js",
  "goog/object/object.js",
  "goog/string/string.js",
  "goog/useragent/useragent.js",
  "goog/dom/dom.js",
  "goog/dom/xml.js",
  "goog/debug/errorhandlerweakdep.js",
  "goog/events/event.js",
  "goog/events/browserevent.js",
  "goog/events/eventwrapper.js",
  "goog/events/listener.js",
  "goog/structs/simplepool.js",
  "goog/useragent/jscript.js",
  "goog/events/pools.js",
  "goog/events/events.js",
  "goog/events/eventhandler.js",
  "goog/events/eventtarget.js",
  "goog/events/keycodes.js",
  "goog/events/keyhandler.js",
  "goog/functions/functions.js",
  "goog/json/json.js",
  "goog/math/box.js",
  "goog/math/rect.js",
  "goog/net/errorcode.js",
  "goog/net/eventtype.js",
  "goog/timer/timer.js",
  "goog/structs/structs.js",
  "goog/iter/iter.js",
  "goog/structs/map.js",
  "goog/structs/set.js",
  "goog/debug/debug.js",
  "goog/debug/logrecord.js",
  "goog/debug/logger.js",
  "goog/net/xmlhttp.js",
  "goog/net/xhrmonitor.js",
  "goog/net/xhrio.js",
  "goog/useragent/product.js",
  "goog/style/style.js",
  "goog/window/window.js"
]

for file in files_to_copy:
  dir = file[:file.rfind("/")]
  if not os.path.exists(dir):
    os.mkdir(dir)
  shutil.copyfile("../../../closure-library/closure/" + file, file)

# Set COMPILED to true in base.js or else Chickenfoot will try to load
# dependencies via <script> tags, causing a security error.
for line in fileinput.input("goog/base.js", inplace=True):
    print line.replace("var COMPILED = false;", "var COMPILED = true;"),

shutil.copyfile("../../../closure-library/closure/bin/calcdeps.py", "calcdeps.py")

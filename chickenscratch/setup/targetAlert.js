/**
 * NOTE: This script uses the moz-icon: protocol which is only
 * supported on Microsoft Windows.
 */

excludedExtensions = {
  'html' : 1,  'shtml' : 1,  'php' : 1,  'jsp' : 1,  'asp' : 1,
}

mailto = /^mailto:/i
javascript = /^javascript:/i
type = /^[^\\?]*\.(\w+)$/i

for (link = find('link'); link.hasMatch; link = link.next) {
  if (!link.element) {
    output(link.html)
    continue;
  }
  href = link.element.getAttribute('href')
  if (href.match(mailto)) {
    continue
  } else if (href.match(javascript)) {
    html = ' <img src="moz-icon://.js?size=16"> '
  } else if (match = href.match(type)) {
    extension = match[1]
    if (extension in excludedExtensions) continue
    html = ' <img src="moz-icon://.' + extension + '?size=16"> '      
  } else {
    continue
  }
  insert(after(link), html) 
}

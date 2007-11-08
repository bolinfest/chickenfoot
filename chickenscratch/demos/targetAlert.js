// uses moz-icon: protocol which is only available on Windows

//go('http://www.bolinfest.com/targetalert/download.html', false)

excludedExtensions = {
  '.html' : 1,
  '.shtml' : 1,
  '.php' : 1,
  '.jsp' : 1,
  '.asp' : 1,
  '.com' : 1, // to exclude email addresses
}

for (link = find('link'); link.hasMatch; link = link.next) {
  href = link.element.href
  lastDot = href.lastIndexOf('.')
  if (lastDot) {
    extension = href.substring(lastDot)
    if (extension in excludedExtensions) continue
    icon = ' <img src="moz-icon://' + extension + '?size=16"> ';
    insert(after(link), icon)
  }
}
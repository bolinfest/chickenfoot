// adds a table of contents to the w3c 2004 proceedings
// (1) runs very slowly
// (2) links are listed in wrong order

go('http://www2004.org/proceedings/docs/contents.htm')

headings = find('[font] starting with "Session:"')
count = 0
for (h = headings; h.hasMatch; h = h.next) {
  var html = '<a name="' + count + '">'
       + h.html + '</a>'
  entry = '<p><a href="#' + count + '">' + h.toString() + '</a>'
  replace(h, html)
  insert('point just after "referred track papers"', entry)
  count++;
}


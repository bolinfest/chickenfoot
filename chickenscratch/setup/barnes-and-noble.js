originalTab = tab;
isbn = find(/ISBN: (\d+)/)

if (isbn.hasMatch) {
  with (openTab('http://libraries.mit.edu/', true)) {
//  with(fetch('http://libraries.mit.edu/')) {
    pick('Keyword')
    enter(isbn.groups[1])
    click('Search button')
    link = find('stacks link')
  }
  
  originalTab.show()
  insert(before('add to wish list link'), link)

}

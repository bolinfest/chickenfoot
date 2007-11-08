isbn = find('number just after isbn')
//setCurrentTabId('amazon')

//library = openTab('http://libraries.mit.edu/')
openTab('http://libraries.mit.edu/')

// pick('keywords')
// use until pick() is implemented
document.forms[0].elements['x'].value = 'find_WRD'

enter(isbn)
click('search')
link = find('link just after "location"')
debug(link.hasMatch)
//closeTab(library)
closeTab()

//selectTab('amazon')
insert('point just after "by"', link.html)



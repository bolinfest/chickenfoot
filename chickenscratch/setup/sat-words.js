// only load the SAT words from the CSAIL web site once
if (!global.vocabularyWords) {
  global.vocabularyWords = {}
  var doc = document.implementation.createDocument("", "", null)
  doc.async = false
  doc.load("http://groups.csail.mit.edu/uid/chickenfoot/sat-words.xml")
  elements = doc.getElementsByTagName("word")
  for (var i = 0; i < elements.length; i++) {
    node = elements.item(i)
    global.vocabularyWords[node.getAttribute('word')] = node.getAttribute('def')
  }
}

// using a full border prevents
// title attribute from being displayed on mouseover
style = 'background-color: #FFFFCC; border-top: solid 1px; border-bottom: solid 1px'
for (word = find(/\w+/) ; word.hasMatch; word = word.next) {
  if (word.toString() in global.vocabularyWords) {
    html = '<span style="' + style + '" '
         + 'title="' + global.vocabularyWords[word] + '">'
         + word
         + '</span>'
    replace(word, html)
  } 
}

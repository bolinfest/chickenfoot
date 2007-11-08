//go('http://www.bolinfest.com/test/sat-words.html', true);

//http://www.fdrlibrary.marist.edu/011144.html

var doc = document.implementation.createDocument("", "", null);
doc.async = false;
doc.load("http://www.bolinfest.com/test/sat-words.xml");

words = {}
elements = doc.getElementsByTagName("word")
len = elements.length
for (var i = 0; i < len; i++) {
  node = elements.item(i)
  words[node.getAttribute('word')]
   = node.getAttribute('def')
}

// using a full border prevents
// title attribute from being displayed on mouseover
style = 'background-color: #FFFFCC; border-top: solid 1px; border-bottom: solid 1px'

word = find('word')
for ( ; word.hasMatch; word = word.next) {
  if (word.toString() in words) {
    html = '<span style="' + style + '" '
         + 'title="' + words[word] + '">'
         + word
         + '</span>'
    replace(word, html)
  } 
}


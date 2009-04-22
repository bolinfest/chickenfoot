/**
 * On images.google.com, this adds a button after the search button
 * that will do a Google Image search that is limited to small GIF images.
 */

function doIconSearch() {
  var tbox = find('textbox')
  var text = tbox.element.value
  click('advanced image search')
  whenLoaded(function() {
    doAdvancedSearch(text)
  })
}

function doAdvancedSearch(text) {
  enter('all of the words', text)
  pick('small')
  pick('GIF')
  click('search button')
}

var button = new Button('Icon Search', doIconSearch);
insert(after('search images button'), button);

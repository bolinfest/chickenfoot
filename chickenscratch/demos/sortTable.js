go('http://groups.csail.mit.edu/uid/chickenfoot/table.html', true)

for (table = find(new TC('table')); table.hasMatch; table = table.next) {
  labelTable(table)
}

function labelTable(tableMatch) {  
  var heading = tableMatch.find(new TC('first row'))
  var index = 1
  for (var m = heading.find(new TC('text in cell')); m.hasMatch; m = m.next) {
    var func = new Function("sortRows(" + (m.index + 1) + "," + (tableMatch.index + 1) + ")")
    replace(m, new Link(m.text, func))
  }
} 

sortRows = function(columnIndex, tableIndex) {
  var index = 0;
  var t = find(new TC(tableIndex + 'th table'))
  var m = t.find(new TC(columnIndex + 'th cell in row'))
  // skip first row since it is <TH>
  var cells = []
  for (m = m.next; m.hasMatch; m = m.next) {
    var pair = {}
    pair.text = m.text
    pair.index = index++
    cells.push(pair)
  }
  var original = [].concat(cells)
  cells.sort(function(a, b) {
    var c = parseInt(a.text)
    var d = parseInt(b.text)
    if (!isNaN(c) && !isNaN(d)) {
      return c - d
    } else {
      return a.text.localeCompare(b.text)
    }
  })
  for (var i = 0; i < cells.length; i++) {
    cells[i].index = i
  }
  var rows = t.find(new TC('row anywhere after first row'))
  var sorted = new Array(cells.length)
  i = 0  
  for (r = rows; r.hasMatch; r = r.next) {
    sorted[original[i++].index] = r
  }
  i = 0
  for (r = rows; r.hasMatch; r = r.next) {
    replace(r, sorted[i++])
  }
}

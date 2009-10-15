goog.require('goog.string');

// TODO: eliminate globals
var shellDocument;
var input;
var div;

var shellEvalulationContext;

function setupShell() {
  shellDocument = sidebarDocument.getElementById('CF_SHELL').contentWindow.document;

  div = shellDocument.createElement('DIV');
  div.id = '';
  div.style.display = 'none';
  div.style.position = 'absolute';
  div.style.padding = '0px 3px';
  div.style.fontFamily = 'Monospace';
  div.style.fontWidth = '8pt';
  div.style.backgroundColor = 'white';
  div.style.border = '1px solid gray';
  shellDocument.body.appendChild(div);

  input = shellDocument.getElementById('input');
  input.addEventListener('keypress', keyPressListener, true);

  // TODO: create a global object for the shell  
  shellEvalulationContext = {};
}

var executedStatements = [];

function keyPressListener(event) {
  var keyCode = event.which;
  if (keyCode == 13) { // ENTER
    var code = goog.string.trim(input.value);
    if (!code) return;
    showAutocomplete(false);
    var result = runScript(code);
    // TODO: display result
  } else if (keyCode == 46) { // DOT
    var oldValue = input.value;
    window.setTimeout(function() { handleDot(oldValue);}, 0);
  } else if (event.keyCode == event.DOM_VK_UP) { // UP
    // TODO: cycle through executedStatements
  } else if (event.keyCode == event.DOM_VK_DOWN) { // DOWN
    // TODO: cycle through executedStatements
  } else {
    showAutocomplete(false);
  }
}

function runScript(code) {
  var withObj = goog.string.trim(shellDocument.getElementById('with').value);
  executedStatements.push(code);
  if (withObj) code = 'with(' + withObj + ') {' + code + '}';
  input.value = "";
  // TODO: return Chickenfoot.evaluate(code) using shellEvalulationContext
}

function handleDot(oldValue) {
  var newValue = input.value;
  var i = 0;
  while (i < oldValue.length) {
    if (oldValue.charAt(i) != newValue.charAt(i)) break;
    ++i;
  }
  showAutocompleteForChar(i);
}

function getCompletions(identifier, prefix) {
  // TODO: for identifier, look it up in shellEvaluationContext and
  // iterate over its keys, returning them in an array
  return ['toString()', 'title', 'getElementById()'];
}

function showAutocompleteForChar(charOffset) {
  var str = input.value.substring(0, charOffset);
  var identifier = str.match(/^(\w*)$/) || str.match(/[ =](\w*)$/);
  if (!identifier) return;
  identifier = identifier[1];

  // TODO: create regexp to match prefix as well
  var completions = getCompletions(identifier);
  if (!completions.length) return;
  var html = "";
  for (var i = 0; i < completions.length; ++i) {
    html += completions[i] + '<br>';
  }

  var box = shellDocument.getBoxObjectFor(input);
  div.style.top = (box.y + box.height) + 'px';
  div.style.left = (box.x + 8 * (charOffset + 1)) + 'px';
  div.innerHTML = html;
  showAutocomplete(true);
}

function showAutocomplete(show) {
  div.style.display = show ? '' : 'none';
}




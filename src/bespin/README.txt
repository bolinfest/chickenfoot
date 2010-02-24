This is Bespin 0.6.1, which is the first release of Bespin Embedded that
officially supports syntax highlighting.

The following code had to be added to BespinEmbedded.js:

var console = {
  log: function() {}
};

Without this snippet, a "console is undefined" error occurs when
BespinEmbedded.js is loaded.

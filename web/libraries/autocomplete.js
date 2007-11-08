go('google');

// make sure user is not on the Google personalized home page
if (find("  'Classic Home' link  ").hasMatch) {
  click("  'Classic Home' link  ");
}

style = '\
div.page_name_auto_complete {\
       width: 100px;\
       background: #fff;\
       display: inline;\
}\
\
div.page_name_auto_complete ul {\
       border: 1px solid #888;\
       margin: 0;\
       padding: 0;\
       width: 100%;\
       list-style-type: none;\
}\
\
div.page_name_auto_complete ul li {\
       margin: 0;\
       padding: 3px;\
}\
\
div.page_name_auto_complete ul li.selected { \
       background-color: #ffb;\
}\
\
div.page_name_auto_complete ul strong.highlight { \
       color: #800; \
       margin: 0;\
       padding: 0;\
}';

// add the style
include('greasemonkey.js');
GM_addStyle(style);

include('scriptaculous.js');

// create the autocomplete DIV
div = document.createElement('DIV');
div.id = 'whatever';
div.style.display = 'none';
div.className = 'page_name_auto_complete';
document.body.appendChild(div);

autocompletions = [];
for (var c in Chickenfoot) autocompletions.push(c);

// add the autocomplete functionality
new Autocompleter.Local(find('first textbox'), div.id, autocompletions);

var Test = Chickenfoot.Test;

var t = new Test();

//pattern finding for normal and anonymous nodes
t.test("pattern finding", function() {
  go("chrome://browser/content/browser.xul");
  var hb = find("home button");
  Test.assert(hb.count == 1);
  var sb = find("search button");
  Test.assert(sb.count == 1);
  });

//remove and insert
t.test("remove and insert", function() {
  var x = remove("home button");
  Test.assert(!find("home button").hasMatch);
  var y = remove("junk");
  Test.assert(y == null);

  insert(after("urlbar textbox"),x);
  var m = find("home button");
  Test.assert(m.hasMatch && m.count == 1);
  insert(before("second textbox"),m);
  m = find("home button");
  Test.assert(m.hasMatch && m.count == 2);
  insert(after("home button"),"<button label='press me' id='testbutton'></button>");
  Test.assert(document.getElementById("testbutton"));
  });

//enter
t.test("enter", function() {
  enter("first textbox", "yahoo.com");
  Test.assert(document.wrappedJSObject.getElementById("urlbar").textValue == "yahoo.com");
  enter("second textbox", "mozilla");
  Test.assert(find('second textbox')._node.wrappedJSObject.value == "mozilla");
  });

//click
t.test("click", function() {  
  go("chrome://browser/content/preferences/preferences.xul");
  
  click("main");
  click("feeds");
  Test.assert(find('feeds radiobutton')._node.wrappedJSObject.selected);
  click("main");
  Test.assert(find('main radiobutton')._node.wrappedJSObject.selected);
  });
  
//keypress
t.test("keypress", function() {
  with(Chrome()) {
    click("first textbox");
    keypress("y a h o o . c o m enter", "first textbox");
  }
  Test.assert(document.title == "Yahoo!");
});

//onClick
t.test("onClick", function() {
  with(Chrome()) {
    var numStopbuttons = find('stop button').count;
    insert(before('home button'), find('stop button'));
    onClick('second stop button', function() {remove('second stop button');});
    click('second stop button');
    Test.assert(find('stop button').count == numStopbuttons);  
  }
});

//onKeypress
t.test("onKeypress", function() {
  with(Chrome()) {
    var numTextboxes = find('textbox').count;
    insert(after('second textbox'), find('first textbox'));
    onKeypress('ctrl shift h', function() {remove('third textbox');}, 'third textbox');
    keypress('ctrl shift h', 'third textbox');
  }
  Test.assert(Chrome().find('textbox').count == numTextboxes);
});
  
//pick and unpick
t.test("pick and unpick", function() {
  go("chrome://global/content/printdialog.xul");
  
  pick("All pages");
  Test.assert(document.wrappedJSObject.getElementById("allpagesRadio").selected == true);
  pick("print to file");
  Test.assert(document.wrappedJSObject.getElementById("fileCheck").checked == true);
  unpick("print to file");
  Test.assert(!find("print to file")._node.wrappedJSObject.checked)
});

//check and uncheck
t.test("check and uncheck", function() {
  go("chrome://global/content/filepicker.xul");
  
  check("show hidden");
  Test.assert(find('show hidden')._node.wrappedJSObject.checked == true);
  uncheck("checkbox");
  Test.assert(!find('show hidden')._node.wrappedJSObject.checked);
});

//window matching and Chrome()
t.test("window matching and Chrome", function() {
  with(Chrome()) {click("file"); click("new window menuitem");}
  sleep(5);
  var w = find('first window');
  var c = Chrome(w._node);
  c.remove('home button')
  c.close()
  Test.assert(!c.find('home button').hasMatch);
  var thisChrome = Chrome();
  Test.assert(thisChrome.find('home button').count == 1);
});

t.close();







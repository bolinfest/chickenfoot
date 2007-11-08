Test = Chickenfoot.Test;

var t = new Test();



// bug #105
t.test(function() {
  go("google.com");
  wait();
  Test.assertEquals(window.document.title, "Google");
});

t.test(function() {
  testWait(openTab, closer);
});

t.test(function() {
  testWait(fetch, closer);
});

t.test(function() {
  testReady(openTab, closer);
});

// test whenLoaded()
t.test(function() {
  go("about:blank");
  wait();

  var finished = false;
  go("google.com");
  whenLoaded(function() {
    finished = true;
  });
  for (var i = 0; !finished && i < 30; ++i) {
    sleep(0.1);
  }
  Test.assert(finished, "whenLoaded() was never run");
});

t.close();


// utility functions

function closer(/*Window*/ w) {
  w.close();
}

function testWait(/*function*/ fetcher, /*function*/ cleanup) {
  var tabs = [fetcher("yahoo.com"),
                 fetcher("google.com")];
  var titles = ["Google", "Yahoo!"];
  var v;
  while (v = wait(tabs)) {
    var title = v.document.title;
    var i = titles.indexOf(title);
    Test.assert(i != -1, "wait() returned wrong document.title=" + title);
    titles.splice(i, 1);
    cleanup(v);
  }
  Test.assert(titles.length == 0, "wait() didn't return documents: " + titles);
  for (var i = 0; i < tabs.length; ++i) {
    cleanup(tabs[i]);
  }
    
}

function testReady(/*function*/ fetcher, /*function*/ cleanup) {
  var tabs = [fetcher("yahoo.com"),
                 fetcher("google.com")];
  var titles = ["Google", "Yahoo!"];
  var count = 0;
  var v;
  while (tabs.length) {
    while (!(v = ready(tabs))) {
      ++count;
      sleep(0.1);
    }
    var title = v.document.title;
    var i = titles.indexOf(title);
    Test.assert(i != -1, "ready() returned wrong document.title=" + title);
    titles.splice(i, 1);
    cleanup(v);
  }
  Test.assert(count > 0, "ready() didn't return immediately when window was unready");
  Test.assert(titles.length == 0, "ready() didn't return documents: " + titles);
}




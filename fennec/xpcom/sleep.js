function sleepImpl(/*ChromeWindow*/ chromeWindow, /*int*/ milliseconds) {
  var sleeper = makeSleeper();
  sleeper(milliseconds);
  // checkForStop();

  function makeSleeper() {  
    var sleeper;    
    sleeper = makeThreadSleeper();
    if (sleeper) return sleeper;
    
    // sleeper = makeChickenSleeper();
    // if (sleeper) return sleeper;
    
    throw new Error("sleep() not implemented on this platform, so Chickenfoot can't wait without blocking Firefox entirely");
  }
  
  function makeThreadSleeper() {
    const cls = Components.classes["@mozilla.org/thread-manager;1"];
    if (!cls) return null;
    var threadmgr = cls.getService(Components.interfaces.nsIThreadManager);
    var thread = threadmgr.currentThread;
    return function(milliseconds) {
      var done = false;
      chromeWindow.setTimeout(function() { done = true; }, milliseconds);
      while (!done) thread.processNextEvent(true);
    };    
  }
  
  /*
  function makeChickenSleeper() {
    const cls = Components.classes["@uid.csail.mit.edu/ChickenSleep;1"];
    if (!cls) return null;
    var sleeper = cls.createInstance().QueryInterface(Components.interfaces.IChickenSleep);
    return sleeper.sleep;
  }
  */
}

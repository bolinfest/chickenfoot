function sleepImpl(/*ChromeWindow*/ chromeWindow, /*int*/ milliseconds) {
    const cls = Components.classes["@mozilla.org/thread-manager;1"];
    if (!cls) return null;
    var threadmgr = cls.getService(Components.interfaces.nsIThreadManager);
    var thread = threadmgr.currentThread;
    var done = false;
    chromeWindow.setTimeout(function() { done = true; }, milliseconds);
    while (!done) thread.processNextEvent(true);
    checkForStop();
}

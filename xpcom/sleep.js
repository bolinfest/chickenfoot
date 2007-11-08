
function sleep(seconds) {
  if (seconds === undefined) throw new Error("must pass a value to seconds!");
  var milliseconds = parseInt(seconds * 1000);

  const cid = "@uid.csail.mit.edu/ChickenSleep;1";
  var sleeper = Components.classes[cid].createInstance();
  sleeper.QueryInterface(Components.interfaces.IChickenSleep);

  sleeper.sleep(milliseconds);
  checkForStop();
}

sleepImpl = sleep;
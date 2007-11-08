const cid = "@uid.csail.mit.edu/ChickenSleep;1";
obj = Components.classes[cid].createInstance();
obj = obj.QueryInterface(Components.interfaces.IChickenSleep);
//obj.verbose = true;

start = new Date().getTime();
obj.sleep(5000);
end = new Date().getTime();
duration = end - start;
output(duration);

output("done");















//@line 41 "c:\mozilla\source\MOZILLA_1_9a8_RELEASE\mozilla\toolkit\components\console\jsconsole-clhandler.js"

/*
 * -jsconsole commandline handler; starts up the Error console.
 */

const nsISupports           = Components.interfaces.nsISupports;
const nsICategoryManager    = Components.interfaces.nsICategoryManager;
const nsIComponentRegistrar = Components.interfaces.nsIComponentRegistrar;
const nsICommandLine        = Components.interfaces.nsICommandLine;
const nsICommandLineHandler = Components.interfaces.nsICommandLineHandler;
const nsIFactory            = Components.interfaces.nsIFactory;
const nsIModule             = Components.interfaces.nsIModule;
const nsIWindowWatcher      = Components.interfaces.nsIWindowWatcher;
const nsIWindowMediator     = Components.interfaces.nsIWindowMediator;

/*
 * Classes
 */

const jsConsoleHandler = {
    /* nsISupports */
    QueryInterface : function clh_QI(iid) {
        if (iid.equals(nsICommandLineHandler) ||
            iid.equals(nsIFactory) ||
            iid.equals(nsISupports))
            return this;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    /* nsICommandLineHandler */

    handle : function clh_handle(cmdLine) {
        if (!cmdLine.handleFlag("jsconsole", false))
            return;

        var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                       .getService(nsIWindowMediator);
        var console = windowMediator.getMostRecentWindow("global:console");
        if (!console) {
          var wwatch = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                                 .getService(nsIWindowWatcher);
          wwatch.openWindow(null, "chrome://global/content/console.xul", "_blank",
                            "chrome,dialog=no,all", cmdLine);
        } else {
          // the Error console was already open
          console.focus();
        }

        // note that since we don't prevent the default action, you'll get
        // an additional application window, unless you specified another
        // command line flag
    },

    helpInfo : "  -jsconsole           Open the Error console.\n",

    /* nsIFactory */

    createInstance : function clh_CI(outer, iid) {
        if (outer != null)
            throw Components.results.NS_ERROR_NO_AGGREGATION;

        return this.QueryInterface(iid);
    },

    lockFactory : function clh_lock(lock) {
        /* no-op */
    }
};

const clh_contractID = "@mozilla.org/toolkit/console-clh;1";
const clh_CID = Components.ID("{2cd0c310-e127-44d0-88fc-4435c9ab4d4b}");
const clh_category = "c-jsconsole";

const jsConsoleHandlerModule = {
    /* nsISupports */

    QueryInterface : function mod_QI(iid) {
        if (iid.equals(nsIModule) ||
            iid.equals(nsISupports))
            return this;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    /* nsIModule */

    getClassObject : function mod_gch(compMgr, cid, iid) {
        if (cid.equals(clh_CID))
            return jsConsoleHandler.QueryInterface(iid);

        throw Components.results.NS_ERROR_NOT_REGISTERED;
    },

    registerSelf : function mod_regself(compMgr, fileSpec, location, type) {
        compMgr.QueryInterface(nsIComponentRegistrar);

        compMgr.registerFactoryLocation(clh_CID,
                                        "jsConsoleHandler",
                                        clh_contractID,
                                        fileSpec,
                                        location,
                                        type);

        var catMan = Components.classes["@mozilla.org/categorymanager;1"]
                               .getService(nsICategoryManager);
        catMan.addCategoryEntry("command-line-handler",
                                clh_category,
                                clh_contractID, true, true);
    },

    unregisterSelf : function mod_unreg(compMgr, location, type) {
        compMgr.QueryInterface(nsIComponentRegistrar);

        compMgr.unregisterFactoryLocation(clh_CID, location);

        var catMan = Components.classes["@mozilla.org/categorymanager;1"]
                               .getService(nsICategoryManager);
        catMan.deleteCategoryEntry("command-line-handler", clh_category);
    },

    canUnload : function (compMgr) {
        return true;
    }
};

/* module initialisation */
function NSGetModule(comMgr, fileSpec) {
    return jsConsoleHandlerModule;
}

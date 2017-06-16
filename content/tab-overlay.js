vContactsAB = {
  name: "vContactsTab",
  perTabPanel: "vbox",
  lastTabID: 0,
  modes: {
    vContactsTab: {
      type: this.name,
    },
  },
  open: function() {
    // Check if tab already open, if so switch to it
    let tabs = document.getElementById('tabmail');

/*----------
  //  let tabs = document.getElementById('tabbrowser-tabs');

    var nTabs = gBrowser.visibleTabs.length
    for (var n = 0; n < nTabs; n++) {
      _tab = gBrowser.visibleTabs[n]
      console.log ("   gBrowser tab name: ", _tab.label)
    }
--------*/

    for (var tab in tabs.tabInfo) {
  //    console.log(" list all tabs:", tabs.tabInfo[tab].mode.name)
      if (tabs.tabInfo[tab].mode.name == this.name) {
  //      console.log("vContactsTab already open, go for it:" + tab);
        tabs.tabContainer.selectedIndex= tab;
        return;
      }
    }

  //  console.log("  tabs.openTab this.name   A ", this.name)


    tabs
      .openTab(
        this.name, 
        { contentPage: 'chrome://react/content/vContactsTab.xhtml' });
  },
  openTab: function(aTab, aArgs) {

  //  console.log("  tabs.openTab this.name   B ", this.name)

    // First clone the page and set up the basics.
    let clone = document.getElementById(this.name)
                        .firstChild
                        .cloneNode(true);

    clone.setAttribute("id", this.name + this.lastBrowserId);
    clone.setAttribute("collapsed", false);

    let toolbox = clone.firstChild;
    toolbox.setAttribute("id",
                         "vContacts_box" + this.lastBrowserId);
    toolbox.firstChild
           .setAttribute("id",
                         "vContacts_bar" + this.lastBrowserId);

    aTab.panel.appendChild(clone);
    aTab.root = clone;

    // Start setting up the browser.
    aTab.browser = aTab.panel.getElementsByTagName("browser")[0];
    aTab.toolbar = aTab.panel
                       .getElementsByClassName("vContacts_bar")[0];

    // As we're opening this tab, showTab may not get called, so set
    // the type according to if we're opening in background or not.
    let background = ("background" in aArgs) && aArgs.background;
    aTab.browser.setAttribute("type", background ? "content-targetable" :
                                                   "content-primary");

    aTab.browser.setAttribute("id", "vContactsBrowser" + this.lastBrowserId);
    if ("onLoad" in aArgs) {
      aTab.browser.addEventListener("load", function _vContacts_onLoad (event) {
        aArgs.onLoad(event, aTab.browser);
        aTab.browser.removeEventListener("load", _vContacts_onLoad, true);
      }, true);
    }

    // TODO: l10n
    aTab.title = "vContacts";
    aTab.browser.loadURI("chrome://react/content/vContactsTab.xhtml");

    this.lastBrowserId++;
  },
  closeTab: function(aTab) {
  },
  saveTabState: function(aTab) {
  },
  showTab: function(aTab) {
  },
  persistTab: function(aTab) {
  },
  restoreTab: function(aTab) {
  },
  onTitleChanged: function(aTab) {
  },
  supportsCommand: function(aCommand, aTab) {
  },
  isCommandEnabled: function(aCommand, aTab) {
  },
  doCommand: function(aCommand, aTab) {
  },
  getBrowser: function(aTab) {
  },
};

window.addEventListener("load", function(e) {
  // dump("\n\nRegistering vContacts tab.\n\n");
  let tabmail = document.getElementById("tabmail");
  tabmail.registerTabType(vContactsAB);
  // dump("\n\nAll done!\n\n");
}, false);

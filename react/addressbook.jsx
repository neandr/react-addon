/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.  */

var abRevision = '180315.00';

// Fields options
let abEmail = { key: "email", name: "Email", options: ["Work", "Home"] };
let abPhone = { key: "tel", name: "Phone", options: ["Mobile", "Home", "Work", "Fax", "Pager"] };
let abAddress = { key: "adr", name: "Address", options: ["Home", "Work"] };
let abWebpage = { key: "url", name: "Webpage", options: ["Home", "Work"] };
let abChat = { key: "chat",
  name: "Chat",
  options: [
    "Google Talk",
    "AIM (R)",
    "Yahoo",
    "Skype",
    "QQ",
    "MSN",
    "ICQ",
    "Jabber ID",
    "IRC Nick"
  ]
};

/* eslint-disable no-unused-vars    */

// The address fields available  (as with RFC)
let AddressFields = [
  "PostBox",
  "ExtendedAdr",
  "Street",
  "City",
  "Region",
  "PostalCode",
  "Country"
];

let ContactSections = [abEmail, abPhone, abAddress, abWebpage, abChat];
let PersonalSections = [
  "name",
  "nickname",
  "n",
  "bday",
  "anniversary",
  "gender",
  "rev",
  "note",
  "categories",
  "fn"
];

let CategoryStandard = ["Privat", "Friends"];
let CategoryCollection = [];

/* eslint-disable indent */

    let displayNone = { display: "none" };
    let displayBlock = { display: "block" };


let AddressBook = React.createClass({
  getInitialState: function() {
    let contactSections = ContactParser.createEmptyContactSections(
      this.props.contactSections
    );
    let personalSections = ContactParser.createEmptyPersonalSections(
      this.props.personalSections
    );

    return {
      abRev: "Welcome to vContacts  rev:" + abRevision,
      abStatus: "",
      abError: "",
      errorStatus: displayNone,

      contactDB: [],
      contactID: [],
      listPos: 0,

      contactList: [],
      contactListScroll: this.contactListScroll0,
      listId: null,
      listIdLast: null,
      selectedIds: [],
      contact: null,
      name: null,

      editing: false,
      photoUrl: "images/xContact.png",

      contactSections: contactSections,
      personalSections: personalSections,

      searchItem: "",
      tagItem: "",

      tagCollection: { CategoryCollection },
      hhStyle: false,
      tagSupportStatus: 'display: none',

      goModals: { deleteContact: false, deleteDB: false },

      modalIsOpen: false,
      selectedMailto: ""
    };
  },

  contactListScroll0: { height: '10px', marginTop: '0px', backgroundColor: '#739076', pointerEvents: 'none' },

  componentDidMount: function() {
    this.loadInContacts();
  },

  componentWillMount: function() {
    ReactModal.setAppElement("body");
  },

  loadInContacts: function() {
    DatabaseConnection.loadInContacts(this);
  },

  addContact: function() {
    //         Should directly open the imported contact                        //TODO
    let self = this;
    Addressbook.open(indexedDB)
      .then(function() {
        AddressbookUtil.newContact(self);
      })
      .then(self.loadInContacts)
      .then(function() {
        DatabaseConnection.getContactDetails(
          DatabaseConnection.lastContactId + 1,
          self
        );
      });
  },


  contactList: [],
  contactID: [],
  lastSearchItem: "",
  contactDBLength: 0,

  searchDB: function(event) {

    // ---- detailSearch ---------
    function detailSearch(contactDB, searchItem, tagItem) {
      var contactList = [];
      var contactID = [];

      tagItem = tagItem != '' ? tagItem : "";

      console.log(" searchDB2   contactDB.length:", contactDB.length);
      var time0 = new Date();

      for (var i=0; i < contactDB.length; i++) {
        if ((contactDB[i].name.toLowerCase().indexOf(searchItem.toLowerCase()) !== -1) ||
          (contactDB[i].email.toLowerCase().indexOf(searchItem.toLowerCase()) !== -1)) {
            if (tagItem != "") {
              if (contactDB[i].categories.indexOf(tagItem) > -1) {
                contactList.push(contactDB[i]);
                contactID.push(contactDB[i].id);
              }
            } else {
              contactList.push(contactDB[i]);
              contactID.push(contactDB[i].id);
            }
        }
      }
      this.contactList = contactList;
      this.contactID = contactID;

      var time1 = new Date();
      console.log(" searchDB3   searchItem:", searchItem, contactList.length, time1 -time0);
      this.lastSearchLength = searchItem.length;

      self.setState({
        contactDB: contactList, //  contains contacts as stored in indexedDB
        contactID: contactID, //  'id's of contacts selected by search and tags
        abStatus: ('Contacts ' + contactID.length + ' of ' + this.contactDBLength)
      });
    } // ---- detailSearch ---------


    let self = this;
    var searchItem= event.target.value;
    var time0 = new Date();

    if ((searchItem.length == 1) || (searchItem.length < self.lastSearchLength)) {
      self.lastSearchLength = 1;
      Addressbook.open(indexedDB).then(function(addrbook) {
        addrbook.getAllNameIdAndPhoto().then(function(contactDB) {
          var time1 = new Date();

          var totalContacts = contactDB.length -1;
          this.contactDBLength = contactDB.length;

          DatabaseConnection.lastContactId = contactDB[totalContacts].id;
          DatabaseConnection.lastContactUID = contactDB[totalContacts].uid;

          contactDB = contactDB.slice().sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase());

          var time2 = new Date();
          console.log(" searchDB   searchItem:", searchItem, contactDB.length, time1 -time0, time2 - time1);

          detailSearch(contactDB, searchItem, self.state.tagItem);
          return contactDB;
        });
      });

    } else {
      // search in contactList
      self.lastSearchLength = searchItem.length;
      detailSearch(contactList, searchItem, self.state.tagItem);
    }
  },

  clearSearchDB: function() {
    let self = this;
    document.getElementById('searchDB').value = ""; //XXXX direct access ?? OK?

    var scroll2def = this.state.contactListScroll;
    scroll2def.height = '10px';
    scroll2def.marginTop = '0px';

    this.lastSearchItem = "";

    self.setState({
      searchItem: "",
      listPos: 0,
      contactListScroll: scroll2def
    });
    Addressbook.open(indexedDB)
      .then(self.loadInContacts);
  },


  searchNames: function(event) {
    let self = this;

    self.setState({ searchItem: event.target.value });
    Addressbook.open(indexedDB)
      .then(self.loadInContacts);
  },


  clearSearchNames: function(event) {
    let self = this;
    document.getElementById('searchNames').value = ""; //XXXX direct access ?? OK?

    var scroll2def = this.state.contactListScroll;
    scroll2def.height = '10px';
    scroll2def.marginTop = '0px';

    self.setState({
      searchItem: "",
      listPos: 0,
      contactListScroll: scroll2def
    });
    Addressbook.open(indexedDB)
      .then(self.loadInContacts);
  },


  searchTags: function(event) {
    let self = this;

    let sTag = event.target.value === "%none%" ? "" : event.target.value;
    self.setState({ tagItem: sTag });

    this.clearSearchDB();

  //  Addressbook.open(indexedDB)
  //    .then(self.loadInContacts);
  },


  import: function(file) {
    let self = this;
    Addressbook.open(indexedDB)
      .then(function() {
        AddressbookUtil.importContacts(self);
      })
      .then(self.loadInContacts);
  },

  export: function() {
    let self = this;
    DatabaseConnection.export(this.state.selectedIds, self);
  },



  tag_Support: function() {
    // tbd     Called from Hambg --> this will maintain the Tag List            //TODO
    console.log("tag_Support ... tbd ... ");

    this.setState({
      tagSupportStatus: 'display: none'
    });
  },

  editContact: function() {
    this.setState({ editing: true });
  },


  closeContacts: function() {
    DatabaseConnection.closeContact(this);
  },

  addContactDetail: function(index) {
    ContactParser.addContactDetail(this, index);
  },

  removeContactDetail: function(index, fieldID) {
    ContactParser.removeContactDetail(this, index, fieldID);
  },

  makeFirst: function(index, fieldID) {
    ContactParser.makeFirst(this, index, fieldID);
  },

  // this reads the UI for the contacts PersonalSection and contactSection
  // to update the db
  editSave: function() {
    DatabaseConnection.updateContact(this);
  },

  editCancel: function() {
    ContactParser.cancelContactEdit(this);
  },

  updateContent: function(newText, index, fieldID) {
    ContactParser.updateContent(this, index, fieldID, newText);
  },

  updatePersonalDetail: function(detail, newText) {
    ContactParser.updatePersonalDetail(this, detail, newText);
  },

  updateOption: function(option, index, fieldID) {
    ContactParser.updateOption(this, option, index, fieldID);
  },

  updateProfileImage: function(image) {
    ContactParser.updateProfileImage(this, image);
  },

  click4Contact: function(event, contact) {
    if ((event.target.id !== "contactList_Scoll") &&
      (event.target.className.search("contactList") == -1)) return;

    var listLen, listPos, listId;
    listLen = this.state.contactID.length;

    if (event.target.className.search("clBegin") !== -1) {
      listPos = 0;
    } else if (event.target.className.search("clEnd") !== -1) {
      listPos = listLen -1;
    } else {
      //---------------------------------------------------
      //  custom sidebar experimental
      //---------------------------------------------------
      var evClY = event.clientY;

      var clTop = document.getElementsByClassName('clScroll')[0].offsetTop;
      var evPos = (evClY - clTop);

      var clScroll = document.getElementsByClassName('clScroll')[0].clientHeight;
      var clFlex =document.getElementsByClassName('clFlex')[0].clientHeight;
      var clHeight = clScroll + clFlex;

      listPos = parseInt(listLen/clHeight * evPos, 10);
    }
    listId = this.state.contactID[listPos];

    //XXX
    //var contact = ContactParser.searchContact(this.state.contactDB, 'id', listId);
    //console.log(" click4Contact ", " evClY:", evClY, " clTop:", clTop);
    //console.log(" click4Contact ", "clHeight:", clHeight, " evPos:", evPos);
    //console.log(" click4Contact ", "listLen:", listLen, " listPos:", listPos, " listId: " + listId, "\n", contact);
    //---------------------------------------------------

    DatabaseConnection.getContactDetails(listId, this, listPos);
  },

  viewContact: function(event, contact) {

    var self = this;
    let log, selectedIds, index, listId, listIdLast;

    // don't change 'contact' if editing is active
    if (this.state.editing === true) {
      return;
    }

    listId = contact.id;
    selectedIds = self.state.selectedIds;

    // *** debugging use ***
    //   On sidebar select the contact,
    //   with  [Shift] [Alt] cursor click show the raw vCard data
    if (event.altKey && event.shiftKey && selectedIds.length === 1) {
      var listPos = self.state.contactID[listId];
      this.showContactRaw(listPos);
    } else

    // mark contacts on sidebar for further action(s)
    if ((event.ctrlKey || event.metaKey) && selectedIds.length > 0) {
      index = selectedIds.indexOf(listId);

      if (index === -1) {
        // selects contact
        selectedIds.push(listId);
        listIdLast = listId;
      } else {
        // deselects contact
        selectedIds.splice(index, 1);
      }

      log = ("Contacts selected len: " + selectedIds.length + "\n : " +
        selectedIds.toString()).trunc(42) + ' ' + listId;

      this.setState({
        selectedIds: selectedIds,
        listIdLast: listId,
        abStatus: (log)
      });
    } else

    // build selectedIds from first to last selected contact using shift cursor select
    if (event.shiftKey) {
      var nextId;
      var first = self.state.contactID.indexOf(self.state.listIdLast);
      var last = self.state.contactID.indexOf(listId);

      if (first > last) {
        var x = first;
        first = last;
        last = x;
      }
      for (var i= first; i < last + 1; i++) {
        var nextId = self.state.contactID[i];
        if (selectedIds.indexOf(nextId) == -1)
          selectedIds.push(nextId);
      }

      log = "Contacts: " + selectedIds.length + selectedIds.toString();

      this.setState({
        selectedIds: selectedIds,
        listId: listId,
        listIdLast: listId,
        abStatus: (log)
      });

    } else {
      // open the selected contact to display/edit/etc it's details
      log = "Contact selected  listId: " + listId;
      //console.log(log); //XXXX

      DatabaseConnection.getContactDetails(listId, this);
    }
  },

  showContactRaw: function(listPos) {
    let log =
      "  Display vCard source :  " +
      this.state.contact.name +
      "  (listPos:" +
      listPos +
      ")\n" +
      JSON.stringify(this.state.contact).replace(/\],\[/g, "\n");
    alert(log); //          change to normal dialog not 'alert'               //TODO
    console.log(log);
  },


  editingDisplay: function() {
    if (!this.state.editing) {
      return (
        <div id="main-buttons" className="verticalButtons">
          <button className="buttons" onClick={this.closeContacts}>
            Close
          </button>

          <div className="flexAuto"/>

          <button className="buttons" onClick={this.editContact}>
            Edit
          </button>

          <div className="flexAuto"/>

          <button
            className="buttons"
            onClick={this.goModals.bind(null, "deleteContact")}>
            Delete
          </button>
        </div>
      );
    } else {
      return (
        <div id="main-buttons" className="verticalButtons">
          <button className="buttons" onClick={this.editSave}>
            Save
          </button>

          <div className="flexAuto"/>

          <button className="buttons" onClick={this.editCancel}>
            Cancel
          </button>

          <div className="flexAuto"/>
        </div>
      );
    }
  },

  notesChanged: function(e) {
    let eValue = e.currentTarget.value;
    let notes = this.state.personalSections.note.content;
    this.setState({
      notes: eValue
    });
    this.notesContent = eValue;
  },

  notesContent: "",

  renderNotes: function() {
    this.notesContent = this.state.personalSections.note.content;
    return (
      <div className="contact-section">
        <div className="contact-group">
          {"Notes"}
        </div>
        <NotesSection
          editing={this.state.editing}
          notesContent={this.notesContent}
          notesChanged={this.notesChanged}
          personalDetails={this.state.personalSections}
        />
        <div></div>
      </div>
    );
  },

  addTag: function(event) {
    let contact, tDetails, allTags, uniTags;
    let newTag = event.target.value;
    if (newTag === "" || newTag === "%none%") {
      return;
    }

    tDetails = this.state.personalSections;
    contact = this.state.contact;

    if (tDetails.categories.property === null) {
      contact.jcards[0].addPropertyWithValue("categories", newTag);
      tDetails.categories.property = new ICAL.Property("categories");
      tDetails.categories.property.jCal[3] = [newTag];
    } else {
      allTags = tDetails.categories.property.jCal[3];
      if (typeof allTags === "string") {
        allTags = [allTags];
      }

      uniTags = allTags.filter(function(e) {
        return e !== newTag;
      });
      uniTags.push(newTag);
      tDetails.categories.property.jCal[3] = uniTags;
    }

    this.setState({
      personalSections: tDetails
    });
    document.getElementById("tagsSelection").options.selectedIndex = 0;
  },

  removeTag: function(thisTag) {
    let delTag = thisTag.target.previousElementSibling.textContent;

    let currentSection = this.state.personalSections;

    let allTags = currentSection.categories.property.jCal[3];
    if (typeof allTags === "string") {
      allTags = [allTags];
    }

    let uniTags = allTags.filter(function(e) {
      return e !== delTag;
    });

    currentSection.content = uniTags.join(",");
    currentSection.categories.property.jCal[3] = uniTags;

    this.setState({
      currentSection: currentSection
    });
  },

  renderContactTags: function() {

    let self = this;
    let removeButton, addButton, pCategories, jCategories;
    removeButton = "buttons nobutton";
    addButton = "buttons nobutton";

    if (this.state.editing) {
      removeButton = "buttons remove";
      addButton = "buttons add";
    }
    pCategories = this.state.personalSections.categories;

    // without 'categories' do noting
    if (!pCategories) {
      return;
    }
    if (!pCategories.property) {
      return;
    }

    //this.state.personalSections.categories.property.jCal[3]
    //Array [ "Business", "Golf" ]      needs to be Array! If not make Array

    jCategories = pCategories.property.jCal[3];

    if (typeof jCategories === "string") {
      jCategories = [jCategories];
    }

    let uCategories = AddressbookUtil.unique(jCategories);

    return (
      <div>
        {" "}{uCategories.map(function(nextCat) {
          return (
            <div key={nextCat}>
              <button className="tagItem">
                {nextCat}
              </button>
              <button className={removeButton} onClick={self.removeTag}>
                {" "}-{" "}
              </button>
            </div>
          );
        })}
      </div>
    );
  },


  goModals: function(type, mode) { // mode = true for 'open',   = false for 'close'
    let _Modals = this.state.goModals;
    _Modals[type] = mode || false;
    this.setState({ goModals: _Modals });
  },

  delete_Contact: function() {
    this.goModals("deleteContact", true);
  },

  deleteContact: function() {
    var self = this;
    self.goModals("deleteContact");
    DatabaseConnection.deleteContacts(self.state.selectedIds, this);
    self.setState({
      selectedIds: [], // unselects any selected contacts
    });
    self.loadInContacts();
  },


  delete_DB: function() {
    this.goModals("deleteDB", true);
  },

  deleteDB: function() {
    indexedDB.deleteDatabase("addrbook");

    document.getElementById("dbdelete").setAttribute("style", "display: none");
    document.getElementById("closeTag").setAttribute("style", "display: block");
  },

  renderGoModals: function() {
    if (this.state.goModals.deleteContact) {
      return (
        <ContactDelete
          selectedIds={this.state.selectedIds}
          noGo={this.goModals.bind(null, "deleteContact", false)}
          confirmed={this.deleteContact}
        />
      );
    }

    if (this.state.goModals.deleteDB) {
      return (
        <DBdelete
          noGo={this.goModals.bind(null, "deleteDB", false)}
          confirmed={this.deleteDB}
        />
      );
    }

  },


  openMailto() {
    var self = this;
    DatabaseConnection.mailtoAdr(self.state.selectedIds, self);
  },

  closeMailto() {
    this.setState({ modalIsOpen: false });
  },

  onRequestMailto(mode) {
    let allMailto = this.state.selectedMailto;

    var cTextarea = document.querySelector('.currentMailto');
    cTextarea.select();
    let edited = cTextarea.value;

    if ((mode == 'CC') || (mode == 'BCC')) {
      location.href = "mailto:?" + mode +"=" + edited;
    } else if (mode == 'C&P') {
      var successful = document.execCommand('copy');
    } else {
      location.href = "mailto:" + edited;
    }
    this.closeMailto();
  },


  renderMailto: function() {
    return (
      <MailTo
        isOpen={this.state.modalIsOpen}
        onRequestClose={this.closeMailto}
        onRequestMailto={this.onRequestMailto}
        selectedIds={this.state.selectedIds}
        selectedMailto={this.state.selectedMailto}
      />
    );
  },


  showHH: function() {
    document
      .getElementById("hambgMenu")
      .setAttribute("class", "hambgMenu show");
  },

  closeHH: function() {
    document
      .getElementById("hambgMenu")
      .setAttribute("class", "hambgMenu");
  },

  errorLink: function() {
    alert("vContact " + this.state.abError); //XXXX    change Alert dialog!
    this.setState({ errorStatus:displayNone} );
  },

  renderContactSection: function(contactSection) {
    if (this.state.editing) {
      return (
        //           edit mode
        <ContactSection
          editing={this.state.editing}
          type={contactSection.name}
          options={contactSection.options}
          index={contactSection.index}
          fields={this.state.contactSections[contactSection.index].fields}
          save={this.editSave}
          addContactDetail={this.addContactDetail}
          removeContactDetail={this.removeContactDetail}
          makeFirst={this.makeFirst}
          updateOption={this.updateOption}
          updateContent={this.updateContent}
          key={contactSection.key}
        />
      );
    } else {
      return (
        //         display mode
        <ContactSection
          editing={this.state.editing}
          type={contactSection.name}
          options={contactSection.options}
          index={contactSection.index}
          fields={contactSection.fields}
          save={this.editSave}
          key={contactSection.key}
        />
      );
    }
  },

  /*
   * Layout for NOT selected any contact
   */
  renderNoContact: function() {
    var self = this;

    return (
      <div id="ab-window" className="abWindow">
        <div id="ab-Container">
          {self.renderGoModals()}
          {self.renderMailto()}

          <HHmenu
            closeHH={self.closeHH}
            addContact={self.addContact}
            tag_Support={self.tag_Support}
            import={self.import}
            export={self.export}
            delete_Contact={self.delete_Contact}
            delete_DB={self.delete_DB}
            abRev={self.state.abRev}
            openMailto={self.openMailto}
          />


        <div id="ab-sidebar" className="abSidebar">
            <AB_header
              hamburger={self.hamburger}
              showHH={self.showHH}
              exportContact={self.export}
              abStatus={(self.state.abStatus).trunc(42)}
              abError={(self.state.abError)}
              errorLink={self.errorLink}
              errorStatus={(self.state.errorStatus)}
            />

            <ContactSidebar
              contactHeader={self.state.headerList}
              contactList={self.state.contactList}
              contactDB={self.state.contactDB}
              contactID={self.state.contactID}
              listPos={self.state.listPos}
              abUI={self}
              abStatus={self.state.abStatus}
              selectedIds={self.state.selectedIds}
              contactListScroll={self.state.contactListScroll}

              viewContact={self.viewContact}
              click4Contact={self.click4Contact}
              image={self.state.photoUrl}
              add={self.addContact}

              searchDB={self.searchDB}
              clearSearchDB={self.clearSearchDB}

              searchTags={self.searchTags}
              tagCollection={CategoryCollection}
            />
          </div>

          <div id="ab-main" className="abMain">
            <div className="abMainNoContact">
              <img src="images/xContact.png" className="mainImg" />
              <button
                className="buttons centerBlock"
                onClick={self.addContact}
              >
                {"+"}
              </button>
              <div className="centerText">Add a new Contact</div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderTagSelector: function() {
    return (
      <option key="tagsSelection0" defaultValue={"%none%"}>
        {"Add Tag"}
      </option>
    );
  },

  renderTags: function(tag) {
    return (
      <option defaultValue={tag} key={tag}>
        {tag}
      </option>
    );
  },

  /*
   * Layout for a SELECTED contact
   */
  renderContactDisplay: function() {
    let self = this;
    let tags, tagsStatus, removeButton, addButton;

    let displayFlex = { display: "flex" };
    let displayNone = { display: "none" };

    tags = CategoryCollection;
    tagsStatus = displayNone;

    removeButton = "buttons nobutton";
    addButton = "buttons nobutton";

    if (self.state.editing) {
      removeButton = "buttons remove";
      addButton = "buttons add";
      tagsStatus = displayFlex;
    }

    return (
      <div id="ab-Container">
        <div id="ab-window" className="abWindow">
          {self.renderGoModals()}
          {self.renderMailto()}

          <HHmenu
            closeHH={self.closeHH}
            addContact={self.addContact}
            tag_Support={self.tag_Support}
            import={self.import}
            export={self.export}
            showContactRaw={self.showContactRaw}
            delete_Contact={self.delete_Contact}
            delete_DB={self.delete_DB}
            abRev={this.state.abRev}
            openMailto={self.openMailto}
          />


        <div id="ab-sidebar" className="abSidebar">
            <AB_header
              hamburger={self.hamburger}
              showHH={self.showHH}
              abStatus={(this.state.abStatus).trunc(42)}
              abError={(this.state.abError)}
              errorLink={this.errorLink}
              errorStatus={(self.state.errorStatus)}
            />

            <ContactSidebar
              abUI={self}
              contactHeader={self.state.headerList}
              contactList={self.state.contactList}
              contactDB={self.state.contactDB}
              contactID={self.state.contactID}
              listPos={self.state.listPos}
              abStatus={self.state.abStatus}
              contactListScroll={self.state.contactListScroll}

              viewContact={self.viewContact}
              click4Contact={self.click4Contact}
              selectedIds={self.state.selectedIds}
              image={self.state.photoUrl}

              searchDB={self.searchDB}
              clearSearchDB={self.clearSearchDB}

              searchTags={self.searchTags}
              tagCollection={CategoryCollection}
            />
          </div>

          <div id="ab-main" className="abMain">
            <div id="ab-main-header" className="abMainHeader">
              <ContactHeader
                personalDetails={self.state.personalSections}
                onUserInput={self.updatePersonalDetail}
                onNewImage={self.updateProfileImage}
                editing={self.state.editing}
                image={self.state.photoUrl}
              />

              <div className="flexAuto"/>

              <div id="ab-main-tagSection" className="abMainTagSection">
                <div id="ab-main-tagEdit">
                  <img
                    className="glyphicons"
                    src="images/glyphicons_065_tag.png"
                  />
                <description className="textTags"> Tags </description>
                </div>

                <div style={tagsStatus}>
                  <select
                    id="tagsSelection"
                    onChange={self.addTag}
                    className="searchTagsSelect"
                  >
                    {self.renderTagSelector()}
                    {tags.map(self.renderTags)}
                  </select>
                </div>

                <div id="ab-main-tags" className="abMainTags">
                  {self.renderContactTags()}
                </div>
              </div>

              {self.editingDisplay()}
            </div>

            <div id="ab-main-sections" className="abMainSections">

              {self.state.contactSections.map(self.renderContactSection)}
              {self.renderNotes()}

            </div>
          </div>
        </div>
      </div>
    );
  },


  render: function() {
    let self = this;

    if (self.state.selectedIds.length === 0) {
      // console.log("NO CONTACT VIEW");
      return self.renderNoContact();
    } else {
      // console.log("CONTACT VIEW");
      return self.renderContactDisplay();
    }
  },

});

ReactDOM.render(
  <AddressBook
    contactSections={ContactSections}
    personalSections={PersonalSections}
    tagCollection={CategoryCollection}
  />,
  document.getElementById("addressBook")
);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Fields options
var Email = {name: "Email", options: ["Work", "Home"], key: "email"};
var Phone = {name: "Phone", options: ["Mobile", "Home", "Work", "Fax", "Pager"], key: "tel"};
var Address = {name: "Address", options: ["Home", "Work"], key: "adr"};
var Webpage = {name: "Webpage", options: ["Home", "Work"], key: "url"};
var Chat = {name: "Chat", options: ["Google Talk", "AIM (R)", "Yahoo", "Skype", "QQ", "MSN", "ICQ", "Jabber ID", "IRC Nick"], key: "chat"};

// The address fields available  (as with RFC)
var AddressFields = ["PostBox", "ExtendedAdr", "Street", "City", "Region", "PostalCode", "Country"];

var ContactSections = [Email, Phone, Address, Webpage, Chat];
var PersonalDetails = ["name", "nickname", "n", "bday", "anniversary", "gender", "rev", "note", "categories"];

var CategoryCollection = [];

var abStatus = "Welcome to vContacts";
var abTotalContacts=0;
var abSelectedContacts=0;

   function setABStatus(detail){
console.log("  setABStatus >>" + detail + "<<")
console.trace()

     if (detail){
       abStatus = detail
     } else {
       abStatus= "  **** Contacts Total: " + abTotalContacts + " Selected: " + abSelectedContacts;
     }
   };


// --- experimental Styling with react iStyles and cStyles---
//var cStyles = { "editButton": "buttons remove nobutton" };

var iStyles = iStyles || {}

    iStyles.abWindow={'height':'100vh', 'overflowY': 'hidden'}

    iStyles.abMenu={'overflow':'hidden', 'float':'left',
        'backgroundColor': 'rgb(231, 240, 234)',
        'height': '32px', 'width': '100vw'};

    iStyles.abSidebar={'overflow':'hidden', 'float':'left',
      'backgroundColor': 'rgb(243, 244, 244)',
      'height': '100vh', 'width': '30vw'};

    iStyles.abMain={ 'display': 'flex', 'flexDirection': 'column',
       'backgroundColor': 'rgba(246, 246, 226, 0.55)', 'paddingRight': '1vw',
       'height': '100vh'};

    iStyles.abMainNoContact = {'marginTop': '150px'};

    iStyles.abMainHeader={'display':'flex',
      'backgroundColor': 'rgba(196, 221, 196, 0.8)', 'marginLeft': '15px',};

    iStyles.abMainSections={'overflowX': 'hidden', 'overflowY': 'auto', 'display': 'block',
      'backgroundColor': 'rgba(246, 246, 226, 0.55)', 'marginLeft': '15px',
      'borderTop': '1px solid #A5A8A4'};

    iStyles.displayNone={'display': 'none'};

    iStyles.flex={'display': 'flex'};
    iStyles.flexx={'flex': '1'};

    iStyles.verticalButtons={'display': 'flex', 'flexDirection': 'column',
       'margin': '10px',
       'justifyContent': 'space-around'};


    iStyles.abMainTagSection={'display':'flex', 'width': '110px'};

    iStyles.abMainTags={'overflow':'auto', 'marginTop': '15px', 'height': '130px'};

    iStyles.textTags={'fontSize': '0.8em', 'fontStyle': 'italic'};
    iStyles.textNotes={'fontSize': '0.8em'};

    iStyles.centerBlock = {'display':'block',
       'margin':'auto'};
    iStyles.centerText = {'textAlign': 'center'};

    iStyles.tag = {'overflow':'hidden',
       'color':'black','backgroundColor':'RGBA(180, 189, 183, 0.9)',
       'borderRadius':'4px','border':'1px solid #9da49e',
       'height':'1.8em', 'width':'80px', 
       'textAlign':'center', 'textOverflow':'ellipsis','whiteSpace':'nowrap'}

    iStyles.mainImg= {'display': 'block',
       'borderRadius': '50%', 'height': '140px', 'width': '140px','margin': 'auto',
       'marginBottom': '15px'}


    iStyles.hhStyle={'marginLeft':'20px', 'marginTop':'20px'}

    iStyles.hhHeader={'fontSize':'0.9em','fontWeight':'bold'};
// --- experimental Styling with react iStyles and cStyles---


var AddressBook = React.createClass({
  getInitialState: function() {
    var contactSections = ContactParser.createEmptyContactSections(this.props.contactSections);
    var tempContactSections = ContactParser.createEmptyContactSections(this.props.contactSections);
    var personalSection = ContactParser.createEmptyPersonalSection(this.props.personalDetails);
    var tempPersonalSection = ContactParser.createEmptyPersonalSection(this.props.personalDetails);

    return {
      contactsList: [],
      selectedIds: [],
      contact: null,
      name: null,
      tempContact: null,
      editing: false,
      photoUrl: "images/xContact.png",
      contactSections: contactSections,
      tempContactSections: tempContactSections,
      personalSection: personalSection,
      tempPersonalSection: tempPersonalSection,

      searchItem: '',
      tagItem: '',

      abStatus: abStatus,
      totalContacts: abTotalContacts,
      selectedContacts: abSelectedContacts,

      hhStyle:false,

      modals: {deleteContact: false, deleteDB: false}
    }
  },


  componentDidMount: function() {
    this.loadInContacts();
  },

  componentWillMount: function() {
    ReactModal.setAppElement('body');
  },

  loadInContacts: function() {
    DatabaseConnection.loadInContacts(this);
  },

  abSetStatus: function() {
  //  console.log("   ... abSetStatus " + this.state.abStatus)
    setABStatus(this.state.abStatus);
  },

  deleteDB: function() {
    this.closeModal('deleteDB');

      indexedDB.deleteDatabase("addrbook")
      alert("*** NOTE : Database was deleted. Close and reopen vContact.");
      this.setStatus.abStatus = "Database was deleted! Close and reopen vContact.";
      Addressbook.open(indexedDB).then(self.loadInContacts)
  },


  addContact: function() {  //gWTODO Should directly open the imported contact
    var self = this;
    var nUid =  Addressbook.open(indexedDB).then(AddressbookUtil.newContact).then(self.loadInContacts)
      // needs id of the new contact
      // .then(this.renderContactDisplay())

  },

  searchNames: function(event) {
  //  console.log (" ... nameSearch: ", event.target.value);     //gWLog
    this.setState({searchItem: event.target.value});
    var self = this;
    Addressbook.open(indexedDB).then(self.loadInContacts).then(self.abSetStatus)
  },

  clearSearchNames: function(event) {
  //  console.log (" ... nameClear: ", event.target.value);     //gWLog
    this.setState({searchItem: ""});
    var self = this;
    Addressbook.open(indexedDB).then(self.loadInContacts);
  },

  searchTags: function(event) {
  //  console.log (" ... tagSearch: ", event.target.value);     //gWLog
    var sTag = (event.target.value == '%none%') ? '' :event.target.value;
    this.setState({tagItem: sTag});
    var self = this;
    Addressbook.open(indexedDB).then(self.loadInContacts);
  },

  import: function(file) {
    var self = this;
    Addressbook.open(indexedDB).then(AddressbookUtil.importContacts).then(self.loadInContacts);
  },

  export: function() {
    DatabaseConnection.export(this.state.selectedIds);
  },

  edit: function() {
    this.setState({editing: true});
  },

  deleteContact: function() {
    this.closeModal('deleteContact');
  // console.log("Delete Contact >>",this.state.contact.name, "<<");     //gWLog
    DatabaseConnection.deleteContact(this.state.selectedIds[0], this);
  },

  closeContacts: function() {
    DatabaseConnection.closeContact(this);
  },

  addField: function(index) {
    ContactParser.addContactDetail(this.state.tempContact, index, this.state.tempContactSections, this);
  },

  removeField: function(index, fieldID) {
    ContactParser.removeContactDetail(this.state.tempContact, index, this.state.tempContactSections, fieldID, this)
  },

  save: function() {
    DatabaseConnection.updateContact(this.state.tempContact, this);
  },

  cancel: function() {
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


  setContactID: function(event, id, name) {
    // don't change 'contact' if editing is active
    if (this.state.editing == true) {
      return;
    }
    var selected = this.state.selectedIds;

    // debugging use Shift Cntrl to alert/print the raw vCard 
    if (event.altKey && event.shiftKey && selected.length == 1) {
      var log = ("  Display vCard source :  " + name + "  id:" + id + "\n" 
         + (JSON.stringify(this.state.contact)).replace(/\],\[/g, '\n'));
      alert (log)           //TODO  change to normal dialog not 'alert'
      console.log(log);     //gWLog

    } else {
    if ((event.ctrlKey || event.metaKey) && selected.length > 0) {
      var index = selected.indexOf(id);
      if (index == -1) { // selects contact
        selected.push(id);
      } else { // deselects contact
        selected.splice(index, 1);
      }
      this.setState({
        selectedIds: selected
      });
    } else {
      DatabaseConnection.getContactDetails(id, this);
      this.setState({
        selectedIds: [id],
        name: name
      })
    }
    }
  },


  editingDisplay: function() {
    if (!this.state.editing) {
      return (<div id="main-buttons" style={iStyles.verticalButtons}>
        <button className="buttons" onClick={this.closeContacts}>Close</button>
        <div style={iStyles.flexx}></div>

        <button className="buttons" onClick={this.edit}>Edit</button>
        <div style={iStyles.flexx}></div>

        <button className="buttons" onClick={this.openModal.bind(null, 'deleteContact')}>Delete</button>
      </div>);
    } else {
      return (<div id="main-buttons" style={iStyles.verticalButtons}>
        <button className="buttons" onClick={this.save}>Save</button>
        <div style={iStyles.flexx}></div>

        <button className="buttons" onClick={this.cancel}>Cancel</button>
        <div style={iStyles.flexx}></div>

      </div>);
    }
  },


  openModal: function(type) {
    var modals = this.state.modals;
    modals[type] = true;
    this.setState({modals: modals});
  },

  closeModal: function(type) {
    var modals = this.state.modals;
    modals[type] = false;
    this.setState({modals: modals});
  },

  renderModals: function() {
    if(this.state.modals.deleteContact) {
      return <DeleteModal name={this.state.name} noDelete={this.closeModal.bind(null, 'deleteContact')} 
        confirmDelete={this.deleteContact} />;
    }

    if(this.state.modals.deleteDB) {
      return <WorkModal noDelete={this.closeModal.bind(null, 'deleteDB')} 
        confirmDelete={this.deleteDB} />;
    }
  },


  showHH: function() {
  //  console.log("Hamburger   Show");
    document.getElementById('hambgMenu').setAttribute("class","hambgMenu show");
  },

  closeHH: function() {
  //  console.log("Hamburger   Close");
    document.getElementById('hambgMenu').setAttribute("class","hambgMenu");
  },


  openUrl: function(url) {
     AddressbookUtil.openLink(url);
  },

  renderHH: function() {
    return (
    <div id="hambgMenu" className="hambgMenu" onClick={this.closeHH}>
      <div style={iStyles.hhStyle}>
        <p style={iStyles.hhHeader}>{'vContacts Main Menu'}</p>
        <p className="hambgLink" onClick={this.addContact}>Add new Contact</p>
        <hr/>
        <p className="hambgLink" onClick={this.import}>{'Import Contacts from File (VCF/LDIF)'}</p>
        <p className="hambgLink" onClick={this.export}>{'Export Contacts to File (VCF)'}</p>
        <hr/>
        <p className="hambgLink" onClick={this.openModal.bind(null, 'deleteContact')}>{'Delete selected Contact(s)'}</p>
        <p className="hambgLink" onClick={this.openModal.bind(null, 'deleteDB')}>{'Reset Database (Remove all Contacts)'}</p>
        <hr/>
        <p className="hambgLink" onClick={()=>this.openUrl('https://neandr.github.io/vContacts/notes.txt')}>{'Notes/Status'}</p>
        <p className="hambgLink" onClick={()=>this.openUrl('https://neandr.github.io/vContacts/References.html')}>{'References'}</p>
        <hr/>
        <p className="hambgLink" onClick={()=>this.openUrl('https://github.com/neandr/vContacts/blob/master/README.md')}>{'Readme on Git'}</p>
        <p className="hambgLink" onClick={()=>this.openUrl('https://github.com/neandr/vContacts/blob/master/STATUS.md')}>{'Refactor the VUW project - Status as of Nov.29 2016'}</p>

      </div>
    </div>);
  },


  renderNotes: function() {
    return (
    <div className="contact-section">
      <div className="contact-group">{'Notes'}</div>
      <NotesSection fieldContent={this.state}/>
    </div>);
  },


  renderContactTags: function(contactSection) {

    var removeButton = addButton= "buttons nobutton"
    if (this.state.editing) {
      removeButton = "buttons remove"
      addButton = "buttons add"
    }
    var editing=this.state.editing;

    // without 'categories' do noting
    if (!this.state.personalSection.categories.property) {
      return;
    }

    var catDiv = [];
    for (var i =3; i < this.state.personalSection.categories.property.jCal.length; i++){
      catDiv.push (this.state.personalSection.categories.property.jCal[i])
    }
    var nCat=0;
    return(
      <div> {catDiv.map(function(nextCat) {
        nCat++;
        return (
        <div>
          <button style={iStyles.tag} >{nextCat}</button>
          <button className={removeButton} > - </button>
        </div>
        )}
      )}
      </div>
    )
  },


  renderContactSection: function(contactSection) {
    if (this.state.editing) {
      return(      // edit mode
      <ContactSection
        editing={this.state.editing}

        type={contactSection.name}
        options={contactSection.options}
        index={contactSection.index}
        fields={this.state.tempContactSections[contactSection.index].fields}
        save={this.save}
        add={this.addField}
        remove={this.removeField}
        updateOption={this.updateOption}
        updateContent={this.updateContent}
        key={"contact"+contactSection.index}
      />);
    } else {
      return(      // display mode
      <ContactSection
        editing={this.state.editing}

        type={contactSection.name}
        options={contactSection.options}
        index={contactSection.index}
        fields={contactSection.fields}
        save={this.save}
      />);
    }
  },

  /*
   * Layout for NOT selected any contact 
   */
  renderNoContact: function() {
    return (
    <div id="ab-window" style={iStyles.abWindow}>
      <div id="ab-Container" >

        {this.renderModals()}
        {this.renderHH()}

        <div id="ab-Menu" style={iStyles.abMenu}>
          <AB_header 
            stateModal={this.openModal} 
            hamburger={this.hamburger}
            show_HH={this.showHH}

            import={this.import}
            export={this.export}
            add={this.addContact}

            abStatus={abStatus}
            totalContacts={abTotalContacts}
            selectedContacts={abSelectedContacts}
          /> 
        </div>

        <div id="ab-sidebar"  style={iStyles.abSidebar}>
          <ContactSidebar
            contactHeader={this.state.headerList}
            contactNames={this.state.contactsList}
            viewContact={this.setContactID}
            image={this.state.photoUrl}
            add={this.addContact}
            searchNames={this.searchNames}
            clearNames={this.clearSearchNames}
            searchTags={this.searchTags}

            tagCollection={CategoryCollection}
          />
        </div>


        <div id="ab-main" style={iStyles.abMain}>
          <div style={iStyles.abMainNoContact}>
            <img src="images/xContact.png"  style={iStyles.mainImg}/>
            <button style={iStyles.centerBlock} className="buttons" onClick={this.addContact} >{'+'}</button>
            <div style={iStyles.centerText}>Add a new Contact</div>
          </div>
        </div>
      </div>
    </div>);
  },


  /*
   * Layout for SELECTED a contact 
   */
  renderContactDisplay: function() {

    var removeButton = addButton= "buttons nobutton"

    if (this.state.editing) {
      removeButton = "buttons remove"
      addButton = "buttons add"
    }

  return (
    <div id="ab-Container" >
      <div id="ab-window" style={iStyles.abWindow}>

        {this.renderModals()}
        {this.renderHH()}

        <div id="ab-Menu" style={iStyles.abMenu}>
          <AB_header 
            stateModal={this.openModal} 
            hamburger={this.hamburger} 
            show_HH={this.showHH}

            import={this.import}
            export={this.export}
            add={this.addContact}

            abStatus={abStatus}
            totalContacts={abTotalContacts}
            selectedContacts={abSelectedContacts}
          />
        </div>

        <div id="ab-sidebar" style={iStyles.abSidebar}>
          <ContactSidebar
            contactHeader={this.state.headerList}
            contactNames={this.state.contactsList}
            viewContact={this.setContactID}
            selected={this.state.selectedIds}
            image={this.state.photoUrl}

            searchNames={this.searchNames}
            clearNames={this.clearSearchNames}
            searchTags={this.searchTags}

            tagCollection={CategoryCollection}
          />
        </div>

        <div id="ab-main" style={iStyles.abMain}>
          <div id="ab-main-header" style={iStyles.abMainHeader}>
            <ContactHeader
              personalDetails={this.state.personalSection}
              onUserInput={this.updatePersonalDetail}
              onNewImage={this.updateProfileImage}
              editing={this.state.editing}
              image={this.state.photoUrl}
            />

            <div style={iStyles.flexx}></div>

            <div id="ab-main-tagSection" style={iStyles.abMainTagSection}>
              <div id="ab-main-tags" style={iStyles.abMainTags} >

                <div id="ab-main-tagEdit" >
                  <img className="glyphicons" src="images/glyphicons_065_tag.png"/>
                  <description style={iStyles.textTags}> Tags </description>
                  <button className={addButton} > + </button>
                </div>

                {this.renderContactTags()}
             </div>
          </div>

          {this.editingDisplay()}
        </div>

        <div id="ab-main-sections" style={iStyles.abMainSections}>
          {this.state.contactSections.map(this.renderContactSection)}
          {this.renderNotes()}
        </div>
      </div>
    </div>
  </div>);
  },

  render: function() {

    if (this.state.selectedIds.length == 0) {
    // console.log("NO CONTACT VIEW"); 
    // console.trace();
      return this.renderNoContact();
    } else {
    // console.log("CONTACT VIEW");
    // console.trace();
      return this.renderContactDisplay();
    }
  }

});

ReactDOM.render(
  <AddressBook 
    contactSections = {ContactSections} 
    personalDetails = {PersonalDetails}
  />, 
  document.getElementById('addressBook')
);

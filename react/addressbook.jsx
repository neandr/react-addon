/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Fields options
var Email = {name: "Email", options: ["Work", "Home"], key: "email"};
var Phone = {name: "Phone", options: ["Mobile", "Home", "Work", "Fax", "Pager"], key: "tel"};
var Address = {name: "Address", options: ["Home", "Work"], key: "adr"};
var Webpage = {name: "Webpage", options: ["Home", "Work"], key: "url"};
var Chat = {name: "Chat", options: ["Google Talk", "AIM (R)", "Yahoo", "Skype", "QQ", "MSN", "ICQ", "Jabber ID", "IRC Nick"], key: ""};
var Note = {name: "Note", options: ["Home", "Work"], key: "note"};


var ContactSections = [Email, Phone, Address, Webpage, Chat, Note];
var PersonalDetails = ["name", "nickname", "n", "bday", "anniversary", "gender", "rev"];

var inLinestyles = inLinestyles || {}

    inLinestyles.abSidebar={'background-color': 'rgb(243, 244, 244)',
        'height': '100vh', 'width': '30vw', 'overflow':'hidden', 'float':'left'};

    inLinestyles.abMain={'background-color': 'rgba(246, 246, 226, 0.55)', 'padding-right': '1vw',
        'height': '100vh', 'display': 'flex', 'flex-direction': 'column'};

    inLinestyles.abMainHeader={'background-color': 'rgba(196, 221, 196, 0.8)', 'margin-left': '15px',
         'display':'flex'};

    inLinestyles.abMainSections={'background-color': 'rgba(246, 246, 226, 0.55)', 'margin-left': '15px',
        'overflow-x': 'hidden', 'overflow-y': 'auto', 'display': 'block',
        'border-top': '1px solid #A5A8A4'};

    inLinestyles.abMainTags={'margin-top': '15px', 'width': '100px',
         'height': '130px', 'overflow':'auto'};

    inLinestyles.flexx={'flex': '1'}

    inLinestyles.verticalButtons={'display': 'flex', 'flex-direction': 'column',
         'margin': '10px', 'margin-left':'30px',
         'justify-content': 'space-around'}


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
      modals: {delete: false}
    }
  },
  createEmptyContactSections: function() {
    var contactSections = [];
    for (var i = 0; i < this.props.contactSections.length; i++) {
        contactSections.push({
          name: this.props.contactSections[i].name,
          options: this.props.contactSections[i].options,
          fields: [],
          index: i
        });
    }
    return contactSections;
  },
  createEmptyPersonalSection: function() {
    return {name: "", nickname: "", n: "", bday: "", anniversary: "", gender: "", rev: ""};
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
  addContact: function() {
    var self = this;
    Addressbook.open(indexedDB).then(AddressbookUtil.newContact).then(self.loadInContacts);   //.then(self.edit);  //XXXgW
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
    this.closeModal('delete');
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
    // don't change user if editing is active
    if (this.state.editing == true) {                    //XXXgW
      return;
    }
    var selected = this.state.selectedIds;
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
      });
    }
  },

  editingDisplay: function() {
    if (!this.state.editing) {
      return (<div id="main-buttons" style={inLinestyles.verticalButtons}>
        <button className="buttons" onClick={this.closeContacts}>Close</button>
        <div style={inLinestyles.flexx}></div>

        <button className="buttons" onClick={this.edit}>Edit</button>
        <div style={inLinestyles.flexx}></div>

        <button className="buttons" onClick={this.openModal.bind(null, 'delete')}>Delete</button>
      </div>);
    } else {
      return (<div id="main-buttons" style={inLinestyles.verticalButtons}>
        <button className="buttons" onClick={this.save}>Save</button>
        <div style={inLinestyles.flexx}></div>

        <button className="buttons" onClick={this.cancel}>Cancel</button>
        <div style={inLinestyles.flexx}></div>

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
    if(this.state.modals.delete) {
      return <DeleteModal name={this.state.name} noDelete={this.closeModal.bind(null, 'delete')} 
         confirmDelete={this.deleteContact} />;
    }
  },


  renderContactSection: function(contactSection) {
    if (this.state.editing) {
      // edit mode
      return(<ContactSection type={contactSection.name} options={contactSection.options} 
         editing={this.state.editing} 
         index={contactSection.index} 
         fields={this.state.tempContactSections[contactSection.index].fields}
         save={this.save} add={this.addField} 
         remove={this.removeField} 
         updateOption={this.updateOption} 
         updateContent={this.updateContent}/>);
    } else {  
      // display mode
      return(<ContactSection type={contactSection.name} options={contactSection.options} 
         editing={this.state.editing} 
         index={contactSection.index} 
         fields={contactSection.fields}
         save={this.save}/>);
    }
  },


  renderNoContact: function() {
    return (<div id="ab-sidebar"  style={inLinestyles.abSidebar}>
      <ContactSidebar contactNames={this.state.contactsList} viewContact={this.setContactID} 
        image={this.state.photoUrl}
        add={this.addContact} import={this.import} export={this.export}/>
    </div>);
  },
  renderContactDisplay: function() {
    let editStatus = {'display':'none'};
    if (this.state.editing) {
        editStatus = {'display':'flex'};
    }
    return (<div id="ab-Container" >
      <div id="ab-sidebar" style={inLinestyles.abSidebar}>
        <ContactSidebar contactNames={this.state.contactsList} viewContact={this.setContactID} 
          selected={this.state.selectedIds} 
          image={this.state.photoUrl} 
          add={this.addContact} import={this.import} export={this.export}/>
      </div>

      <div id="ab-main" style={inLinestyles.abMain}>
        <div id="ab-main-header" style={inLinestyles.abMainHeader}>
          <Header personalDetails={this.state.personalSection} 
              onUserInput={this.updatePersonalDetail} 
              onNewImage={this.updateProfileImage} 
              editing={this.state.editing} 
              image={this.state.photoUrl}/>

          <div style={inLinestyles.flexx}></div>


          <div id="ab-main-tagSection">
            <div id="ab-main-tagEdit" style={editStatus}>
              <button className="buttons add" > + </button>
              <div style={inLinestyles.flexx}></div>
              <button className="buttons remove" >-</button>
            </div>
            <div id="ab-main-tags" style={inLinestyles.abMainTags} >
              <button className="tag" >Private</button>
              <button className="tag" >Friends</button>
              <button className="tag" >Friends1</button>
              <button className="tag" >Friends2xxxxxxx</button>
              <button className="tag" >Friends3 zzzz</button>
              <button className="tag" >Friends4</button>
              <button className="tag" >Friends5</button>
              <button className="tag" >Friends6</button>
              <button className="tag" >Friends7</button>
              <button className="tag" >Friends8</button>
              <button className="tag" >Friends9</button>
              <button className="tag" >Friends10</button>
              <button className="tag" >Friends</button>
              <button className="tag" >Friends</button>
              <button className="tag" >Friends</button>
              <button className="tag" >Friends11</button>
              <button className="tag" >Friends12</button>
              <button className="tag" >Friends13</button>
              <button className="tag" >Friends14</button>
            </div>
         </div>

          {this.editingDisplay()}
        </div>

        <div id="ab-main-sections" style={inLinestyles.abMainSections}>
          {this.renderModals()}
          {this.state.contactSections.map(this.renderContactSection)}
        </div>
      </div>
    </div>);
  },


  render: function() {
    if (this.state.selectedIds.length == 0) {
      console.log("NO CONTACT VIEW");
      console.trace();
      return this.renderNoContact();
    } else {
      console.log("CONTACT VIEW");
      console.trace();
      return this.renderContactDisplay();
    }
   }
});

ReactDOM.render(<AddressBook contactSections = {ContactSections} personalDetails = {PersonalDetails}/>, document.getElementById('addressBook'));

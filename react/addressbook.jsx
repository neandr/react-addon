/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.  */

// Fields options
var Email = {name: "Email", options: ["Work", "Home"], key: "email"};
var Phone = {name: "Phone", options: ["Mobile", "Home", "Work", "Fax", "Pager"], key: "tel"};
var Address = {name: "Address", options: ["Home", "Work"], key: "adr"};
var Webpage = {name: "Webpage", options: ["Home", "Work"], key: "url"};
var Chat = {name: "Chat", options: ["Google Talk", "AIM (R)", "Yahoo", "Skype", "QQ", "MSN", "ICQ", "Jabber ID", "IRC Nick"], key: "chat"};

// The address fields available  (as with RFC)
var AddressFields = ["PostBox", "ExtendedAdr", "Street", "City", "Region", "PostalCode", "Country"];

var ContactSections = [Email, Phone, Address, Webpage, Chat];
var PersonalSections = ["name", "nickname", "n", "bday", "anniversary", "gender", "rev", "note", "categories", "fn"];

var CategoryStandard = ['Privat', 'Friends']
var CategoryCollection = [];

var abStatus = "Welcome to vContacts";
var abTotalContacts=0;
var abSelectedContacts=0;

   function setABStatus(detail){
//console.log("  setABStatus >>" + detail + "<<")
//console.trace()

      if (detail){
         abStatus = detail
      } else {
         abStatus= "  *** Contacts Total: " + abTotalContacts + " Selected: " + abSelectedContacts;
      }
   };



// --- experimental Styling with react iStyles and cStyles---
//   var cStyles = { "editButton": "buttons remove nobutton" };
// --- combine styles like this:
//        style=Object.assign({'height':'1em'}, iStyles.flexx, iStyles.flex)
var iStyles = iStyles || {}
var $S = $S || {}

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

   iStyles.displayFlex = { 'display': 'flex' };
   iStyles.flex={'display': 'flex'};
   iStyles.flexx={'flex': '1'};

   iStyles.verticalButtons={'display': 'flex', 'flexDirection': 'column',
      'margin': '10px', 
      'justifyContent': 'space-around'};


   iStyles.abMainTagSection={'width': '150px', 'marginTop': '15px'};

   iStyles.abMainTags={'overflow':'auto', 'height': '130px'};

   iStyles.textTags={'fontSize': '0.8em', 'fontStyle': 'italic'};
   iStyles.textNotes={'fontSize': '0.8em'};

   iStyles.centerBlock = {'display':'block', 'margin':'auto'};
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


  iStyles.textRev={'marginTop':'0.5em', 'fontSize': '0.5em'};
  iStyles.displayStatus={'display':'block','fontSize': '1.4vw'};
  iStyles.flexRow={'display': 'flex', 'flexDirection': 'row', 'fontSize':'0.7em'}


  $S.center={'alignItems':'center', 'display':'flex'}
  $S.grey = {'color': 'grey'}
  $S.cursiv = {'fontStyle': 'italic'}
  $S.hBox = {'height':'1.5em'}

  $S.txt = Object.assign({'height':'1em', 'flex':'1 1 0%', 'marginTop':'.5em'}, $S.grey)
  $S.txt1 = Object.assign({'height':'1em', 'width': '8vw'}, $S.grey)
  $S.sym = Object.assign($S.center, $S.grey)

// --- experimental Styling with react iStyles and cStyles---


var AddressBook = React.createClass({
   getInitialState: function() {
      var contactSections = ContactParser.createEmptyContactSections(this.props.contactSections);
      var personalSections = ContactParser.createEmptyPersonalSections(this.props.personalSections);

      return {
         contactsList: [],
         selectedIds: [],
         contact: null,
         name: null,

         editing: false,
         photoUrl: "images/xContact.png",

         contactSections: contactSections,
         personalSections: personalSections,

         searchItem: '',
         tagItem: '',

         abStatus: abStatus,
         totalContacts: abTotalContacts,
         selectedContacts: abSelectedContacts,

         tagCollection: {CategoryCollection},
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
      setABStatus(this.state.abStatus);
   },

   deleteDB: function() {
      indexedDB.deleteDatabase("addrbook")

      document.getElementById('dbdelete').setAttribute('style','display:none')
      document.getElementById('closeTag').setAttribute('style','display:block')
   },


   addContact: function() {  //TODO Should directly open the imported contact
     var self = this;
     Addressbook.open(indexedDB).then(AddressbookUtil.newContact)
       .then(self.loadInContacts)
       .then(self.openContact)
   },


   searchNames: function(event) {
      //  console.log (" ... nameSearch: ", event.target.value);                //TEST
      this.setState({searchItem: event.target.value});
      var self = this;
      Addressbook.open(indexedDB).then(self.loadInContacts).then(self.abSetStatus)
   },

   clearSearchNames: function(event) {
   //  console.log (" ... nameClear: ", event.target.value);                    //TEST
      this.setState({searchItem: ""});
      var self = this;
      Addressbook.open(indexedDB).then(self.loadInContacts);
   },

   searchTags: function(event) {
   //  console.log (" ... tagSearch: ", event.target.value);                    //TEST
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

   tagSupport: function() {
      // tbd     Called from Hambg --> this will maintain the Tag List          //TODO
   },

   editContact: function() {
      this.setState({editing: true});
   },

   deleteContact: function() {
      this.closeModal('deleteContact');
      DatabaseConnection.deleteContact(this.state.selectedIds[0], this);
   },

   closeContacts: function() {
      DatabaseConnection.closeContact(this);
   },

   addContactDetail: function(index) {
      ContactParser.addContactDetail(this, index);
   },

   removeContactDetail: function(index, fieldID) {
      ContactParser.removeContactDetail(this, index, fieldID)
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


   setContactID: function(event, id, name) {

     // don't change 'contact' if editing is active
     if (this.state.editing == true) {
        return;
     }

     var selected = this.state.selectedIds;

     // *** debugging use ***
     //   On sidebar select the contact, 
     //   with  [Shift] [Alt] cursor click show the raw vCard data
     if (event.altKey && event.shiftKey && selected.length == 1) {
        var log = ("  Display vCard source :  " + name + "  id:" + id + "\n" 
           + (JSON.stringify(this.state.contact)).replace(/\],\[/g, '\n'));
        alert (log)           //TODO  change to normal dialog not 'alert'
        console.log(log);     //gWLog
     // *** debugging use ***

     } else {

     // mark contacts on sidebar for further action(s)
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
           // open the selected contact to display/edit/etc it's details
           DatabaseConnection.getContactDetails(id, this);
           this.setState({
              selectedIds: [id],
              name: name
            })
         }
      }
   },


   openContact: function() {
      this.setState({
         selectedIds: [DatabaseConnection.lastContactId],
         name: name
      });

      DatabaseConnection.getContactDetails(DatabaseConnection.lastContactId, this);
   },


   editingDisplay: function() {
      if (!this.state.editing) {
         return (
         <div id="main-buttons" style={iStyles.verticalButtons}>
            <button className="buttons" onClick={this.closeContacts}>Close</button>

            <div style={iStyles.flexx}></div>

            <button className="buttons" onClick={this.editContact}>Edit</button>

            <div style={iStyles.flexx}></div>

           <button className="buttons" onClick={this.openModal.bind(null, 'deleteContact')}>Delete</button>
         </div>);
      } else {
         return (
         <div id="main-buttons" style={iStyles.verticalButtons}>
            <button className="buttons" onClick={this.editSave}>Save</button>

            <div style={iStyles.flexx}></div>

            <button className="buttons" onClick={this.editCancel}>Cancel</button>

            <div style={iStyles.flexx}></div>
         </div>);
      }
   },


   notesChanged: function (e) {
      var eValue = e.currentTarget.value
      var notes =this.state.personalSections.note.content 
      this.setState({
         notes: eValue
      });
      this.notesContent = eValue

   },
   notesContent:"",


   renderNotes: function() {
      this.notesContent = this.state.personalSections.note.content;
      return (
      <div className="contact-section">
         <div className="contact-group">{'Notes'}</div>
         <NotesSection
            editing={this.state.editing}
            notesContent={this.notesContent}
            notesChanged={this.notesChanged}
            personalDetails={this.state.personalSections}
         />
      </div>);
   },


   addTag: function(event) {
      var newTag = event.target.value;
      if (newTag == '' || newTag == '%none%') return;

      var tDetails = this.state.personalSections;

      if (tDetails.categories.property == null) {
         tDetails.categories.property = new ICAL.Property('categories');
         tDetails['categories'].property.jCal[3]=[newTag];
         tDetails['categories'].content = newTag;
      } else {

         var allTags = tDetails['categories'].property.jCal[3];
         var uniTags = allTags.filter(function(e) { return e !== newTag })
         uniTags.push(newTag);
         tDetails['categories'].property.jCal[3] = uniTags
      }

      this.setState({
         personalSections: tDetails,
      });
      document.getElementById('tagsSelection').options.selectedIndex=0
   },


   removeTag: function(thisTag) {
      var delTag = thisTag.target.previousElementSibling.textContent;

      var currentSection = this.state.personalSections

      var allTags = currentSection.categories.property.jCal[3];
      var uniTags = allTags.filter(function(e) { return e !== delTag })

      currentSection.content = uniTags.join(",");
      currentSection.categories.property.jCal[3] = uniTags;

      this.setState({
         currentSection: currentSection
      });

   },


   renderContactTags: function() {
      var removeButton = addButton= "buttons nobutton"
      if (this.state.editing) {
         removeButton = "buttons remove"
         addButton = "buttons add"
      }
      var pCategories = this.state.personalSections.categories;

      // without 'categories' do noting
      if (!pCategories) return;
      if (!pCategories.property) return;

      //this.state.personalSections.categories.property.jCal[3]
      //Array [ "Business", "Golf" ]      needs to be Array! If not make Array

      var jCategories = pCategories.property.jCal[3]

      if (typeof jCategories === 'string') {
         jCategories = [jCategories];
      }

      var self = this
      return(
         <div> {jCategories.map(function(nextCat) {
         return (
            <div>
               <button style={iStyles.tag} >{nextCat}</button>
               <button className={removeButton}  onClick={self.removeTag} > - </button>
            </div>
         )}
      )}
      </div>)
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
         return <ContactDelete
            name={this.state.name} 
            noDelete={this.closeModal.bind(null, 'deleteContact')} 
            confirmDelete={this.deleteContact}
         />;
      }

      if(this.state.modals.deleteDB) {
         return <DBdelete
            noDelete={this.closeModal.bind(null, 'deleteDB')} 
            confirmDelete={this.deleteDB} 
         />;
      }
   },


   openUrl: function(url) {
      AddressbookUtil.openLink(url);
   },


   renderContactSection: function(contactSection) {
      if (this.state.editing) {
         return(      // edit mode
         <ContactSection
            editing={this.state.editing}

            type={contactSection.name}
            options={contactSection.options}
            index={contactSection.index}
            fields={this.state.contactSections[contactSection.index].fields}
            save={this.editSave}
            addContactDetail={this.addContactDetail}
            removeContactDetail={this.removeContactDetail}
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
           save={this.editSave}
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

            <div id="ab-sidebar"  style={iStyles.abSidebar}>
               <AB_header 
                  stateModal={this.openModal} 
                  hamburger={this.hamburger}
                  show_HH={this.showHH}

                  abStatus={abStatus}
               /> 

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
                  <button style={iStyles.centerBlock} 
                     className="buttons" 
                     onClick={this.addContact} >{'+'}</button>
                  <div style={iStyles.centerText}>Add a new Contact</div>
               </div>
            </div>
         </div>
      </div>
      );
   },


  renderTagSelector: function(){
    return (<option id="tagsSelection0" defaultValue={'%none%'}>{'Add Tag'}</option>)
  },

  renderTags: function(tag){
    return (<option defaultValue={tag}>{tag}</option>)
  },



  /*
   * Layout for a SELECTED contact 
   */
   renderContactDisplay: function() {

      var tags = CategoryCollection;
      var tagsStatus = iStyles.displayNone

      var removeButton = "buttons nobutton"
      var addButton = "buttons nobutton"

      if (this.state.editing) {
         removeButton = "buttons remove"
         addButton = "buttons add"
         tagsStatus = iStyles.flex
      }

      var self = this;

      return (
      <div id="ab-Container" >
         <div id="ab-window" style={iStyles.abWindow}>
            {this.renderModals()}
            {this.renderHH()}

            <div id="ab-sidebar"  style={iStyles.abSidebar}>
               <AB_header 
                  stateModal={this.openModal} 
                  hamburger={this.hamburger}
                  show_HH={this.showHH}

                  abStatus={abStatus}
               /> 

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
                     personalDetails={this.state.personalSections}
                     onUserInput={this.updatePersonalDetail}
                     onNewImage={this.updateProfileImage}
                     editing={this.state.editing}
                     image={this.state.photoUrl}
                  />

                  <div style={iStyles.flexx}></div>

                  <div id="ab-main-tagSection" style={iStyles.abMainTagSection}>

                     <div id="ab-main-tagEdit" >
                        <img className="glyphicons" src="images/glyphicons_065_tag.png"/>
                        <description style={iStyles.textTags}> Tags </description>
                     </div>

                     <div style={tagsStatus} >
                         <select id="tagsSelection" onChange={self.addTag} style={iStyles.searchTagsSelect}>
                            {this.renderTagSelector()}
                            {tags.map(this.renderTags)}
                        </select>
                     </div>

                     <div id="ab-main-tags" style={iStyles.abMainTags} >
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
         return this.renderNoContact();
      } else {
         // console.log("CONTACT VIEW");
         return this.renderContactDisplay();
      }
   },


/*
 *   Hamburger Setup
 */
   showHH: function() {
     document.getElementById('hambgMenu').setAttribute("class","hambgMenu show");
   },

   closeHH: function() {
      document.getElementById('hambgMenu').setAttribute("class","hambgMenu");
   },


   renderHH: function() {
      //NOTFALL delete DB run
      //    indexedDB.deleteDatabase("addrbook")
      return (
      <div id="hambgMenu" className="hambgMenu" onClick={this.closeHH}>
         <div style={iStyles.hhStyle}>
            <p style={iStyles.hhHeader}>{'vContacts Main Menu'}</p>
            <p className="hambgLink" onClick={this.addContact}>Add new Contact</p>
            <hr/>
            <p className="hambgLink" onClick={this.tagSupport}>{'Tag Support **tbd**'}</p>
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
   }

});

ReactDOM.render(
   <AddressBook 
      contactSections = {ContactSections} 
      personalSections = {PersonalSections}
      tagCollection = {CategoryCollection}
   />, 
   document.getElementById('addressBook')
);

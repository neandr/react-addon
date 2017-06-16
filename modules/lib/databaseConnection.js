/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 *  Deals with connecting to the database to retrieve or update information
 * relating to contacts and providing this information to the UI
 */
function DatabaseConnection() { };

/**
 *  Gets a contact from the database by id and provides details to the UI
 * @param {Integer} id The id of the contact to retrieve
 * @param {AddressBook} abUI The addressbook UI component
 */
DatabaseConnection.getContactDetails = function(id, abUI) {
   // if edit mode on, leave 
   if (abUI.state.editing == true) return;

   var contactSections = ContactParser.createEmptyContactSections(abUI.props.contactSections);
   var personalSections = ContactParser.createEmptyPersonalSections(abUI.props.personalSections);

   Addressbook.open(indexedDB).then(function(addrbook) {
      addrbook.getById(id).then(function(contact) {
         var contact = new Contact(contact.toJSON())
         // Gets contact details
         for (var j = 0; j <contact.jcards.length; j++) {
            var details = contact.jcards[j].getAllProperties();
            var cProps = contact.jcards[j].getAllProperties();
            for (var i = 0; i < details.length; i++) {
               ContactParser._parseProperty(details[i], cProps[i], 
                  contactSections, personalSections, j);
            }
         }

         // Gets contact profile image
         var photoUrl = Images.getPhotoURL(contact.photo);
         // Stores contact information in UI
         abUI.setState({
            contact: contact,
            contactSections: contactSections,
            personalSections: personalSections,
            photoUrl: photoUrl
         });
      });
   });
}


/**
 *  Updates a contact in the database with changed information and updates the UI
 * @param {Contact} contact The contact to update
 * @param {AddressBook} abUI The addressbook UI component
 */
DatabaseConnection.updateContact = function(abUI) {
   var contact = abUI.state.contact;
   var contactSection = [];
   var contactsList = abUI.state.contactsList;
   var personalDetails = abUI.state.personalSections;
   var name = personalDetails.name;       // 'name' is the key to abUI, eg. 'n' or 'categories'
   var id = abUI.state.selectedIds[0];

   ContactParser.saveContactPersonalDetails(personalDetails,
      contact, contactsList, name, id);
   ContactParser.saveContactSections(abUI.state.contactSections, contactSection, contact);

   ContactParser.saveContactPhotoToContactsList(contactsList, id, abUI.state.contact);

   var revDate = ICAL.Time.now().toString()      // "2016-11-19T14:26:18"
   contact.jcards[0].updatePropertyWithValue("rev", revDate);

   abUI.setState({
      name: name,
      contactsList: contactsList,
      contact: contact,
      contactSections: contactSection,
      editing: false
   });

   Addressbook.open(indexedDB).then(function(addrbook) {
      addrbook.update(contact).then(function(id) {
         abUI.setState({photoUrl: Images.getPhotoURL(contact.photo)});
      });
   });
};


/**
 *  Loads in the name, id and photo of all contacts in the database and
 * provides this to the UI (Sidebar)
 * A "Search" string can be passed with 'abUI.state.searchItem' to filter the 
 * whole contacts; a space in the "Search" string splits for two filter 
 * items (givenName and familyName)
 * 
 * TODO   For performance reasons the search is limited to 100 items found
 * TODO     needs a method to scroll with all selected contacts
 *
 *  @param {AddressBook} abUI The addressbook UI component
 */

DatabaseConnection.lastContactId;

DatabaseConnection.loadInContacts = function(abUI) {
   var filter = abUI.state.searchItem != '' ? abUI.state.searchItem : "";
   var filter2 = filter.split(" ")[1] || "";
   var filter1 = filter.split(" ")[0] || "";

   var tagItem = abUI.state.tagItem != '' ? abUI.state.tagItem : "";

   CategoryCollection = CategoryStandard;

   //performance messures
   // for disabling set 'enablePerf' to false
   var enablePerf = true
   var perf = [];
   function getPerfNow (n){
      if (enablePerf) {perf.push(performance.now())}
   }


getPerfNow(0);

   Addressbook.open(indexedDB).then(function(addrbook) {
getPerfNow(1);
      addrbook.getAllNameIdAndPhoto().then((contacts) => {
getPerfNow(2); 

         var contactsList = [];

         var totalContacts = contacts.length;

         // Gets name, id and photo per contact
         for(var i = 0; i < contacts.length; i++) {
            contactsList.push({name: contacts[i].name, 
               categories: contacts[i].categories, 
               id: contacts[i].id, 
               photo: contacts[i].photo});
            DatabaseConnection.lastContactId = contacts[i].id
         }

getPerfNow(3); 
         // Sort alphabetically with 'name' of contacts
         contactsList.sort((a,b) => a.name.toLowerCase() > b.name.toLowerCase());
getPerfNow(4); 

         // filter contactsList using "Search" string 
         var contactsList1 = [];
         var n = 0;
         for(var i = 0; i < contactsList.length; i++) {
            var getThis = false;

            // Gets name, id and photo per contact, use filter items
            // no filter get all contacts
            if (filter1 == "" && filter2 == "") {
               getThis = true;
            }

            // filter for firstName only 
            if (filter1 != "" && filter2 == "") {
               if ((contactsList[i].name).substr(0,filter1.length) == filter1) {
                  getThis = true;
               }
            }

            // filter for lastName only
            if (filter1 == "" && filter2 != "") {
               if((contactsList[i].name).split(" ")[1] != null) {
                  if((contactsList[i].name).split(" ")[1].substr(0,filter2.length) == filter2){
                     getThis = true;
                  }
               }
            }

            // filter for first- and lastName
            if (filter1 != "" && filter2 != "") {
               if ((contactsList[i].name).substr(0,filter1.length) == filter1){
                  if((contactsList[i].name).split(" ")[1] != null) {
                     if((contactsList[i].name).split(" ")[1].substr(0,filter2.length) == filter2){
                        getThis = true;
                     }
                  }
               }
            }

            //lookup for one categories item selected with pulldown menu
            if (getThis === true) {
               if (tagItem != "") {
                  var cats = contactsList[i].categories.split(',');
                  var mCats = cats.length;
                  for (var m = 0; m < mCats; m++){
                     if (cats[m] == tagItem){
                        contactsList1.push({name: contactsList[i].name, id: contactsList[i].id, photo: contactsList[i].photo});
                        n++;
                     }
                  }
               } else {
                  contactsList1.push({name: contactsList[i].name, id: contactsList[i].id, photo: contactsList[i].photo});
                  n++;
               }
               if (n === 101) break;
            }
         }

getPerfNow(5);
         abUI.setState({contactsList: contactsList1});
getPerfNow(6);


         abUI.setState({abStatus: ('Contacts ' + n + ' of ' + totalContacts)});
/*-----------
// https://medium.com/@mweststrate/3-reasons-why-i-stopped-using-react-setstate-ab73fc67a42e
-------------*/

         if (enablePerf) {console.log("DatabaseConnection.loadInContacts   perf:: \n", 
          "\n  open db                   ", perf[1] - perf[0],
          "\n  getAllNameIdAndPhoto      ", perf[2] - perf[1],
          "\n  start with # of contacts  ", contacts.length,
          "\n  get contactsList          ", perf[3] - perf[2],
          "\n  sort contactsList         ", perf[4] - perf[3],
          "\n  filter contactsList       ", perf[5] - perf[4], " filter name:" +filter1,filter2, " categories:" + tagItem,
          "\n  display up to 100 contacts", perf[6] - perf[5], n,
          "\n  lastContactId ", DatabaseConnection.lastContactId);
         }
      });
   });
};

/**
 *  Exports contacts with the given ids
 * @param {Integer[]} selectedIds The ids of the contacts to be exported
 */
DatabaseConnection.export = function(selectedIds) {
   if (selectedIds.length > 0) {
      Addressbook.open(indexedDB).then(function(addrbook) {
         Promise.all(selectedIds.map((id) => addrbook.getById(id))).then(function(contacts) {
            AddressbookUtil.exportContact(contacts);
         })
      });
   }
};

/**
 *  Deletes a contact from the database and the UI
 * @param {Integer[]} selectedIds The ids of the contacts to be exported
 * @param {AddressBook} abUI The addressbook UI component
 */
DatabaseConnection.deleteContact = function(contactId, abUI) {
   Addressbook.open(indexedDB).then(function(addrbook) {
      addrbook.deleteById(contactId).then(() => {
         // deletes from sidebar
         var contactsList = ContactParser.deleteContact(abUI.state.contactsList, contactId);
         abUI.setState({
            selectedIds: [], // unselects any selected contacts
            contactsList: contactsList
         });
      });
   });
}

/**
 *  Close the Contact UI
 * @param {AddressBook} abUI The addressbook UI component
 */
DatabaseConnection.closeContact = function(abUI) {
   Addressbook.open(indexedDB).then(function(addrbook) {
      abUI.setState({
         selectedIds: [], // unselects any selected contacts
         contactsList: abUI.state.contactsList
      });
   });
}
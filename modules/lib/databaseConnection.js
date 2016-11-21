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
 * @param {AddressBook} ab The addressbook UI component
 */
DatabaseConnection.getContactDetails = function(id, ab) {
  // if edit mode on, leave 
  if (ab.state.editing == true) return;

  var contactSections = ContactParser.createEmptyContactSections(ab.props.contactSections);
  var tempContactSections = ContactParser.createEmptyContactSections(ab.props.contactSections);
  var personalSection = ContactParser.createEmptyPersonalSection(ab.props.personalDetails);
  var tempPersonalSection = ContactParser.createEmptyPersonalSection(ab.props.personalDetails);

  Addressbook.open(indexedDB)
     .then(function(addrbook) {
        addrbook.getById(id)
        .then(function(contact) {
        var con = new Contact(contact.toJSON())
        var tempContact = new Contact(contact.toJSON())
      // Gets contact details
      for (var j = 0; j <contact.jcards.length; j++) {
        var details = contact.jcards[j].getAllProperties();
        var cProps = con.jcards[j].getAllProperties();
        var tProps = tempContact.jcards[j].getAllProperties();
        for (var i = 0; i < details.length; i++) {
          ContactParser._parseProperty(details[i], cProps[i], tProps[i], contactSections, tempContactSections, personalSection, tempPersonalSection, j);
        }
      }
      // Gets contact profile image
      var photoUrl = Images.getPhotoURL(contact.photo);
      // Stores contact information in UI
      ab.setState({
        contact: con,
        tempContact: tempContact,
        contactSections: contactSections,
        tempContactSections: tempContactSections,
        personalSection: personalSection,
        tempPersonalSection: tempPersonalSection,
        photoUrl: photoUrl
      });
    });
  });
};

/**
 *  Updates a contact in the database with changed information and updates the UI
 * @param {Contact} contact The contact to update
 * @param {AddressBook} ab The addressbook UI component
 */
DatabaseConnection.updateContact = function(contact, ab) {
  var personalSection = ContactParser.createEmptyPersonalSection(ab.props.personalDetails);
  var contactSection = [];
  var contactsList = ab.state.contactsList;
  var name = ab.state.name;
  var id = ab.state.selectedIds[0];

 ContactParser.saveContactPersonalDetails(ab.state.tempPersonalSection, personalSection,
    ab.state.tempContact, ab.state.contactsList, name, id);         //XXXgW

  var contact = new Contact(ab.state.tempContact.toJSON());
  ContactParser.saveContactSections(ab.state.tempContactSections, contactSection, contact);
//  ContactParser.saveContactSections(ab.state.tempPersonalSection, personalSection, contact);


  var revDate = ICAL.Time.now().toString()      // "2016-11-19T14:26:18"
  contact.jcards[0].updatePropertyWithValue("rev", revDate)



  ContactParser.saveContactPhotoToContactsList(contactsList, ab.state.tempContact, id);



  ab.setState({
    name: name,
    contactsList: contactsList,
    contact: contact,
    contactSections: contactSection,
    personalSection: personalSection,
    editing: false
  });

  Addressbook.open(indexedDB)
  .then(function(addrbook) {
    addrbook.update(contact)
    .then(function(id) {
      // Updates image in the UI
      ab.setState({photoUrl: Images.getPhotoURL(contact.photo)});
    }); // maybe check success here?
  });
}

/**
 *  Loads in the name, id and photo of all contacts in the database and
 * provides this to the UI
 * @param {AddressBook} ab The addressbook UI component
 */
DatabaseConnection.loadInContacts = function(ab) {
  Addressbook.open(indexedDB).then(function(addrbook) {
    addrbook.getAllNameIdAndPhoto().then((contacts) => {
      var contactsList = [];
      for(var i = 0; i < contacts.length; i++) {
        // Gets name, id and photo per contact
        contactsList.push({name: contacts[i].name, id: contacts[i].id, photo: contacts[i].photo});
      }
      // Sorts contacts alphabetically
      contactsList.sort((a,b) => a.name.toLowerCase() > b.name.toLowerCase());
      ab.setState({contactsList: contactsList});
    });
  });
}

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
}

/**
 *  Deletes a contact from the database and the UI
 * @param {Integer[]} selectedIds The ids of the contacts to be exported
 * @param {AddressBook} ab The addressbook UI component
 */
DatabaseConnection.deleteContact = function(contact, ab) {
  Addressbook.open(indexedDB).then(function(addrbook) {
    addrbook.deleteById(contact).then(() => {
      // deletes from sidebar
      var contactsList = ContactParser.deleteContact(ab.state.contactsList, contact);
      ab.setState({
        selectedIds: [], // unselects any selected contacts
        contactsList: contactsList
      });
    });
  });
}

/**
 *  Close the Contact UI
 * @param {AddressBook} ab The addressbook UI component
 */
DatabaseConnection.closeContact = function(ab) {
  Addressbook.open(indexedDB).then(function(addrbook) {
      ab.setState({
        selectedIds: [], // unselects any selected contacts
        contactsList: ab.state.contactsList
      });
  });
}
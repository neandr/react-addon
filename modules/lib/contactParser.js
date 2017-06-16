/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 *  Deals with parsing between formats required for displaying contacts in
 * the UI and the vCard stored in the database. Also provides functions for
 * updating/modifying the two formats in response to user changes.
 */
function ContactParser() { };


// CLEARING OF A CONTACT
/**
 * Clears all information about a contact held in the main panel
 * @param {Array}  contactSections  Infomation to clear
 */
ContactParser.createEmptyContactSections = function(contactSections) {
   var sections = [];
   for (var i = 0; i < contactSections.length; i++) {
      sections.push({
         name: contactSections[i].name,
         options: contactSections[i].options,
         fields: [],
         index: i,
         key: contactSections[i].key
      });
   }
   return sections;
};


/**
 *  Clears all information about a contact held in the header
 * @param {Array}  details   Infomation to clear
 */
ContactParser.createEmptyPersonalSections = function(details) {
   var pDetails = {};
   for(var i = 0; i < details.length; i++) {
      pDetails[details[i]] = {content: "", property: null, jCardIndex: null};
   }
   return pDetails;
};


// PARSING VCARD FOR THE UI
/**
 *  Parses a single property of a contact vCard for the UI (Main section with Header and Details)
 * @param {Property} property           The property to parse
 * @param {Array}    permanentProperty  Contact property in UI
 * @param {Array}    permanentSection   Contact sections in UI
 * @param {Array}    pField Personal    details of contact fields in UI header
 * @param {Integer}  jCardIndex         Index of the jCard which the property belongs to
 */
ContactParser._parseProperty = function(property, permanentProperty, permanentSection, pField, jCardIndex) {

   var pname = property.name;
   var type = property.getParameter("type");
   var content = property.getFirstValue();

   // Gets type of property (used for option display)
   if (Array.isArray(type)) {
      type = type[0];
   }
   if (type) {
      type = type.charAt(0).toUpperCase() + type.slice(1);
   }

   // Parses property
   switch (pname) {
      case "email":
         this._addFieldProperty(0, type, content, permanentSection, jCardIndex, permanentProperty);
         break;
      case "tel":
         this._addFieldProperty(1, type, content, permanentSection, jCardIndex, permanentProperty);
         break;
      case "adr":
         this._addFieldProperty(2, type, content, permanentSection, jCardIndex, permanentProperty);
         break;
      case "url":
         this._addFieldProperty(3, type, content, permanentSection, jCardIndex, permanentProperty);
         break;


      case "fn":
         this._addPersonalDetail(pField, "name", jCardIndex, permanentProperty, content);
         break;
      case "nickname":
         this._addPersonalDetail(pField, "nickname", jCardIndex, permanentProperty, content);
         break;
      case "n":
         this._addPersonalDetail(pField, "n", jCardIndex, permanentProperty, content);
         break;

      case "bday": 
         this._addPersonalDetail(pField, "bday", jCardIndex, permanentProperty, content.toString().substring(0,10));
         break;

      case "anniversary": 
         this._addPersonalDetail(pField, "anniversary", jCardIndex, permanentProperty, content.toString().substring(0,10));
         break;

      case "gender": 
         this._addPersonalDetail(pField, "gender", jCardIndex, permanentProperty, content);
         break;

      case "rev":
         this._addPersonalDetail(pField, "rev", jCardIndex, permanentProperty, content);
         break;

      case "categories":
         this._addPersonalDetail(pField, "categories", jCardIndex, permanentProperty, content);
         break;

      case "note":
         this._addPersonalDetail(pField, "note", jCardIndex, permanentProperty, content);
         break;

      default:
         break;
   }
};


/**
 *  Adds a personal property to the personal and temporary contact fields for
 * the UI header of a contact
 * @param {Array}    pField             Personal details of contact fields in UI header
 * @param {string}   type               The type of personal detail
 * @param {Intger}   jCardIndex         Index of the jCard which the detail belongs to
 * @param {Property} permanentProperty  Contact property in UI header
 * @param {string}   content            The content of the property
 */
ContactParser._addPersonalDetail = function(pField, type, jCardIndex, permanentProperty, content) {
   if (!!content && !!pField[type]) {
      pField[type].content = content.toString();
      pField[type].property = permanentProperty;
      pField[type].jCardIndex = jCardIndex;
   }
}


/**
 *  Adds a property to the appropriate contact section for
 * displaying the contact in the UI
 * @param {Integer}   index          The index of the contact section to add to
 * @param {string}    currentOption  The option type associated with the property
 * @param {string}    content        The content of the property
 * @param {Array}     sections       The sections of the contact
 * @param {Integer}   jCardIndex     Index of the jCard which the detail belongs to
 * @param {Property}  property       Property to add
 */
ContactParser._addFieldProperty = function(index, currentOption, content, sections, jCardIndex, property) {
   var fieldID = sections[index].fields.length;
   sections[index].fields.push({
      currentOption: currentOption,
      content: content,
      fieldID: fieldID,
      property: property,
      jCardIndex: jCardIndex
   });
};


// MODYFING A CONTACT
/**
 *  Updates the value of an existing property that is from a contact section
 * @param {AddressBook}  abUI     The addressbook UI component
 * @param {Integer}      index    The index of the temporary contact section to update
 * @param {Integer}      fieldID  The index of the field in the temporary contact section to update
 * @param {string}       content  The content to update the property with
 */
ContactParser.updateContent = function(abUI, index, fieldID, content) {
   var tSection = abUI.state.contactSections[index];

   var contactSections = abUI.state.contactSections;
   contactSections[index] = tSection;

   var _Contact = abUI.state.contact;

   var field = tSection.fields[fieldID];
   field.content = content;
   field.property.setValue(content);

   abUI.setState({
      contactSections: contactSections,
      contact: _Contact
   });
};


/**
 *  Updates the value of an existing property that is a personal detail
 * @param {AddressBook}  abUI     The addressbook UI component
 * @param {string}       detail   The detail to update
 * @param {string}       content  The content to update the property with
 */
ContactParser.updatePersonalDetail = function(abUI, detail, content) {
//console.log("ContactParser.updatePersonalDetail   detail: ", detail.toString());        //TEST
   var tDetails = abUI.state.personalSections;
   tDetails[detail].content = content;

   abUI.setState({
      personalSections: tDetails,
   });
};


/**
 *  Updates the option associated with a property
 * @param {AddressBook} abUI     The addressbook UI component
 * @param {string}      option   The option to update to
 * @param {Integer}     index    The index of the temporary contact section to update
 * @param {Integer}     fieldID  The index of the field in the temporary contact section to update
 */
ContactParser.updateOption = function(abUI, option, index, fieldID) {
   var tSection = abUI.state.contactSections[index];
   var field = tSection.fields[fieldID];
   field.currentOption = option;
   field.property.setParameter("type", option);

   var _contactSections = abUI.state.contactSections;
   _contactSections[index] = tSection;

   abUI.setState({
      contactSections: _contactSections,
   });
};


/**
 *  Updates the profile image of a contact
 * @param {AddressBook}  abUI   The addressbook UI component
 * @param {Blob}         image  The new image for the contact
 */
ContactParser.updateProfileImage = function(abUI, image) {
   var _contact = abUI.state.contact;
   _contact.photo = image.files[0];

   var photoUrl = Images.getPhotoURL(image.files[0]);
   abUI.setState({
      contact: _contact,
      photoUrl: photoUrl
   });
};


/**
 *  Removes a property from a contact
 * @param {AddressBook}  abUI               The addressbook UI component
 * @param {Integer}      tempSectionIndex   The index of the temporary section of a contact to add to
 * @param {Array}        tempSections       All sections of the contact
 * @param {Integer}      propertyID         The id of the property to be removed
 */
ContactParser.removeContactDetail = function(abUI, tempSectionIndex, propertyID) {
   // Removes property from UI

   var tempSections = abUI.state.contactSections
   var _Contact = abUI.state.contact

   var tempSection = tempSections[tempSectionIndex];
   var field = tempSection.fields.splice(propertyID, 1)[0];
   tempSections[tempSectionIndex] = tempSection;

console.log ("removeContactDetail   tempSectionIndex", tempSectionIndex, "  propertyID",propertyID )



   // Removes property from contact
   var removed = _Contact.jcards[field.jCardIndex].removeProperty(field.property);
 console.log ("removeContactDetail", removed, tempSection);             //TEST

   abUI.setState({
      contactSections: tempSections,
      contact: _Contact
   });
};

// 
/**
 *  Adds a new property to a contact
 * @param {AddressBook}  abUI              The addressbook UI component
 * @param {Integer}      tempSectionIndex  The index of the temporary section of a contact to add to
 */
ContactParser.addContactDetail = function(abUI, tempSectionIndex) {
   // Sets content
   var tempSections = abUI.state.contactSections;
   var tempSection = tempSections[tempSectionIndex];
   var content = "";
   if(tempSection.name == "Address"){
      content = [];
      for(var i = 0; i < 7; i++) {
         content.push("");
      }
   }

   // Adds property to contact
   var _Contact = abUI.state.contact;
   var name = tempSection.key;
   var type = tempSection.options[0];
   var property = _Contact.jcards[0].addPropertyWithValue(name, content);
   property.setParameter("type", type);

   // Adds property to contact in UI
   var fieldID = tempSection.fields.length;
   tempSection.fields.push({
      currentOption: type,
      content: content,
      fieldID: fieldID,
      jCardIndex: 0,
      property: property
   });
   tempSections[tempSectionIndex] = tempSection;

   abUI.setState({
      contactSections: tempSections,
      contact: _Contact
   });
};


// UPDATING UI TO REFLECT CHANGE  (Rename and Delete)
/**
 *  Renames a contact on the sidebar
 * @param {Integer} id The id of the contact to be renamed
 * @param {string}  name The new name of the contact
 * @param {Array}   contactsList The list of contacts displayed on the sidebar
 */
ContactParser.rename = function(contactsList, id, name) {
   for (var i = 0; i < contactsList.length; i++) {
      if (contactsList[i].id == id) {
         contactsList[i].name = name;
         return;
      }
   }
};

/**
 *  Deletes a contact from the sidebar/contactsList
 * @param {Array}     contactsList The list of contacts displayed on the sidebar
 * @param {Integer}   id The id of the contact to be deleted
 * @returns {Array}   contactsList The list of contacts with the desired contact removed
 */
ContactParser.deleteContact = function(contactsList, id) {
   var index = contactsList.findIndex(function(contact) {
      return contact.id == id;
   });
   contactsList.splice(index, 1);
   return contactsList;
};


// METHODS FOR HELPING WITH SAVING A CONTACT

/**
 *  Saves the contact details from the temporary details for the UI
 * @param {Array}    uiPersonalSection The permanent details to save to
 * @param {Contact}  contact The contact to save
 * @param {Array}    contactsList The list of all contacts
 * @param {string}   name The name of the contact before editing
 * @param {Integer}  id The id of the contact being saved
 */
ContactParser.saveContactPersonalDetails = function(uiPersonalSection, contact, contactsList, name, id) {

   uiPersonalSection['note'].content = document.getElementById('currentNotes').value

   for (var key in uiPersonalSection) {

      var currentContent = uiPersonalSection[key].content
  console.log("\n saveContactPersonalDetails    ", key, currentContent);     //TEST

      switch (key) {
      case 'name' :
            var cN = uiPersonalSection['n'].property.jCal[3]
            var cName = cN[1] + " " + cN[0];
            this.rename(contactsList, id, cName);
            uiPersonalSection['fn'].content = cName;
            uiPersonalSection['name'].content = cName;
            uiPersonalSection['name'].property.jCal[3] = cName;
            contact.name = cName;
         break;
 
      case 'n' :
         break;

      case 'categories' :
         break;

      default:
         contact.jcards[0].updatePropertyWithValue(key, uiPersonalSection[key].content)
      }
  console.log(" saveContactPersonalDetails    ", key, currentContent);     //TEST
   }
};


/**
 *  Saves the image of a contact to the sidebar/contacts list
 * @param {Array}     contactsList The list of all contacts
 * @param {Contact}   contact The contact to save
 * @param {Integer}   id The id of the contact being saved
 */
ContactParser.saveContactPhotoToContactsList = function(contactsList, id, contact) {
   var _Contact = contactsList.find(function(contact) {
      return contact.id == id;
   });
   _Contact.photo = Images.getPhotoURL(contact.photo);
};


/**
 *  Saves the contact sections from the temporary sections for the UI
 * @param {Array} uiContactSection The temporary sections of the contact to save
 * @param {Array} permanentSection The permanent sections of the contact to save to
 * @param {Array} contact The contact to save
 */
ContactParser.saveContactSections = function(uiContactSection, permanentSection, contact) {

   for (var i in uiContactSection) {
      var currentName = uiContactSection[i].name;

console.log("\n saveContactSections     currentName", currentName)

      var fields = [];
      for (var j = 0; j < uiContactSection[i].fields.length; j++) {

         var pushProperty = this.findCloneProperty(contact, uiContactSection[i].fields[j].property);
         var pushContent = uiContactSection[i].fields[j].content;

console.log("\n                 -------->          ", currentName, "  i/j: ", i,j,
          "\n   pushProperty:", pushProperty, 
          "\n   pushContent: ",pushContent)    //TEST

         fields.push({
            currentOption: uiContactSection[i].fields[j].currentOption,
            fieldID: uiContactSection[i].fields[j].fieldID,
            jCardIndex: uiContactSection[i].fields[j].jCardIndex,
            content: pushContent,
            property: pushProperty
         });
      }

      permanentSection.push({
         name: uiContactSection[i].name,
         options: uiContactSection[i].options,
         fields: fields,
         index: i,
         key: uiContactSection[i].key
      });
   }
};


/**
 *  Cancels the editing of a contact and resets the temporary fields to
 * the original set of fields.
 * @param {AddressBook} abUI The addressbook UI component
 */
ContactParser.cancelContactEdit = function(abUI) {
   var contact = abUI.state.contact;

   // Gets contact profile image
   var photoUrl = Images.getPhotoURL(contact.photo);
   // Stores contact information in UI
   abUI.setState({
      contact: contact,
      photoUrl: photoUrl,
      editing: false
   });
   setTimeout(function(){
     DatabaseConnection.getContactDetails (abUI.state.contact.uuid, abUI),1000
   });

}


/**
 *  Finds a property within a contact
 * @param {Property} property The property to find
 * @param {Contact} contact The contact to search through
 * @returns {Property} property - the identical found property
 */
ContactParser.findCloneProperty = function(contact, property) {
   for(var j = 0; j < contact.jcards.length; j++) {
      var details = contact.jcards[j].getAllProperties(property.name);
      for (var i = 0; i < details.length; i++) {
         if (details[i].getValues().every(this.equals, property.getValues())) {
            return details[i];
         }
      }
   }
};


/**
 *  Checks if two properties are identical
 * @this Array of properties
 * @param {Property} element The property to check
 * @param {Integer} index The index of the other property
 */
ContactParser.equals = function(element, index) {
   if(Array.isArray(element)) {
      return element.every(ContactParser.equals, this[index]);
   }
   return element == this[index];
}

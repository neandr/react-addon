/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* @desc Provides a scrollable sidebar of all contacts as well as a locked header
* to support actions on contacts
*/

let ContactSidebar = props =>
  <div id="contacts-sidebar" className="contactsSidebar">
    <SidebarHeader
      searchNames={props.searchNames}
      clearNames={props.clearNames}
      searchTags={props.searchTags}
      tagCollection={props.tagCollection}
    />

    <div className="contactsList">
      {props.contactNames.map(function(contact) {

        var isSelected = typeof(props.selected) == 'number'
          ? false : props.selected && props.selected.indexOf(contact.id) > -1;

        return (
          <ContactButton
            contact={contact}
            image={contact.photo}
            viewContact={props.viewContact}
            selected={isSelected}
            key={"c" + contact.id}
          />
        );
      })}
    </div>
  </div>;

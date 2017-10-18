/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* @desc Provides a scrollable sidebar of all contacts as well as a locked header
* to support actions on contacts
*/

let ContactSidebar = props =>

  <div id="contactSidebar" className="wheel">
    <SidebarHeader
      searchNames={props.searchNames}
      clearSearchNames={props.clearSearchNames}
      searchTags={props.searchTags}
      tagCollection={props.tagCollection}
      contactDB={props.contactDB}
      contactID={props.contactID}
      listPos={props.listPos}
      abUI={props.abUI}
      abStatus={props.abStatus}
    />

    <div id="contactList" >
      <div className="flexAuto contactList noContact">
        {(props.contactID.slice(props.listPos, 14 + props.listPos))
          .map(function(contactid, index) {

            var p = props.contactID[props.listPos+index];
            var contact = ContactParser.searchContact(props.contactDB, 'id', p);
            // console.log(" sidebar  ", contactid, contact)

            var isSelected = (props.selectedIds.length == 0)
              ? false : (props.selectedIds && props.selectedIds.indexOf(contact.id) > -1);

            return (
              <ContactButton
                contactDB={props.contactDB}
                contact={contact}
                isSelected={isSelected}
                viewContact={props.viewContact}
                scrollContact={props.scrollContact}
                index={props.listPos+index}
              />
            );
          })
        }
      </div>

      <div id="contactList_Scroller" >
        <div className="contactList clBegin" onClick={event => props.click4Contact(event, props.contact)}>
          <img className="contactListArrow" src="images/up.png"/>
        </div>
        <div id="contactList_Scroll" className="contactList clScroll"
          onClick={event => props.click4Contact(event, props.contact)}>
          <div id="contactListScroll" style={props.contactListScroll}></div>
        </div>
        <div className="contactList clFlex"
          onClick={event => props.click4Contact(event, props.contact)}/>
        <div className="contactList clEnd" onClick={event => props.click4Contact(event, props.contact)}>
          <img className="contactListArrow" src="images/down.png"/>
        </div>
      </div>
    </div>

  </div>;

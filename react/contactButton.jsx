/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides a sidebar button for a contact.
* It displays their profile image, name and displays their contact when clicked
**/
let ContactButton = props => {
  let contactname;
  if (props.selected) {
    contactname = "true contact-name";
  } else {
    contactname = "contact-name";
  }

  let contact = props.contact;

  return (
    <div
      id="contact-name"
      className={contactname}
      onClick={event => props.viewContact(event, contact.id, contact.name, contact.uid, contact.listId)}
    >
      <ProfileImage
        type="sidebar"
        className="profile-img-sidebar"
        image={props.image}
      />
      <li className="contact-detail" key={contact.id}>
        {contact.name}
      </li>
    </div>
  );
};

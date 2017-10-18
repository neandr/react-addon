/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides a sidebar button for a contact.
* It displays their profile image, name and displays their contact when clicked
**/
let ContactButton = props => {
  let contactClass = (props.isSelected) ? "true contactList_name" : "contactList_name";
  //let contactClass = (props.isSelected) ? "true contact-name" : "contact-name";

  return (
    <div id={"cb" + props.index}
      className={contactClass}
      onClick={event => props.viewContact(event, props.contact)}
    >
      <ProfileImage
        type="sidebar"
        className="profile-img-sidebar"
        image={props.contact.photo}
      />

      <li className="contact-detail" key={props.contact.id}>
        {props.contact.name}
      </li>
    </div>
  );
};

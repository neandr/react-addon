/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* @desc Provides a scrollable sidebar of all contacts as well as a locked header
* to support actions on contacts
*/

var inLinestyles = inLinestyles || {}

  inLinestyles.contactsSidebar = {'display':'flex', 'flex-direction': 'column',
    'height':'100%'}

  inLinestyles.contactsList = {'flex':'1 1 auto', 'overflow-y':'auto', 'margin-left': '5%',
     'border-top': '1px solid #A5A8A4'}


  var ContactSidebar = (props) => (
  <div id="contacts-sidebar" style={inLinestyles.contactsSidebar}>
    <SidebarHeader add={props.add} export={props.export} import={props.import}/>

    <div id="contacts-list" style={inLinestyles.contactsList}>
        {props.contactNames.map(function(contact) {
          return <ContactButton
            contact={contact}
            image={contact.photo}
            viewContact={props.viewContact}
            selected={props.selected && props.selected.indexOf(contact.id) > -1}
            />
          })
        }
    </div>
  </div>
);

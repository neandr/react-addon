/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* @desc Provides a scrollable sidebar of all contacts as well as a locked header
* to support actions on contacts
*/
var iStyles = iStyles || {}

   iStyles.contactsSidebar = {'display':'flex', 'flexDirection': 'column',
      'height':'100%'}

   iStyles.contactsList = {'flex':'1 1 auto', 'overflowY':'auto', 'marginLeft': '5%',
     'borderTop': '1px solid #A5A8A4'}

   iStyles.abHeader={'height': '24px'}


var ContactSidebar = (props) => (
   <div id="contacts-sidebar" style={iStyles.contactsSidebar}>
      <SidebarHeader 
         stateModal={props.stateModal} 
         work={props.work} 
         add={props.add} 
         export={props.export} 
         import={props.import}
         searchNames={props.searchNames}
         clearNames={props.clearNames}
         searchTags={props.searchTags}

         tagCollection={props.tagCollection}
      />

      <div id="contacts-list" style={iStyles.contactsList}>
         {props.contactNames.map(function(contact) {
            return <ContactButton
               contact={contact}
               image={contact.photo}
               viewContact={props.viewContact}
               selected={props.selected && props.selected.indexOf(contact.id) > -1}
            />})
         }
      </div>
   </div>
);

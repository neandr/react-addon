/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides display of an address
*/
var AddressField = (props) => {
  let addressFields = props.fieldContent;
  if (addressFields.join('') == '') return (<div>{''}</div>)

  let count = 0;
  let items = {};

  return (
    <div style={inLinestyles.attributeContact}>
       <button className="buttons label"> {props.currentOption} </button>
       <div> {addressFields.map(function(addressLine) {
          items[count] = addressLine;
          count++;
          if (count == 5) {
            return (
              <div>{items[0]}<br/>{items[2]} {items[1]}<br/>{items[3]} / {items[4]}
              </div>);
          } 
        }
      )}
    </div>
   </div>
 );
}

/**
* Provides display of Notes with line break
*/
var NotesSection = (props) => {
  let notes = props.fieldContent;
  let noteLines = notes.split("\n");

  return (
    <div style={inLinestyles.attributeNotes}>
       <div> {noteLines.map(function(nLine) {
            return (
              <div style={inLinestyles.textNotes}>{nLine}</div>);
            }
           )}
       </div>
       <div>{' '}</div>
   </div>
 );
}

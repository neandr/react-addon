/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* @desc Provides display of an address
*/
var AddressField = (props) => {
  let addressFields = props.fieldContent;
  let count =0;
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

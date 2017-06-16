/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides an editable form for an address. It has 5 fields as well as the
* ability to set a type of address from options given.
*/
var AddressForm = React.createClass({
  /**
  * Saves the change in the address to temporary fields
  * @param event Event fired by user input
  **/
  updateContent: function(event) {
    var self = this;
    var address = AddressFields.map(function(field) {
      return self.refs[field].value;
    });
    this.props.updateContent(address, this.props.index);
  },

  /**
  * Saves the change in the address type (Home, Work) to temporary fields
  * @param event Event fired by change in address type
  **/
  updateOption: function(event) {
    this.props.updateOption(event.target.value, this.props.index);
  },


  render: function() {
    return (
        <table id="fieldXPOI">
        <tbody>
            <tr>
                <td><select onChange={this.updateOption} value={this.props.currentOption}>
                      {this.props.options.map(this.props.renderOption)}
                    </select>
                </td>

                <td>
                    <input type="text" ref={AddressFields[0]} 
                       placeholder={AddressFields[0]} defaultValue={this.props.fieldContent[0]} 
                   onChange={this.updateContent}></input></td>

                <td>
                    <button className="buttons remove" onClick={this.props.removeContactDetail}>-</button>
                </td>

            </tr>
            <tr>
                <td></td>
                <td><input type="text" ref={AddressFields[1]} 
                   placeholder={AddressFields[1]} defaultValue={this.props.fieldContent[1]} 
                   onChange={this.updateContent}></input></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="text" ref={AddressFields[2]} 
                   placeholder={AddressFields[2]} defaultValue={this.props.fieldContent[2]} 
                   onChange={this.updateContent}></input></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="text" ref={AddressFields[3]} 
                   placeholder={AddressFields[3]} defaultValue={this.props.fieldContent[3]} 
                   onChange={this.updateContent}></input></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="text" ref={AddressFields[4]} 
                   placeholder={AddressFields[4]} defaultValue={this.props.fieldContent[4]} 
                   onChange={this.updateContent}></input></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="text" ref={AddressFields[5]} 
                   placeholder={AddressFields[5]} defaultValue={this.props.fieldContent[5]} 
                   onChange={this.updateContent}></input></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="text" ref={AddressFields[6]} 
                   placeholder={AddressFields[6]} defaultValue={this.props.fieldContent[6]} 
                   onChange={this.updateContent}></input></td>
            </tr>
        </tbody>
        </table>
    );
  }
});

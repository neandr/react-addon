/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var iStyles = iStyles || {}

  iStyles.attributeContact= {'display':'flex', 'marginTop':'2px', 'fontSize': '0.9em'}
  iStyles.attributeNotes= { 'marginLeft':'15px','marginBottom':'10px', 'fontSize': '0.9em'}

  iStyles.plzCity= {'fontSize': '0.8em', 'fontWeight': 'bold'}
  iStyles.none=  {'display': 'none'}

/** -------------- CONTACT FIELDS -------------------------*/

var ContactField = React.createClass({
  saveContent: function(event) {
     this.props.onUserInput(event.target.value, this.props.index);
  },
  saveOption: function(event) {
     this.props.onUserSelect(event.target.value, this.props.index);
  },
  remove: function() {
     this.props.onUserDelete(this.props.index);
  },

  openUrl: function(url) {
     AddressbookUtil.openLink(url);
  },

  edit :function() {
    AddressBook.edit();
  },

  renderOption1: function(option) {
    var x = this.props.currentOption.toUpperCase();
    option = option.toUpperCase()

    var allOptions = this.props.options;
    var haveOption = false;
    for (var i =0; i < allOptions.length; i++){
      if (allOptions[i].toUpperCase() == x) {
         haveOption = true;
         break;
      }
    }
    if (!haveOption) {
       return (<option value={option}>{option}</option>)
    }

  },

  renderOption: function(option) {
    var x = this.props.currentOption.toUpperCase();
    option = option.toUpperCase()

    if (option == x)
      return (<option value={x} selected>{x}</option>)
    else
      return (<option value={option}>{option}</option>)
  },

  renderDisplayContactField : function() {
    if (this.props.type == "Address") {
      return (
        <AddressField
          fieldContent={this.props.fieldContent}
          currentOption={this.props.currentOption}
       />
      );
    }

    if (this.props.type == "Email") {
      return (
        <div style={iStyles.attributeContact}>
          <button className="buttons label"> {this.props.currentOption} </button>
          <a href={"mailto:"+ this.props.fieldContent}>{this.props.fieldContent}</a>
        </div>
      )
    }

    if (this.props.type == "Webpage") {
      let url = this.props.fieldContent;
      return (
        <div style={iStyles.attributeContact}>
          <button className="buttons label"> {this.props.currentOption} </button>
          <div id="contact-web" className="ulink" onClick={()=>this.openUrl(url)}> {url}</div>
        </div>
      )
    }

    return (
      <div style={iStyles.attributeContact}>
        <button className="buttons label"> {this.props.currentOption}</button>
        {this.props.fieldContent}
      </div>
    );
  },

  renderFormContactField : function() {
    if (this.props.type == "Address") {
      return <AddressForm
        currentOption={this.props.currentOption}
        saveOption={this.props.onUserSelect}
        renderOption={this.renderOption}
        options={this.props.options}
        remove={this.remove}
        saveContent={this.props.onUserInput}
        fieldContent={this.props.fieldContent}
        index={this.props.index}
      />
    }

    var removeButton = addButton= "buttons nobutton"
    if (this.props.editing) {
      removeButton = "buttons remove"
      addButton = "buttons add"
    }

    return (
      <table>
      <tbody>
        <tr>
          <td>
            <select onChange={this.saveOption} value={this.props.currentOption}>
              {this.renderOption1(this.props.currentOption)}
              {this.props.options.map(this.renderOption)}
            </select>
          </td>
          <td>
            <input type="text" ref="newText" 
              defaultValue={this.props.fieldContent} 
              className="form-control" 
              onChange={this.saveContent}>
            </input>
          </td>
          <td><button className={removeButton} onClick={this.remove} > - </button></td>

        </tr>
      </tbody>
      </table>
    )
  },


  render : function() {
    if (this.props.editing) {
      return this.renderFormContactField();
    } else {
      return this.renderDisplayContactField();
    }
  }
});

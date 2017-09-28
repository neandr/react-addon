/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** -------------- CONTACT FIELDS -------------------------*/

let ContactField = React.createClass({
  updateContent: function(event) {
    this.props.updateContent(event.target.value, this.props.index);
  },

  updateOption: function(event) {
    this.props.updateOption(event.target.value, this.props.index);
  },

  removeContactDetail: function() {
    this.props.removeContactDetail(this.props.index);
  },

  makeFirst: function() {
    this.props.makeFirst(this.props.index);
  },


  edit: function() {
    AddressBook.edit();
  },

  renderOption: function(option) {
    let x = this.props.currentOption.toUpperCase();
    option = option.toUpperCase();
    let isTrue = option == x;
    return (
      <option defaultValue={option} checked={isTrue}>
        {option}
      </option>
    );
  },

  renderDisplayContactField: function() {
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
        <div className="attributeContact">
          <button className="buttons label">
            {" "}{this.props.currentOption}{" "}
          </button>
          <a href={"mailto:" + this.props.fieldContent}>
            {this.props.fieldContent}
          </a>
        </div>
      );
    }

    if (this.props.type == "Webpage") {
      let url = this.props.fieldContent;
      return (
        <div className="attributeContact">
          <button className="buttons label">
            {" "}{this.props.currentOption}{" "}
          </button>
          <div
            id="contact-web"
            className="ulink"
            onClick={() => AddressbookUtil.openLink(url)}
          >
            {" "}{url}
          </div>
        </div>
      );
    }

    return (
      <div className="attributeContact">
        <button className="buttons label">
          {" "}{this.props.currentOption}
        </button>
        {this.props.fieldContent}
      </div>
    );
  },

  renderFormContactField: function() {
    if (this.props.type == "Address") {
      return (
        <AddressForm
          renderOption={this.renderOption}
          options={this.props.options}
          currentOption={this.props.currentOption}
          updateOption={this.props.updateOption}
          updateContent={this.props.updateContent}
          updateOption={this.props.updateOption}
          removeContactDetail={this.removeContactDetail}
          makeFirst={this.makeFirst}
          fieldContent={this.props.fieldContent}
          index={this.props.index}
        />
      );
    }

    let removeButton = (addButton = "buttons nobutton");
    if (this.props.editing) {
      removeButton = "buttons remove";
      addButton = "buttons add";
    }

    return (
      <table>
        <tbody>
          <tr>
            <td>
              <select
                onChange={this.updateOption}
                value={this.props.currentOption}
              >
                {this.renderOption(this.props.currentOption)}
                {this.props.options.map(this.renderOption)}
              </select>
            </td>
            <td>
              <input
                type="text"
                ref="newText"
                defaultValue={this.props.fieldContent}
                onChange={this.updateContent}
              />
            </td>
            <td>
              <button
                className={removeButton}
                onClick={this.removeContactDetail}
              >
                {" "}-{" "}
              </button>
            </td>
            <td>
              <button
                className="buttons first"
                onClick={this.makeFirst}
              >
                {" "}⇧{" "}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  },

  render: function() {
    if (this.props.editing) {
      return this.renderFormContactField();
    } else {
      return this.renderDisplayContactField();
    }
  }
});

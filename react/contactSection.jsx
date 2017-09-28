/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** -------------- CONTACT SECTION -------------------------*/
let ContactSection = React.createClass({
  addContactDetail: function() {
    // add a new Tel, Email etc
    this.props.addContactDetail(this.props.index);
  },

  removeContactDetail: function(fieldID) {
    this.props.removeContactDetail(this.props.index, fieldID);
  },

  makeFirst: function(fieldID) {
    this.props.makeFirst(this.props.index, fieldID);
  },

  updateContent: function(newText, i) {
    this.props.updateContent(newText, this.props.index, i);
  },

  updateOption: function(option, i) {
    this.props.updateOption(option, this.props.index, i);
  },

  renderNoContact: function() {
    return;
  },

  renderDisplayContactSection: function(field, i) {
    return (
      <ContactField
        key={field.fieldID}
        index={i}
        fieldContent={field.content}
        currentOption={field.currentOption}
        saveOption={this.props.saveOption}
        options={this.props.options}
        type={this.props.type}
        editing={false}
        ref={"field" + i}
      />
    );
  },

  renderFormContactSection: function(field, i) {
    return (
      <ContactField
        key={field.fieldID}
        index={i}
        fieldContent={field.content}
        currentOption={field.currentOption}
        options={this.props.options}
        type={this.props.type}
        editing={true}
        updateContent={this.updateContent}
        updateOption={this.updateOption}
        removeContactDetail={this.removeContactDetail}
        makeFirst={this.makeFirst}
        ref={"field" + i}
      />
    );
  },

  render: function() {
    if (this.props.editing) {
      return (
        //      edit mode
        <div className="contact-section">
          <div className="contact-group">
            {this.props.type}
          </div>
          {this.props.fields.map(this.renderFormContactSection)}

          <button className="buttons" onClick={this.addContactDetail}>
            Add
          </button>
        </div>
      );
    } else {
      return (
        //     display mode
        <div className="contact-section">
          <div className="contact-group">
            {this.props.type}
          </div>
          {this.props.fields.map(this.renderDisplayContactSection)}
        </div>
      );
    }
  }
});

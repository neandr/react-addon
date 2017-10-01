/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides display of an address
*/
let AddressField = props => {
  let addressFields = props.fieldContent;
  if (addressFields.join("") == "")
    return (
      <div>
        {""}
      </div>
    );

  let count = 0;
  let items = {};

  return (
    <div className="attributeContact">
      <button className="buttons label">
        {" "}{props.currentOption}{" "}
      </button>
      <div>
        {" "}{addressFields.map(function(addressLine) {
          items[count] = addressLine;
          count++;
          if (count == 7) {
            return (
              <div>
                <div className="displayNone">
                  {items[0]}
                </div>
                <div className="displayNone">
                  {items[1]}
                </div>
                <div className="plzCity">
                  {items[2]}
                </div>
                <div>
                  {items[5]} {items[3]}
                </div>
                <div>
                  {items[4]} {items[6]}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

/**
* Provides display of Notes with line break
*/
let NotesSection = React.createClass({
  render: function() {
    if (this.props.editing == false) {
      // to show notes/text with space for eg. indenting lines
      // in 'nLine' replace space with Unicode non-breaking space character
      let noteLines = this.props.notesContent.split("\n");
      let noteLine = 0;
      return (
        // just display
        <div className="textboxes">
          <div>
            {" "}{noteLines.map(function(nLine) {
              noteLine++;
              return (
                <div id={"nLine" + noteLine} key={"nLine" + noteLine} className="textNotes">
                  {nLine.replace(/\ /g, "\u00a0")}
                </div>
              );
            })}
          </div>
          <div> </div>
        </div>
      );
    } else {
      // this is editing
      return (
        <div className="textboxes">
          <textarea
            id="currentNotes"
            name="notes"
            defaultValue={this.props.notesContent}
            onChange={this.props.notesChanged}
          />
        </div>
      );
    }
  }
});

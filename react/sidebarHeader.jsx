/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides a header to the contact sidebar. It allows importing and exporting
* of contacts as well as creating new ones. It also provides a search bar for filtering contacts
**/


// Hamburger MenuButton defined with  svg
/*  See also 'standard thunderbird'
    <toolbarbutton id="button-appmenu" class="toolbarbutton-1 button-appmenu"
      label="AppMenu" tooltiptext="Display the Thunderbird Menu" removable="true"/>
*/
let AB_header = props =>
  <div className="abTopLine">
    <button className="hamburger" onClick={props.showHH}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
        <path d="M0 0h18v18h-18z" fill="none"/>
        <path d="M2 13.5h14v-1.5h-14v1.5zm0-4h14v-1.5h-14v1.5zm0-5.5v1.5h14v-1.5h-14z"/>
      </svg>
    </button>

    <div className="abStatusLines">
      <div className="abStatus">
        <label id="AB_Status">
          {props.abStatus}
        </label>
      </div>

      <div id="errorStatus" className="errorStatus" style={ { display: 'none' } } >
        <label className="errorLink" onClick={props.errorLink}>
          {"vContact Error"}
        </label>
        <label id="AB_Error">
          {props.abError}
        </label>
      </div>
    </div>
  </div>;

let SidebarHeader = React.createClass({

  componentDidMount: function() { //TODO   add event to component only !
    document.addEventListener("wheel", event => this.scrollContacts(event));
  },

  oldT: 0,

  scrollContacts: function(event) {
    console.log("scrollContacts  className:", event.target.className, " id:", event.target.id);

    if (event.target.className.search("contactList") > -1) {
      var newT = new Date();

      if ((newT - this.oldT) > 100) {
        this.oldT = newT;

        var inkr = (event.deltaY > 0) ? 1 : -1;
        var a = this.props.listPos + inkr;
        a = a > this.props.contactID.length -1 ? this.props.contactID.length -1 : a;
        a = a < 0 ? 0:a;
        this.props.abUI.setState({
          abStatus: "new pointer: " + a,
          listPos: a
        });
      }
    }
  },

  renderTag1: function() {
    return (
      <option value={"%none%"} key={"--"}>
        {" -- "}
      </option>
    );
  },

  renderTags: function(tag) {
    return (
      <option value={tag} key={tag}>
        {tag}
      </option>
    );
  },

  render: function() {
    return (
      <div id="sidebar-header">

        <div className="searchTagMenu">
          <img
            className="inputIcon"
            src="images/glyphicons_065_tag.png"
          />

          <select
            id="selectedTag"
            className="searchTagsSelect"
            onChange={this.props.searchTags}
          >
            {this.renderTag1(this.props.currentOption)}
            {this.props.tagCollection.map(this.renderTags)}
          </select>
        </div>

        <div className="searchBar">
          <img
            className="inputIcon"
            src="images/glyphicons_027_search.png"
          />
          <input
            id="searchNames"
            className="searchNames"
            type="text"
            placeholder="Search Given- FamilyName "
            onChange={this.props.searchNames}
            value={this.props.searchNamesValue}
          />
          <img
            id="clearSearchNames"
            className="inputIconRight"
            onClick={this.props.clearSearchNames}
            src="images/glyphicons_207_remove_2.png"
          />
        </div>

      </div>
    );
  }
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides a header to the contact sidebar. It allows importing and exporting
* of contacts as well as creating new ones. It also provides a search bar for filtering contacts
**/

  var sidebarheaderStyle={'margin-bottom':'5px'}
  var widthAuto={'width':'auto', 'margin': '5%'}
  var displayFlex={'display':'flex', 'margin-top': '10px'}

   //       <button className="buttons work" onClick={props.work}>{'\u2630'}</button>
   //  <button className="buttons work" onClick={this.Addressbook.openModal.bind(null, 'work')}>{'\u2630'}</button>
   //        <button className="buttons work" onClick={props.stateModal.openModal.bind(null, 'work')}>{'\u2630'}</button>

var SidebarHeader = (props) => (
  <div id="sidebar-header" style={sidebarheaderStyle}>
	<div style={displayFlex}>
		<div style={widthAuto}>
	      <input className="search-bar" type="text" name ="search" placeholder="Search"></input>
	      <input className="search-bar" type="text" name ="searchtag" placeholder="Tags"></input>
	    </div>
       <button className="buttons work" onClick={props.stateModal.bind(null, 'work')}>{'\u2630'}</button>


    </div>

    <span id="sidebar-buttons">
      <button className="buttons" onClick={props.export}>Export</button>
      <button className="buttons" onClick={props.import}>Import</button>
      <button className="buttons" onClick={props.add}>+</button>
    </span>
  </div>
);

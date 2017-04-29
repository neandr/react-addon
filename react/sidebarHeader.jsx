/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides a header to the contact sidebar. It allows importing and exporting
* of contacts as well as creating new ones. It also provides a search bar for filtering contacts
**/

  var iStyles = iStyles || {}

  iStyles.sidebarheader={'marginBottom':'5px'}
  iStyles.displayFlex={'display':'flex'}

  iStyles.inputIcon={ 'position': 'relative', 
     'left': '14px', 'top': '10px', 'width': '14px', 'height': '14px'}

  iStyles.inputIconR={ 'position': 'relative',   'display': 'none',         //  gWTODO  dispaly disabled - doesn't clear the box!!
     'left': '-24px', 'top': '10px', 'width': '14px', 'height': '14px'}


  iStyles.searchNamesBox={'flex':'1', 
      'marginLeft':'-5px', 'marginRight':'10px', 'marginTop':'5px', 
      'paddingLeft':'24px', 'paddingRight':'24px'};

  iStyles.searchTagsSelect={'flex':'1', 
      'marginLeft':'-5px', 'marginRight':'10px', 'marginTop':'5px', 
      'paddingLeft':'20px', 'paddingRight':'24px'};

  iStyles.abStatus={'float':'right','fontSize': '0.6em', 'margin':'2px'};      //gWStatus


// Hamburger MenuButton defined with  {'\u2630'} defined in
//   <button class="hamburger">☰</button>


var AB_header = (props) => (
    <div>
      <button className="hamburger" onClick={props.show_HH}>{'\u2630'}</button>

      <div style={iStyles.abStatus}>
        <text id="AB_Status" >{props.abStatus}</text>

      </div>
    </div>
);

var SidebarHeader = React.createClass({

  renderTag1: function(){
    return (<option value={'%none%'}>{' -- '}</option>)
  },

  renderTags: function(tag){
    return (<option value={tag}>{tag}</option>)
  },

  render: function() {
    return (
      <div id="sidebar-header" style={iStyles.sidebarheader}>

        <div style={iStyles.displayFlex}>
          <img className="side-profile-img" style={iStyles.inputIcon} src="images/glyphicons_027_search.png"/>
          <input id="searchNames" className="search-bar" style={iStyles.searchNamesBox} type="text" 
            name ="searchname" placeholder="Search given- familyName "
            onChange={this.props.searchNames} value={this.props.searchNamesValue}>
          </input>
          <img id="clearNames" className="side-profile-img"  onClick={this.props.clearNames}  style={iStyles.inputIconR} 
             src="images/glyphicons_207_remove_2.png"/>
        </div>


        <div style={iStyles.displayFlex}>
          <img className="side-profile-img" style={iStyles.inputIcon} src="images/glyphicons_065_tag.png"/>

            <select onChange={this.props.searchTags} style={iStyles.searchTagsSelect}>
              {this.renderTag1(this.props.currentOption)}
              {this.props.tagCollection.map(this.renderTags)}
            </select>

        </div>

      </div>
    );
  }

});

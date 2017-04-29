/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var iStyles = iStyles || {}

  iStyles.abContact={'display': 'flex'};
  iStyles.textNick={'fontSize': '0.9em',  'fontStyle': 'italic'};
  iStyles.textRev={'marginTop':'0.5em', 'fontSize': '0.5em'};
  iStyles.displayStatus={'display':'block','fontSize': '1.4vw'};


var ContactHeader = React.createClass({

  displayStatus(element) {
    return (this.props.personalDetails[element].content ?  iStyles.displayStatus : {'display':'none'})
  },

  saveContent(detail) {
    let cName = detail.target.name;
    this.props.onUserInput(cName, this.refs[cName].value);
  },

  saveImage() {
    this.props.onNewImage(this.imageFile);
  },

  clickedImage(){
    //clicks the input file upload button.
    this.imageFile.click();
  },

  clickedSource() {
    console.log(" Display the vCard Source");
    alert(" Display the vCard Source");
    event.preventDefault();
  },

  renderDisplayContactHeader() {   // UTF8 symbols  https://www.key-shortcut.com/en/all-html-entities/all-entities/
    var _hBox = {'height':'1.5em'}
    var _cursiv = {'fontStyle': 'italic'}
    var genderSymbol = this.props.personalDetails.gender.content
    if (genderSymbol){
      genderSymbol = ((genderSymbol == 'M') ? ('\u2642') : ('\u2640'));
    } else {
      genderSymbol = '\u2665';
    }

    return (
      <div id="ab-main-contact" style={iStyles.abContact}>
        <img type="header" id="profile-img" className={"profile-img"} src={this.props.image}
            onClick={this.clickedSource}
        />

        <div id="ab-main-contact-header">
           <h4>{this.props.personalDetails.name.content}</h4>

           <div style={_hBox}>
             <div style={this.displayStatus("n")}>{this.props.personalDetails.n.content}</div>
           </div>

           <div style={_hBox}>
             <div style={this.displayStatus("nickname")}> 
               <description style={_cursiv}> {'\u263A '} {this.props.personalDetails.nickname.content}</description>
             </div>
           </div>

           <div style={_hBox}>
             <div style={this.displayStatus("bday")}> {genderSymbol} {this.props.personalDetails.bday.content}</div>
           </div>

           <div style={_hBox}>
             <div style={this.displayStatus("anniversary")}> {'\u263C '} {this.props.personalDetails.anniversary.content}</div>
           </div>

           <div style={iStyles.textRev}>Rev {this.props.personalDetails.rev.content}</div>
         </div>
      </div>
    );
  },


  renderFormContactHeader() {
    let iClass="profile-img editing" 
    return (
      <div id="header" style={iStyles.abContact}>
        <div id="profile-img">
          <img id="contactImage" className={iClass} onClick={this.clickedImage} src={this.props.image}/>
          <input className="buttons nobutton" type="file" ref={(ref) => this.imageFile = ref} 
             name="profile-picture" accept="image/*" 
             onChange={(evt) => this.saveImage(evt)}/>
        </div>

        <div id="ab-main-contact-header">
          <table id="header-field">
            <tbody>
            <tr>
              <td><input type="text" ref="name"  name="name" 
                  defaultValue={this.props.personalDetails.name.content} 
                  placeholder="Name" className="form-control" 
                  onChange={this.saveContent}></input>
              </td>
            </tr>
            <tr>
              <td><input type="text" ref="nickname" name="nickname" 
                  defaultValue={this.props.personalDetails.nickname.content} 
                  placeholder="Nickname" className="form-control" 
                  onChange={this.saveContent}></input>
              </td>
            </tr>
            <tr>
              <td><input type="text" ref="n" name="n" 
                  defaultValue={this.props.personalDetails.n.content}
                  placeholder="Display name" className="form-control" 
                  onChange={this.saveContent}></input>
              </td>
            </tr>
            <tr>
              <td><input type="text" ref="bday" name="bday" 
                  defaultValue={this.props.personalDetails.bday.content} 
                  placeholder="Birthday" className="form-control" 
                  onChange={this.saveContent}></input>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  },

  render() {
    if (this.props.editing) {
      return this.renderFormContactHeader();
    }
    return this.renderDisplayContactHeader();
  }
});

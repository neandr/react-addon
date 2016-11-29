/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var inLinestyles = inLinestyles || {}

  inLinestyles.abContact={'display': 'flex'};
  inLinestyles.textNick={'font-size': '0.9em',  'font-style': 'italic'};
  inLinestyles.textRev={'margin-top':'0.5em', 'font-size': '0.5em'};


var Header = React.createClass({

  displayStatus(element) {
    return (this.props.personalDetails[element].content ?  {'display':'block'} : {'display':'none'})
  },

  saveContent(detail) {
    this.props.onUserInput(detail, this.refs[detail].value);
  },
  saveImage() {
    this.props.onNewImage(this.imageFile);
  },

  clickedImage(){
    //clicks the input file upload button.
    this.imageFile.click();
  },

  renderDisplay() {
    var hBox = {'height':'1.5em'}
    var cursiv = {'font-style': 'italic'}
    var genderSymbol = this.props.personalDetails.gender.content
    if (genderSymbol) 
        genderSymbol = ((genderSymbol == 'M') ? ('\u2642') : ('\u2640'))

    return (
      <div id="ab-main-contact" style={inLinestyles.abContact}>
          <ProfileImage type="header" id="profile-img" className="profile-img" image={this.props.image}/>
        <div id="ab-main-contact-header">
          <h4>{this.props.personalDetails.name.content}</h4>

          <div style={hBox}>
             <div style={this.displayStatus("n")}>{this.props.personalDetails.n.content}</div>
          </div>

          <div style={hBox}>
             <div style={this.displayStatus("nickname")}> 
                <description> {'\u263A '} </description>
                <description style={cursiv}> {this.props.personalDetails.nickname.content}</description>
             </div>
          </div>

          <div style={hBox}>
             <div style={this.displayStatus("bday")}> {genderSymbol} {this.props.personalDetails.bday.content}</div>
          </div>

          <div style={hBox}>
             <div style={this.displayStatus("anniversary")}> {'\u263C '} {this.props.personalDetails.anniversary.content}</div>
          </div>

          <div style={inLinestyles.textRev}>Rev {this.props.personalDetails.rev.content}</div>
        </div>
      </div>
    );
  },

  renderForm() {
    var click = this.clickedImage.bind(this);
    return (
      <div id="header">
        <div id="profile-img">
          <ProfileImage imageClick={click} type="header" id="profile-img" className="profile-img editing" 
             image={this.props.image}/>
          <input className="buttons nobutton" type="file" ref={(ref) => this.imageFile = ref} 
             name="profile-picture" accept="image/*" 
             onChange={(evt) => this.saveImage(evt)}/>
        </div>
        <div id="header-text">
          <table id="header-field">
            <tr>
              <td><input type="text" ref="name" defaultValue={this.props.personalDetails.name.content} 
                  placeholder="Name" className="form-control" 
                  onChange={this.saveContent.bind(null, "name")}></input>
              </td>
            </tr>
            <tr>
              <td><input type="text" ref="nickname" defaultValue={this.props.personalDetails.nickname.content} 
                  placeholder="Nickname" className="form-control" 
                  onChange={this.saveContent.bind(null, "nickname")}></input>
              </td>
            </tr>
            <tr>
              <td><input type="text" ref="n" defaultValue={this.props.personalDetails.n.content}
                  placeholder="Display name" className="form-control" 
                  onChange={this.saveContent.bind(null, "n")}></input>
              </td>
            </tr>
            <tr>
              <td><input type="text" ref="bday" defaultValue={this.props.personalDetails.bday.content} 
                  placeholder="Birthday" className="form-control" 
                  onChange={this.saveContent.bind(null, "bday")}></input>
              </td>
            </tr>
          </table>
        </div>
    </div>
    );
  },
  render() {
    if (this.props.editing) {
      return this.renderForm();
    }
    return this.renderDisplay();
  }
});

ReactDOM.render(
    <Header />, document.getElementById('header-text'));

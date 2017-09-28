/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let ContactHeader = React.createClass({
  getInitialState: function() {
    return {
      genderSelected: "?"
    };
  },

  genderChanged: function(e) {
    let eValue = e.currentTarget.value;
    this.setState({
      genderSelected: eValue
    });
    this.props.personalDetails.gender.content = eValue;
  },

  displayStatus(element) {
    let displayBlock = { display: "block" };
    let displayNone = { display: "none" };

    return this.props.personalDetails[element].content
      ? displayBlock
      : displayNone;
  },

  personalDetailChanged(detail) {
    let cName = detail.target.name;
    let cValue = detail.target.value.trim();

    if (cName == "n") {
      let position = ["lName", "fName", "mName", "prefix", "suffix"].indexOf(
        detail.target.id
      );
      if (position != -1) {
        let cN = this.props.personalDetails.n;
        cN.property.jCal[3][position] = cValue;
        cN.content = cN.property.jCal[3].join(",");
        this.props.personalDetails.n = cN;
      }
    } else {
      this.props.onUserInput(cName, cValue);
    }
  },

  saveImage() {
    this.props.onNewImage(this.imageFile);
  },

  clickedImage() {
    //clicks the input file upload button.
    this.imageFile.click();
  },

  renderDisplayContactHeader() {
    //    UTF8 symbols  https://www.key-shortcut.com/en/all-html-entities/all-entities/

    let genderSymbol = this.props.personalDetails.gender.content;
    if (genderSymbol == "M") {
      genderSymbol = "\u2642";
    } else {
      if (genderSymbol == "F") {
        genderSymbol = "\u2640";
      } else {
        genderSymbol = "\u2665";
      }
    }

    return (
      <div id="ab-main-contact" className="displayFlex">
        <img
          type="header"
          id="profile-img"
          className={"profile-img"}
          src={this.props.image}
        />

        <div id="ab-main-contact-header">
          <h4>
            {this.props.personalDetails.name.content}
          </h4>

          <div className="contactBox">
            <div style={this.displayStatus("n")}>
              {this.props.personalDetails.n.content}
            </div>
          </div>

          <div className="contactBox">
            <div style={this.displayStatus("nickname")}>
              <description className="cursiv">
                {" "}{"\u263A "} {this.props.personalDetails.nickname.content}
              </description>
            </div>
          </div>

          <div className="contactBox">
            <div style={this.displayStatus("bday")}>
              {" "}{genderSymbol} {this.props.personalDetails.bday.content}
            </div>
          </div>

          <div className="contactBox">
            <div style={this.displayStatus("anniversary")}>
              {" "}{"\u263C "} {this.props.personalDetails.anniversary.content}
            </div>
          </div>

          <div className="textRev">
            Rev {this.props.personalDetails.rev.content}
          </div>
        </div>
      </div>
    );
  },

  renderFormContactHeader() {
    let iClass = "profile-img editing";

    let personalDetails = this.props.personalDetails;

    //TODO  N 'value type' component can have multiple values, eg:              //TODO
    // ["n", {}, "text", ["Perreault", "Bob", ["Joe", "Peter"], "Dr.", ["ing. jr", "M.Sc."]] ],
    //      .split will resolve to a no structured comma separated string, so the sequence is unclear!
    //  Need to resolve it differently!
    let aNameDetails = personalDetails.n.content.split(",");
    let names = aNameDetails[1] + " " + aNameDetails[0];

    return (
      <div id="header" className="displayFlex">
        <div id="profile-img">
          <img
            id="contactImage"
            className={iClass}
            onClick={this.clickedImage}
            src={this.props.image}
          />
          <input
            className="buttons nobutton"
            type="file"
            ref={ref => (this.imageFile = ref)}
            name="profile-picture"
            accept="image/*"
            onChange={evt => this.saveImage(evt)}
          />
        </div>

        <div id="ab-main-contact-header">
          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Prefix"}
            </div>
            <input
              id="prefix"
              type="text"
              ref="n"
              name="n"
              defaultValue={aNameDetails[3]}
              placeholder="Prefix"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"First name"}
            </div>
            <input
              id="fName"
              type="text"
              ref="n"
              name="n"
              defaultValue={aNameDetails[1]}
              placeholder="First"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Middle name"}
            </div>
            <input
              id="mName"
              type="text"
              ref="n"
              name="n"
              defaultValue={aNameDetails[2]}
              placeholder="Middle"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Last name"}
            </div>
            <input
              id="lName"
              type="text"
              ref="n"
              name="n"
              defaultValue={aNameDetails[0]}
              placeholder="Last"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Suffix"}
            </div>
            <input
              id="suffix"
              type="text"
              ref="n"
              name="n"
              defaultValue={aNameDetails[4]}
              placeholder="Suffix"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Nick"}
            </div>
            <div className="sym">
              {" "}{"\u263A"}
            </div>
            <input
              type="text"
              ref="nickname"
              name="nickname"
              defaultValue={personalDetails.nickname.content}
              placeholder="Nick name"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Birthday"}
            </div>
            <div className="sym">
              {" "}{"\u2665"}
            </div>
            <input
              type="text"
              ref="bday"
              name="bday"
              defaultValue={personalDetails.bday.content}
              placeholder="Birthday"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Anniversay"}
            </div>
            <div className="sym">
              {" "}{"\u263C "}
            </div>
            <input
              type="text"
              ref="anniversary"
              name="anniversary"
              defaultValue={personalDetails.anniversary.content}
              placeholder="Anniversary"
              onChange={this.personalDetailChanged}
            />
          </div>

          <div className="flexRow">
            <div className="contactLabel">
              {" "}{"Gender"}
            </div>

            <div className="radio" className="displayFlex">
              <label className="center">
                <input
                  type="radio"
                  value=""
                  checked={personalDetails.gender.content === ""}
                  onChange={this.genderChanged}
                />
                {""}
              </label>

              <label className="center">
                <input
                  type="radio"
                  value="M"
                  checked={personalDetails.gender.content === "M"}
                  onChange={this.genderChanged}
                />
                {"\u2642"} male
              </label>

              <label className="center">
                <input
                  type="radio"
                  value="F"
                  checked={personalDetails.gender.content === "F"}
                  onChange={this.genderChanged}
                />
                {"\u2640"} female
              </label>
            </div>
          </div>
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

/*
  *   Hamburger Setup
  */

let HHmenu = props =>
  <div id="hambgMenu" className="hambgMenu" onClick={props.closeHH}>
    <div className="hhStyle">
      <div className="hhHeader">
        {"vContacts Main Menu"}
      </div>
      <div className="hambgLink" onClick={props.addContact}>
        {"Add new Contact"}
      </div>

      <div className="hambgLink" onClick={props.openMailto}>
        {"Mailto selected Contact(s)"}
      </div>

      <hr />
      <div className="hambgLink" onClick={props.tag_Support}>
        {"Tag Support **tbd**"}
      </div>
      <div className="hambgLink" onClick={props.import}>
        {"Import Contacts from File (VCF/LDIF)"}
      </div>
      <div className="hambgLink" onClick={props.export}>
        {"Export Contacts to File (VCF)"}
      </div>

      <hr />
      <div className="hambgLink" onClick={props.delete_Contact}>
        {"Delete selected Contact(s)"}
      </div>
      <div className="hambgLink" onClick={props.delete_DB}>
        {"Reset Database (Remove all Contacts)"}
      </div>

      <div className="hambgLink" onClick={props.showContactRaw}>
        {"Show selected Contact raw format"}
      </div>
      <hr />
      <div
        className="hambgLink"
        onClick={() =>
          AddressbookUtil.openLink(
            "https://neandr.github.io/vContacts/notes.txt"
          )}
      >
        {"Notes/Status"}
      </div>
      <div
        className="hambgLink"
        onClick={() =>
          AddressbookUtil.openLink(
            "https://neandr.github.io/vContacts/References.html"
          )}
      >
        {"References"}
      </div>
      <hr />
      <div
        className="hambgLink"
        onClick={() =>
          AddressbookUtil.openLink(
            "https://github.com/neandr/vContacts/blob/master/README.md"
          )}
      >
        {"Readme on Git"}
      </div>
      <div
        className="hambgLink"
        onClick={() =>
          AddressbookUtil.openLink(
            "https://github.com/neandr/vContacts/blob/master/STATUS.md"
          )}
      >
        {"Refactor the VUW project - Status as of Nov.29 2016"}
      </div>
    </div>

    <div className="hambgRev">{props.abRev}</div>
  </div>;

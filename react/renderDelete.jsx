let ContactDelete = props =>
  <ReactModal isOpen={true} contentLabel="Modal" className="modal-delete">
    <div>
      <h3>
       »{props.selectedIds.length}« {" CONTACT(S) WILL BE DELETED! "}
      </h3>

      <h4 className="centerText">Do you really want to do this?</h4>
      <div>
        <button className="buttons" onClick={props.confirmed}>
          Yes
        </button>
        <button className="buttons" onClick={props.noGo}>
          No
        </button>
      </div>
    </div>
  </ReactModal>;

let DBdelete = props =>
  <ReactModal isOpen={true} contentLabel="Modal" className="modal-delete">
    <h3 className="centerText">
      <b>DATABASE RESET</b>
    </h3>

    <div id="dbdelete">
      <h4 className="centerText">Do you really want to do this?</h4>
      <div>
        <button className="buttons" onClick={props.confirmed}>
          Yes
        </button>
        <button className="buttons" onClick={props.noGo}>
          No
        </button>
      </div>
    </div>
    <div id="closeTag" className="displayNone">
      <h4 className="centerText">Database has been deleted!</h4>
      <h4 className="centerText">
        Close the vContacts tab and reopen to start over.
      </h4>
    </div>
  </ReactModal>;

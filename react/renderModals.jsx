

var ContactDelete = (props) => (
   <ReactModal
      isOpen={true}
      contentLabel="Modal"
      className="modal"
   >
   <div>
      <h3>DELETE THE CONTACT ″{props.name}″ </h3>
      <h4 style={iStyles.centerText}>Do you really want to do this?</h4>
      <div>
         <button className="buttons" onClick={props.confirmDelete}>Yes</button>
         <button className="buttons" onClick={props.noDelete}>No</button>
      </div>
   </div>
   </ReactModal>
);

var DBdelete = (props) => (
   <ReactModal
      isOpen={true}
      contentLabel="Modal"
      className="modal"
   >
   <h3 style={iStyles.centerText}><b>DATABASE RESET</b></h3>

   <div id="dbdelete">
      <h4 style={iStyles.centerText}>Do you really want to do this?</h4>
      <div>
         <button className="buttons" onClick={props.confirmDelete}>Yes</button>
         <button className="buttons" onClick={props.noDelete}>No</button>
      </div>
   </div>
   <div id="closeTag" style={iStyles.displayNone}>
      <h4 style={iStyles.centerText}>Database has been deleted!</h4>
      <h4 style={iStyles.centerText}>Close the vContacts tab and reopen to start over.</h4>
   </div>
   </ReactModal>


);
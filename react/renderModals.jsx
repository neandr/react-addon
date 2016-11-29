var DeleteModal = (props) => (
  <ReactModal
  isOpen={true}
  contentLabel="Modal"
  className="modal"
  >
    <h3>DELETE THE CONTACT ″{props.name}″ </h3>
    <h4 style={inLinestyles.centerText}>Do you really want to do this?</h4>
    <div>
       <button className="buttons" onClick={props.confirmDelete}>Yes</button>
       <button className="buttons" onClick={props.noDelete}>No</button>
    </div>
  </ReactModal>
);

var WorkModal = (props) => (
  <ReactModal
  isOpen={true}
  contentLabel="Modal"
  className="modal"
  >
    <h3 style={inLinestyles.centerText}><b>RESET THE DATABASE</b></h3>
    <h4 style={inLinestyles.centerText}>Do you really want to do this?</h4>
    <div>
       <button className="buttons" onClick={props.confirmDelete}>Yes</button>
       <button className="buttons" onClick={props.noDelete}>No</button>
    </div>
  </ReactModal>
);
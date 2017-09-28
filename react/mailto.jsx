
let MailTo = props => {

  return (
    <ReactModal isOpen={props.isOpen} contentLabel="Modal" className="mailtoStyle">
      <div className="centerText">
        <h4>
          {"Collected 'Mailto' addresses: "} »{props.selectedIds.length}«
        </h4>

        <div>
          <textarea
            className="currentMailto"
            name="mailto"
            defaultValue={props.selectedMailto}
          />
        </div>

        <div className="inlineFlex">
          <button onClick={props.onRequestMailto.bind(null, "")}>mailto</button>
          <button onClick={props.onRequestMailto.bind(null, "CC")}>mailto CC</button>
          <button onClick={props.onRequestMailto.bind(null, "BCC")}>mailto BCC</button>
          <button onClick={props.onRequestMailto.bind(null, "C&P")}>Copy mailto </button>
          <div style={{ width: 50 }}/>
          <button onClick={props.onRequestClose}>close</button>
        </div>

      </div>
    </ReactModal>
  );
};

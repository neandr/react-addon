/** -------------- SIDEBAR -------------------------*/
var ContactSidebar = React.createClass({
  add: function(){
  },
  delete: function(){
  },
  import: function(){
  },
  export: function(){
  },
  displayContact: function(contact) {
    this.props.viewContact(contact.id);
  },
  renderName: function(contact){
console.log("renderName: ", contact.name, contact.id);		//XXX
console.trace();
    var style = {'background-color': ''};

    if(contact.id==this.props.currentID){
      style = {'background-color': '#ccc'};
    }
	var cDetail = 'contact-detail'
    return (
      <div id="contact-item" >
        <li key={this.props.contactNames} className={cDetail}  style={style} 
             onClick={this.displayContact.bind(null, contact)}>{contact.name}</li>
      </div>
    );
  },
  render: function() {
      return (
          <div>
            <div id="sidebar-header">
              <div>
                <input id="search-bar" type="text" name ="search" placeholder="Search"></input>
              </div>
              <span id="sidebar-buttons">
                <button id="buttons" onClick={this.export}>Export</button>
                <button id="buttons" onClick={this.import}>Import</button>
                <button id="buttons" onClick={this.add}>+</button>
              </span>
            </div>
            <br />
            <div id="contacts-list">
                {this.props.contactNames.map(this.renderName)}
            </div>
          </div>
      );
  },
});

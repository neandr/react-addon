/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cu = Components.utils;

Cu.import("resource://react/lib/ical.1.2.2.js");

const description = "IndexedDB based Addressbook";
const UUID = "{7FBFCC76-48B6-11E6-9353-C50CE7BF5E87}";
const contractID = "@maddrbook/Addressbook;1";

const DB_NAME = 'addrbook';
const CONTACTS_STORE_NAME = 'contacts';
const DB_VERSION = 2;

const DB_ERR_NOT_CONN = "Connection to the database has not been opened, please make sure you called Addressbook.open()";


/**
* @constructor
* @param idb - IndexedDB Factory
**/
function Addressbook(idb) {
  this.indexedDB = idb;
}

/**
* Creates and opens databse.
* @param idb - IndexedDB Factory
**/
Addressbook.open = function(idb) {
  return new Addressbook(idb).open();
};

Addressbook.prototype = {
  // properties required for XPCOM registration:
  classDescription: description,
  classID:          Components.ID(UUID),
  contractID:       contractID,

  /**
  * Open connection with db.
  * @returns {Promise} - promise of open connection to db.
  **/
  open: function() {
    var self = this;
    var indexedDB = this.indexedDB;

    return new Promise(function(resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = function(event) {
        self._onsuccess(event);
        resolve(self);
      };

      request.onerror = function(event) {
        self._onerror(event);
        reject(event.target.error);
      };

      request.onupgradeneeded = function(event) {
        self._onupgradeneeded(event);
      };
    });
  },

  _onsuccess: function(event) {
    this._db = event.target.result;

    if (this.onsuccess !== undefined) {
      this.onsuccess(event);
    }
  },

  _onerror: function(event) {
    if (this.onerror !== undefined) {
      this.onerror(event);
    }
  },

  _onupgradeneeded: function(event) {
    var db = event.target.result;

    // setup our object stores
    var contactsStore = db.createObjectStore(CONTACTS_STORE_NAME,
      { keyPath: "uuid", autoIncrement: true });

    /**
    * Set up indexes for db
    **/
    contactsStore.createIndex("name", "name", { unique: false });
    contactsStore.createIndex("email", "email", { unique: false });
    /**
     * Set up seed data for mock db
    **/
    contactsStore.add({ name: "Simon Perreault",
      email: "simon.perreault@viagenie.ca",
      jcards: [
        ["vcard", [
          ["version", {}, "text", "4.0"],
          ["uid", {}, "text", "22b4a62a-8a75-4e9d-9df6-709c2aec71b5"],
          ["fn", {}, "text", "Simon Perreault"],
          ["n", {}, "text", ["Perreault", "Simon", "", "", ["ing. jr", "M.Sc."]]],
          ["bday", {}, "date-and-or-time", "--02-03"],
          ["anniversary", {}, "date-and-or-time", "2009-08-08T14:30:00-05:00"],
          ["gender", {}, "text", "M"],
          ["categories", {}, "text", ["Business", "Golf", "Holiday"]],
          ["lang", { "pref": "1" }, "language-tag", "fr"],
          ["lang", { "pref": "2" }, "language-tag", "en"],
          ["org", { "type": "work" }, "text", "Viagenie"],
          ["adr", { "type": "work" }, "text", ["", "Suite D2-630", "2875 Laurier", "Quebec", "QC", "G1V 2M2", "Canada"]],
          ["tel", { "type": ["mobil", "voice"], "pref": "1" }, "uri", "tel:+1-418-656-9254;ext=102"],
          ["tel", { "type": ["work", "cell", "voice", "video", "text"] }, "uri", "tel:+1-418-262-6501"],
          ["email", { "type": "home" }, "text", "simon.perreault@viagenie.ca"],
          ["geo", { "type": "work" }, "uri", "geo:46.772673,-71.282945"],
          ["key", { "type": "work" }, "uri", "http://www.viagenie.ca/simon.perreault/simon.asc"],
          ["tz", {}, "utc-offset", "-05:00"],
          ["url", { "type": "home" }, "uri", "http://nomis80.org"],
          ["note", {}, "text", "This is a Note text - one liner"]
        ]]
      ]
    });

    contactsStore.add({ name: "Bob Perreault",
      email: "bob.perreault@viagenie.ca",
      jcards: [
        ["vcard", [
          ["version", {}, "text", "4.0"],
          ["uid", {}, "text", "e3ea2bf3-f597-4b08-bd4c-0a26b27f4501"],
          ["fn", {}, "text", "Bob Perreault"],
          ["n", {}, "text", ["Perreault", "Bob", "Joe", "Dr.hc", ["ing. jr", "M.Sc."]]],
          ["nickname", {}, "text", "pBob,Perri"],
          ["categories", {}, "text", ["Golf"]],
          ["bday", {}, "date-and-or-time", "1980-02-03"],
          ["anniversary", {}, "date-and-or-time", "2009-08-08T14:30:00-05:00"],
          ["gender", {}, "text", "F"],
          ["lang", { "pref": "1" }, "language-tag", "fr"],
          ["lang", { "pref": "2" }, "language-tag", "en"],
          ["org", { "type": "work" }, "text", "Viagenie"],
          ["adr", { "type": "work" }, "text", ["", "Suite D2-630", "2875 Laurier", "Quebec", "QC", "G1V 2M2", "Canada"]],
          ["tel", { "type": ["work", "voice"], "pref": "1" }, "uri", "tel:+1-418-656-9254;ext=102"],
          ["tel", { "type": ["work", "cell", "voice", "video", "text"] }, "uri", "tel:+1-418-262-6501"],
          ["email", { "type": "work" }, "text", "Bob Perreault <bob.perreault@viagenie.ca>"],
          ["geo", { "type": "work" }, "uri", "geo:46.772673,-71.282945"],
          ["key", { "type": "work" }, "uri", "http://www.viagenie.ca/bob.perreault/bob.asc"],
          ["tz", {}, "utc-offset", "-05:00"],
          ["url", { "type": "home" }, "uri", "http://nomis80.org"],
          ["rev", {}, "text", "2000-12-31"],
          ["note", {}, "text", "This is a Note text - line1 \n **** line2"]
        ]]
      ]
    });
  },

  add: function(rawContact) {
    return this._contactRequest("readwrite", function(transaction) {
      return transaction.add(rawContact);
    });
  },

  update: function(contact) {
    return this._contactRequest("readwrite", function(transaction) {
      return transaction.put(contact.toJSON());
    });
  },

  /**
  * Return all contacts in db.
  * @returns {Promise} of an array of all contact objects in the db.
  **/
  getAll: function() {
    return this._contactRequest("readonly",
      function(transaction) {
        return transaction.getAll();
      })
      .then(function(rawContacts) {
        return rawContacts.map(function(rawContact) {
          return new Contact(rawContact);
        });
      });
  },


  /**
  * Return all contacts in db.
  * @returns {Promise} of an array of all contact objects in the db.
  **/
  getAllNameIdAndPhoto: function() {
    var self = this;
    return this._contactRequest("readonly",
      function(transaction) {
        return transaction.getAll();
      })
      .then(function(rawContacts) {

        return rawContacts.map(function(rawContact, index) {
          var tags = Contact.prototype._findProperty('categories', rawContact.jcards);
          self.collectTags(tags);

          DatabaseConnection.lastContactId = rawContact.uuid;
          DatabaseConnection.lastContactUID = Contact.prototype._findProperty('uid', rawContact.jcards);

          return { name: rawContact.name,
            categories: tags,
            email: Contact.prototype._findProperty('email', rawContact.jcards),
            id: DatabaseConnection.lastContactId,
            uid: DatabaseConnection.lastContactUID,
            photo: Images.getPhotoURL(rawContact.photo)
          };
        });
      });
  },

  collectTags: function(tags) {
    var allTags = tags.split(',');
    var nTags = allTags.length;
    for (var i = 0; i < nTags; i++) {
      if ((CategoryCollection.indexOf(allTags[i]) == -1) && (allTags[i] != "")) {
        CategoryCollection.push(allTags[i]);
      }
    }
  },

  /**
  * Return a contact.
  * @param id - id of contact required.
  * @return {Promise} of a contact
  **/
  getById: function(id) {
    return this._contactRequest("readonly",
      function(transaction) {
        return transaction.get(id);
      })
      .then(function(rawContact) {
        return new Contact(rawContact);
      });
  },

  /**
  * Delete contact by id
  * @param {Integer} id - id of contact to be deleted.
  * @returns {Promise} to delete contact of input id
  **/
  deleteById: function(id) {
    return this._contactRequest("readwrite",
      function(transaction) {
        return transaction.delete(id);
      });
  },

  /**
  * Returns all names and IDs in the db.
  * @returns {Promise} - of all names and IDs in db.
  *
  * note: NOT used!
  **/
  getNameAndId: function() {
    return this._contactNameCursor(function(cursor) {
      return { uid: cursor.primaryKey, name: cursor.key };
    });
  },

  /**
  * Returns all names and IDs in the db that match the search term
  * @param {String} string to match against
  * @returns {Promise} - of all names and IDs in db.
  *
  * note: NOT used!
  **/
  searchByName: function(search) {
    return this._contactNameCursor(function(cursor) {
      // all lower case so case does not matter in search
      if (cursor.key.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
        return { uid: cursor.primaryKey, name: cursor.key };
      }
    });
  },

  /**
   * A general cursor function that takes a filter function with a single argument of the current
   * cursor element. Any value returned from the filter function is returned in the promise.
   *
   * This is a cursor over the 'name' index
   *
   * @param {function} a filter function to choose which items are returned
   * @returns {Promise} with the value of an array filled with the filtered values
  **/
  _contactNameCursor: function(filter) {
    let db = this._db;

    return new Promise(function(resolve, reject) {
      // check to see if db exists
      if (db === undefined) {
        reject(DB_ERR_NOT_CONN);
        return;
      }

      // setup transaction
      var transaction = db.transaction([CONTACTS_STORE_NAME], "readonly")
        .objectStore(CONTACTS_STORE_NAME)
        .index("name");

      // create request
      var request = transaction.openKeyCursor();

      // initalise results
      var results = [];

      // setup response functions
      request.onsuccess = function(event) {
        var cursor = event.target.result;

        if (cursor) {
          var result = filter(cursor);
          if (result) {
            results.push(result);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = function(event) {
        reject(event.target.error);
      };
    });
  },

  /**
  * @param {string} access -  level of access to db needed.
  * @param {function} requestFn - takes an IDB transaction
  * @returns {Promise} - the result of the request function
  **/
  _contactRequest: function(access, requestFn) {

    let db = this._db;

    return new Promise(function(resolve, reject) {
      // check to see if db exists
      if (db === undefined) {
        reject(DB_ERR_NOT_CONN);
        return;
      }

      // setup transaction
      var transaction = db.transaction([CONTACTS_STORE_NAME], access)
        .objectStore(CONTACTS_STORE_NAME);

      // create request
      var request = requestFn(transaction);

      // setup response functions
      request.onerror = function(event) {
        reject(event.target.error);
      };
      request.onsuccess = function(event) {
        resolve(event.target.result);
      };
    });
  }
};


/**
 * @constructor
 */
function Contact(rawContact) {
  this.uuid = rawContact.uuid;
  this.name = rawContact.name;
  this.photo = rawContact.photo;
  this.jcards = this._convertFromRawJCard(rawContact.jcards);
}

/**
  * Generates a blank contact
  * @returns Contact blank contact with a default name and a single empty jCard
  *
  * note: NOT used!
  **/
Contact.blank = function() {
  return new Contact({
    name: "[New Contact]",
    photo: undefined,
    jcards: [new ICAL.Component("vcard").toJSON()]
  });
};

Contact.prototype = {
  _convertFromRawJCard: function(jcards) {
    return jcards.map(function(jcard) {
      return new ICAL.Component(jcard);
    });
  },

  _convertToRawJCard: function() {
    return this.jcards.map(function(jcard) {
      return jcard.toJSON();
    });
  },

  toJSON: function() {
    return {
      uuid: this.uuid,
      name: this.name,
      photo: this.photo,
      jcards: this._convertToRawJCard()
    };
  },

  /*
    * Get all details of a contact property
    * @return string  collection of details
    */
  _findProperty: function(property, jcards) {
    for (var j = 0; j < jcards.length; j++) {
      var details = jcards[j][1];

      var propStr="";
      for (var i = 0; i < details.length; i++) {
        if (details[i][0] == property) {
          for (var j = 3; j < details[i].length; j++) {
            // build the return value as a string with comma separation
            if (j > 3) propStr += ',';
            propStr += details[i][j];
          }
          return propStr;
        }
      }
      return "";
    }
  }
};

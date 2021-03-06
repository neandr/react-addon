/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Encoding
 *    See also   https://tools.ietf.org/html/rfc6350#section-10.1
 *    "charset": as defined for text/plain [RFC2046]; encodings other
 *    than UTF-8 [RFC3629] MUST NOT be used.
 *
 * AddressbookUtil.import ALWAYS expects UTF-8 data and
 * .export generates UTF-8 data.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/NetUtil.jsm");

const EXPORTED_SYMBOLS = ['AddressbookUtil'];

String.prototype.trunc =
      function(n){
          return this.substr(0,n-1) + (this.length > n ? '...' : '');
      };

var AddressbookUtil = {
  /**
   * vCard exporting a contact may include PRODID, see RFC 6350 - 6.7.3. PRODID
   * Purpose: To specify the identifier for the product that created the vCard object.
   * example: PRODID:-//TB//vContacts//-alpha0.1//EN
  */
  prodid: '-//TB//vContacts//-alpha0.1//EN',
  rev: '2016-07-21T17:17:33Z',

  /**
   * rfc6350#section-3.3  ABNF Format Definition
   *  New Contact default definition
   *  vcard = "BEGIN:VCARD" CRLF
   *          "VERSION:4.0" CRLF
   *          1*contentline
   *          "END:VCARD" CRLF
   *  ; A vCard object MUST include the VERSION and FN properties.
   *  ; VERSION MUST come immediately after BEGIN:VCARD.
   */

  /* eslint-disable operator-linebreak */
  newContactDefault:
      "BEGIN:VCARD\n"
      +"VERSION:3.0\n" //          //MUST, appear immediately after BEGIN:VCARD.
      +"PRODID:%%prodid%%\n"
      +"UID:%%uid%%\n"
      +"N:Contact;New;;;\n"
      +"FN:New Contact\n"//       //MUST
      +"REV:%%date%%\n"
      +"END:VCARD",

  /**
   * exports contacts to a file choosen by the user.
   * Shows a file picker to the user to choose where the file is exported to.
   *
   * @param {Contact|Contact[]} the contact(s) to export to the
   */
  exportContact: function(contacts, abUI) {

    var window = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator).getMostRecentWindow(null);

    var details = {};
    details.title = 'Save contacts to VCF file"';
    details.fileMode = 'modeSave';
    details.filterName = "vCard";
    details.filterextensions = ("*.vcf; *.vcard");
    details.filterIndex = 1;


    // check if the contacts to export is an array or a single contact
    if (Array.isArray(contacts)) {
      details.defaultString = "contacts.vcf";
    } else {
      details.defaultString = contacts.name + ".vcf";
      contacts = [contacts];
    }
    details.contacts = contacts;

    AddressbookUtil.filePick(window, details, 
      /*callback*/ function (file, details) {

      // iterate through all the contacts to be exported
      let all_vcards = "";
      details.contacts.forEach(function(contact) {
      // iterate through the jCards (assuming they are in Component form)
        contact.jcards.map(function(jcard) {
          jcard.updatePropertyWithValue("prodid", AddressbookUtil.prodid);
          all_vcards += jcard.toString() + "\r\n\r\n";
        });
      });

      var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Components.interfaces.nsIFileOutputStream);

      // eslint  reports: Invalid number  0666                                  //TODO
      try {
        foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); // write, create, truncate
      } catch (e) {
        abUI.setState({ abError:("Export failed: " + e.name)});
        abUI.setState({ errorStatus: displayBlock });
        console.error("vContacts Export: " + e);
        return;
      }

      var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Ci.nsIScriptableUnicodeConverter);

      converter.charset = "UTF-8";
      var inStream = converter.convertToInputStream(all_vcards);

      NetUtil.asyncCopy(inStream, foStream, 
        function(aResult) {
           if (!Components.isSuccessCode(aResult)) {
             // an error occurred!
             abUI.setState({ abError:("Export: " + aResult)});
             abUI.setState({ errorStatus: displayBlock });
             console.error("vContacts Export: " + aResult);
           }
        });

    }); // filePick callback
  },


  /**
   * Ask the user to point to a vCard 'vcf' or 'ldif' file and import
   * the contacts into the database
   *
   * @param {addressbook} Addressbook to add the imported contacts to
   * @returns {Promise[]} Array of promises for adding the new contacts
   */
  importContacts: function(abUI, addressbook) {

    var window = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator).getMostRecentWindow(null);

    var details = {};
    details.title = 'Load contacts from VCF/LDIF file"';
    details.fileMode = 'modeOpen';
    details.filterName = "vCard/ldif";
    details.filterextensions = ("*.vcf; *.vcard; *.ldif");
    details.filterIndex = 1;

    AddressbookUtil.filePick(window, details, 
      /*callback*/ function (file, details) {

      // add 'Tag/Category' for import, get from Tag selector
      let addTag = document.getElementById('selectedTag').value;

      let inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Components.interfaces.nsIFileInputStream);

      // eslint  reports: Invalid number  0444         //TODO
      inputStream.init(file, 0x01, 0444, 0); //readonly
      var fileContents = NetUtil.readInputStreamToString(
        inputStream,
        inputStream.available(),
        { charset: "UTF-8" });

      inputStream.close();

      var extension = file.leafName.split('.').pop().toLowerCase();

      // Importing LDIF data files and parse it as vCard (see descriptions!)
      if (extension == 'ldif') {
        var fileContents = AddressbookUtil.parseLDIF(fileContents);
      }

      var contactUid = AddressbookUtil.parseContacts(fileContents, file.leafName, addTag, abUI);

      return contactUid;
    }); // filePick callback
  },

  parseContacts: function(contents, source, addTag, abUI) {

    //performance messures; for disabling set 'enablePerf' to false             //XXXX PERF
    var enablePerf = true;
    var perf = [];
    function getPerfNow() {
      if (enablePerf) {perf.push(performance.now()); }
    }

    getPerfNow();

    // detect error from parsing
    try {
      var contacts = ICAL.parse(contents);
    } catch (e) {

      console.error("vContacts ERROR ICAL", source,
        "\n  name: " + e.name +": " + e.message + "\n Stack: " + e.stack + "\n  contents:\n" + contents);
      abUI.setState({ abError: ('ICAL ' + source + ":\n" + e.message + "\ncontents:\n" + contents)});
      abUI.setState({ errorStatus: displayBlock });
      return;
    }
    getPerfNow();

    // check if it is an array of vcards or a single vcard
    if (contacts[0] == 'vcard') {
      // make a single contact a list to work with the next section
      contacts = [contacts];
    }

    // convert jcards into Contact objects
    var lastUid;
    var nContacts=0;

    /* eslint-disable  array-callback-return  */
    var contactPromises = contacts.map(function(vcard) {
      var contact = new ICAL.Component(vcard);

      // try to get the name of the contact
      var name = contact.getFirstPropertyValue("fn");
      // fall back to the 'n' for a name
      if (!name) {
        name = contact.getFirstPropertyValue("n");
        name = Array.isArray(name) ? name.join(" ").trim() : name;
      }
      // fall back to email for a name
      if (!name) {
        name = contact.getFirstPropertyValue("email");
      }

      // get the photo
      var photo;
      var photoProperty = contact.getFirstProperty("photo");

      if (photoProperty) {
        if (photoProperty.type === "binary") {

          try {
            var imageType = "image/" + photoProperty.getParameter("type").toLowerCase();
            photo = AddressbookUtil.b64toBlob(photoProperty.getValues(), imageType);
          } catch (e) {
            console.log("vContact parseContacts error  PHOTO: '", e.message,
              "'  Contact Name: ", name,
              "\n  ", e.stack.split('\n')[0]);
          }
        }


        //XXX   Should an external URL be support? Eventually security problem?
        //TODO  Photo as url: How to handle when offline ??
        if (photoProperty.type === "uri") {
          let xphoto = photoProperty.getValues()[0];
          let ext = xphoto.substr((~-xphoto.lastIndexOf(".") >>> 0) + 2);
          if ((ext === 'png') || (ext === 'jpg')) {
            var imageType = "image/" + ext;
            photo = xphoto;
          }
        }
      }

      // add categories for imported
      if (addTag != '%none%') {
        let cCategories = contact.getFirstPropertyValue("categories");
        if (cCategories != null) {
          if (typeof cCategories === 'string') cCategories = [cCategories];

          cCategories = cCategories.filter(function(e) {
            return e !== addTag;
          });
          cCategories.push(addTag);
        } else {
          cCategories=[addTag];
        }
        contact.updatePropertyWithValue("categories",cCategories);
      }

      lastUid = contact.getFirstPropertyValue("uid");

      return {
        name: name.trim(),
        jcards: [vcard],
        photo: photo
      };

      // do another map of the contacts in a separate loop so
      // if a single contact fails none of the contacts will be
      // be inserted into the database
    }).map(function(contact) {
      //TODO  Check UID if an imported contact already exists                                  //TODO
      //TODO  Importing a contact with same UID and new REV to overwrite the current contact   //TODO

      // add the contact to the addressbook
      Addressbook.open(indexedDB).then(function(addrbook) {
        addrbook.add(contact)
      });
      nContacts++;
    });

    /* eslint-enable  array-callback-return  */

    getPerfNow();

    if (enablePerf) {
      console.log("Imported cards parsed with ICAL  perf:: \n", //XXXX
        "\n  # of cards processed                 ", nContacts,
        "\n  parsed all cards                     ", perf[1] - perf[0],
        "\n  converted to jcards and added to AB  ", perf[2] - perf[1]);
    }

    return lastUid; //    //contactPromises;
  },


  newContact: function(abUI) {
    let contactString = AddressbookUtil.newContactDefault;
    // get a unique UID
    this.newContactUid = AddressbookUtil.uuidGen();
    contactString = contactString.replace('%%uid%%', this.newContactUid);
    contactString = contactString.replace('%%prodid%%', this.prodid);

    var revDate = ICAL.Time.now().toString(); //           "2016-11-19T14:26:18"
    contactString = contactString.replace('%%date%%', revDate);

    // add 'Tag/Category' for import, get from Tag selector
    let addTag = document.getElementById('selectedTag').value;

    this.newContactUid = AddressbookUtil.parseContacts(contactString, 'newContact', addTag, abUI);
    return;
  },
  newContactUid: "",

  uuidGen: function() {
    var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
      .getService(Components.interfaces.nsIUUIDGenerator);
    var uuid = uuidGenerator.generateUUID().number;
    return uuid.substring(1, uuid.length-1).toString();
  },

  unique: function (a) {
      return a.sort().filter(function(item, pos, ary) {
          return !pos || item != ary[pos - 1];
      })
  },

  b64toBlob: function(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);

    /*-----------
    try {
      var byteCharacters = atob(b64Data);
    } catch (e) {
      console.log("Error  PHOTO: ", e.message);
      return;
    }
    -------------*/

    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  },


  /**
   *   Open external link using browser
   *   @param {string}  url  will be converted to UTF8
   */
  openLink: function(url) {
    url = this.convertUnicode('UTF8', url);
    let msgnr = Components.classes["@mozilla.org/messenger;1"]
      .createInstance(Components.interfaces.nsIMessenger);
    msgnr.launchExternalURL(url);
  },

  /**
   *   Convert a character stream from Unicode to other based on definition
   *   @param {string}  aCharset  character set name to convert to
   *   @param {string}  aSource  source stream
   */
  convertUnicode: function(aCharset, aSource) {
    let unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    unicodeConverter.charset = aCharset;
    return unicodeConverter.ConvertFromUnicode(aSource);
  },


  getUrl: function(url) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function() {
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.response);
        } else {
          reject(Error(req.statusText));
        }
      };
      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      };
      // Make the request
      req.send();
    });
  },



/**
 * FilePicker   2017-12-01
 * Changed to not use fp.show but fp.open which is async code
 * (required for mozilla57)
 */
filePick: function (aWindow, details, callback) {
//--------------------------------------------------------------------------
   var nsIFilePicker = Ci.nsIFilePicker;
   var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

   fp.init(aWindow, details.title, nsIFilePicker[details.fileMode]);
   fp.appendFilters(nsIFilePicker.filterAll);
   fp.appendFilter(details.filterName, details.filterextensions);
   fp.filterIndex = 0;

   if (details.cDir && details.cDir.parent) fp.displayDirectory = details.cDir.parent;
   if (details.defaultString) fp.defaultString= details.defaultString;

    return new Promise(resolve => {
      //show the window
      fp.open(rv => {
        if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        callback(fp.file, details);
      }
    });
  })
},


  /**
   * Parse a LDIF contact file to get it as vCard
   * The LDAP Data Interchange Format (LDIF)
   *     https://tools.ietf.org/html/rfc2849
   *
   * Note:
   * Current code is a very simple / limited parsing for contacts exported from
   * TB/AB LDIF and has to be replaced with a more robust implementation!
   */
  parseLDIF(ldifFile) {

    function n(ldif, item) {
      return ((ldif[item] != null) ? ldif[item].trim() : "");
    }

    function v(cItem, ldif, item, vcard) {
      if (typeof ldif[item] === 'string') ldif[item] = ldif[item].trim();
      return ((ldif[item] != null) ? (vcard + cItem + ldif[item] + "\n") : vcard);
    }

    function w(item) {
      if (typeof item === 'string') item = item.trim();
      return ((item != null) ? (item +';') : ';');
    }


    let ldifLines = ldifFile.split("\n");
    let nLines = ldifLines.length;
    let nContacts = 0;
    let colonIndex;
    let cItem;
    let cValue;

    let vCardLead =
      "BEGIN:VCARD\n"
        +"VERSION:3.0\n" //          //MUST, appear immediately after BEGIN:VCARD.
        +"PRODID://vContact//LDIF Import//0.2\n"
        +"UID:" + this.uuidGen() + "\n";


    let ldif = [];
    let vcard = "";

    for (line in ldifLines) {
      var cLine = ldifLines[line];

      var dt = 0;
      // empty line indicates delimiter for next contact OR end of file
      if (cLine == "") {

        if (typeof(ldif.dn) == 'undefined')
          return vcard;

        nContacts++;

        /* eslint-disable indent */
        /* eslint-disable dot-notation */
/*-------------------------
6.2.1.  FN
   Purpose:  To specify the formatted text corresponding to the name of
      the object the vCard represents.
   Value type:  A single text value.
   Cardinality:  1* | One or more instances per vCard MUST be present.
   Special notes:  This property is based on the semantics of the X.520
      Common Name attribute [CCITT.X520.1988].
      The property ***MUST*** be present in the vCard object.

6.2.2.  N
   Purpose:  To specify the components of the name of the object the
      vCard represents.
   Value type:  A single structured text value.  Each component can have
      multiple values.
   Cardinality:  *1 | Exactly one instance per vCard MAY be present.

    N:  Family Names (also known as surnames); Given Names; Additional Names; Honorific Prefixes; and Honorific Suffixes

 *
6.3.1.  ADR
       ADR-value = ADR-component-pobox ";" ADR-component-ext ";"     <=== SHOULD be empty !
                 ADR-component-street ";" ADR-component-locality ";"
                 ADR-component-region ";" ADR-component-code ";"
                 ADR-component-country
        ADR:;;123 Main Street;Any Town;CA;91921-1234;U.S.A.
 *  ---------------------*/

            vcard += vCardLead;

            var fn = n(ldif, 'cn');
            if (fn == "") {
              fn = n(ldif, 'dn');
            }
            vcard += 'FN:' + fn + '\n';
            vcard += 'N:' + n(ldif, 'sn') + ';' + n(ldif, 'givenName') + ';;;\n';


            if (ldif['mozillaHomeStreet'] || ldif['mozillaHomeLocalityName']
             || ldif['mozillaHomeState'] || ldif['mozillaHomePostalCode']
             || ldif['mozillaHomeCountryName']) {

              vcard += 'ADR;TYPE=HOME:;;'
               + n(ldif, 'mozillaHomeStreet') //              street
               + ';' + n(ldif, 'mozillaHomeLocalityName') //  l
               + ';' + n(ldif, 'mozillaHomeState') //         st
               + ';' + n(ldif, 'mozillaHomePostalCode') //    postalCode
               + ';' + n(ldif, 'mozillaHomeCountryName') //   c
               + '\n';
            }

      /*----------
      street: workAddr
      mozillaWorkStreet2: workAddr1
      l: workCity
      st: workState
      postalCode: workZIP
      c: workCountry
      --------*/
            //    if (ldif['street'] || ldif['mozillaWorkStreet2'] || ldif['l']
            if (ldif['street'] || ldif['l']
             || ldif['st'] || ldif['postalCode']
             || ldif['c']) {
               vcard += 'ADR;TYPE=WORK:;;'
               + w(ldif['street']) + w(ldif['l']) + w(ldif['st'])
               + w(ldif['postalCode']) + w(ldif['c'])
               + '\n';
            }

            vcard = v('NICKNAME:', ldif, 'mozillaNickname', vcard);

            if (ldif['birthyear'] && ldif['birthmonth'] && ldif['birthday']) {
               vcard = vcard + 'BDAY:' + ldif['birthyear']
                     +'-' + ldif['birthmonth']
                     +'-' + ldif['birthday']
                     +'\n';
            }

            vcard = v('EMAIL;TYPE=HOME:', ldif, 'mail', vcard);
            vcard = v('EMAIL;TYPE=HOME:', ldif, 'mozillaSecondEmail', vcard);

            vcard = v('TEL;TYPE=HOME:', ldif, 'homePhone', vcard);
            vcard = v('TEL;TYPE=WORK:', ldif, 'telephoneNumber', vcard);
            vcard = v('TEL;TYPE=CELL:', ldif, 'mobile', vcard);
            vcard = v('TEL;TYPE=FAX:', ldif, 'facsimiletelephonenumber', vcard);

            vcard = v('URL;TYPE=HOME:', ldif, 'mozillaHomeUrl', vcard);
            vcard = v('URL;TYPE=WORK:', ldif, 'mozillaWorkUrl', vcard);

            vcard = v('NOTE:', ldif, 'description', vcard);

            vcard = v('REV:', ldif, 'modifytimestamp', vcard);

            vcard += 'END:VCARD\n\n';

            ldif = [];
            continue;
         }
         /* eslint-enable dot-notation */

         colonIndex = cLine.indexOf(":");

         cItem = cLine.substring(0, colonIndex);
         cValue = cLine.substring(colonIndex + 1).trim();
         if (cValue[0] == ":") {
            cValue = ICAL.Binary.prototype._b64_decode(cValue.substring(1).trim()).replace(/[\n]/g, '\\n');
         }

         if (cItem == 'modifytimestamp') {
            if (+cValue !== 0) {
               cValue = (new Date(+cValue*1000)).toISOString();
            }
         }
         ldif[cItem] = cValue;
      }
   },



/**
 * Remove an object2 from an object1 by name of object1
 * @param {object}  object1 .. the initial object
 * @param {string}  the name of the object to be removed
 * @return {object}
 */
  removeObject: function(allObjects, objName) {
      var newObj = {};
      for (var obj in allObjects) {
         if (obj !== objName) {
            newObj[obj] = {};
            newObj[obj] = allObjects[obj];
         }
      }
      return newObj;
   }

};

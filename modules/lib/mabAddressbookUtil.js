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

var AddressbookUtil = {

  /**
   * vCard exporting a contact may include PRODID, see RFC 6350 - 6.7.3. PRODID
   * Purpose: To specify the identifier for the product that created the vCard object.
   * example: PRODID:-//TB//vContacts//-alpha0.1//EN
  */
   prodid : '-//TB//vContacts//-alpha0.1//EN',
   rev : '2016-07-21T17:17:33Z',
// REV:2016-07-21T17:17:33Z

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
   newContactDefault:
    "BEGIN:VCARD\n"
    +"VERSION:3.0\n"           //MUST, appear immediately after BEGIN:VCARD.
    +"PRODID:xx\n"
    +"UID:%%uid%%\n"
  //  +"N:;;;;\n"
    +"FN:New Contact\n"       //MUST
    +"REV:%%date%%\n"
    +"END:VCARD",


  /**
   * exports contacts to a file choosen by the user.
   * Shows a file picker to the user to choose where the file is exported to.
   *
   * @param {Contact|Contact[]} the contact(s) to export to the
   */
   exportContact: function(contacts) {

    var filePickerInterface = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(filePickerInterface);
    var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var window = windowMediator.getMostRecentWindow(null);

    filePicker.init(window, "Save contacts to", filePickerInterface.modeSave);
    filePicker.appendFilter("vCard", "*.vcf; *.vcard");
    filePicker.appendFilters(filePickerInterface.filterAll);
    filePicker.filterIndex = 0;

    // check if the contacts to export is an array or a single contact
    if (Array.isArray(contacts)) {
      filePicker.defaultString = "contacts.vcf";
    } else {
      filePicker.defaultString = contacts.name + ".vcf";
      contacts = [contacts];
    }

    var returnValue = filePicker.show();

    if (returnValue == filePickerInterface.returnOK || returnValue == filePickerInterface.returnReplace) {

      var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Components.interfaces.nsIFileOutputStream);

      foStream.init(filePicker.file, 0x02 | 0x08 | 0x20, 0666, 0); // write, create, truncate

      // iterate through all the contacts to be exported
      let all_vcards = "";
      contacts.forEach(function(contact) {
        // iterate through the jCards (assuming they are in Component form)
        contact.jcards.map(function(jcard) {
          jcard.updatePropertyWithValue("prodid", AddressbookUtil.prodid)
          all_vcards += jcard.toString() + "\r\n\r\n";
        });
      });

      let inStream = Cc["@mozilla.org/io/string-input-stream;1"].
              createInstance(Ci.nsIStringInputStream);
      inStream.setData(all_vcards, all_vcards.length);

      NetUtil.asyncCopy(inStream, foStream, function(aResult) {
        if(!Components.isSuccessCode(aResult)) {
           // an error occurred!                   //XXX  //TODO   error handling!
        }
      })

    }
  },


  /**
   * Ask the user to point to a vCard and import the contacts into the database 
   *
   * @param {Addressbook} Addressbook to add the imported contacts to
   * @returns {Promise[]} Array of promises for adding the new contacts
   */
  importContacts: function(addressbook) {

    var filePickerInterface = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(filePickerInterface);
    var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var window = windowMediator.getMostRecentWindow(null);

    filePicker.init(window, "Load contacts from", filePickerInterface.modeOpen);
    filePicker.appendFilter("vCard/ldif", "*.vcf; *.vcard; *.ldif");
    filePicker.appendFilters(filePickerInterface.filterAll);
    filePicker.filterIndex = 0;
    filePicker.defaultString = "contacts.vcf";

    var returnValue = filePicker.show();
    if (returnValue == filePickerInterface.returnOK) {
      var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Components.interfaces.nsIFileInputStream);
      inputStream.init(filePicker.file, 0x01, 0444, 0); // readonly

      var fileContents = NetUtil.readInputStreamToString(
          inputStream,
          inputStream.available(),
          { charset: "UTF-8" });

      inputStream.close();

      let extension = filePicker.file.leafName.split('.').pop();

      if (extension == 'ldif'){ 
         var fileContents = AddressbookUtil.parseLDIF(fileContents);

// console.log("ldif data to import ________________ \n" + fileContents);
      }

      let contactUid = AddressbookUtil.parseContacts(addressbook, fileContents, filePicker.file.leafName);
      return contactUid;
    }
  },

  parseContacts: function(addressbook, contents, source) {
    // detect error from parsing
    try {
       var contacts = ICAL.parse(contents);
    } catch (e) {
       console.log("\n---vContacts ERROR --------- ",source, "\n", e);      //XXXgW   //TODO
       return;
    }

    // check if it is an array of vcards or a single vcard
    if (contacts[0] == 'vcard') {
      // make a single contact a list to work with the next section
      contacts = [contacts];
    }

    // convert jcards into Contact objects
    var lastUid;

    var contactPromises = contacts.map(function(vcard) {
       var contact =  new ICAL.Component(vcard);

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
       var photo = undefined;
       var photoProperty = contact.getFirstProperty("photo");

       if (photoProperty) {
          if (photoProperty.type === "binary") {
             var imageType = "image/" + photoProperty.getParameter("type").toLowerCase();
             photo = AddressbookUtil.b64toBlob(photoProperty.getValues(), imageType);
          }


          //XXX   Should an external URL be support? Eventually security problem?
          //TODO  Photo as url: How to handle when offline ??
          if (photoProperty.type === "uri") {
             let xphoto = photoProperty.getValues()[0]
             let ext = xphoto.substr((~-xphoto.lastIndexOf(".") >>> 0) + 2);
             if ((ext === 'png') || (ext === 'jpg')) {
                var imageType = "image/" + ext;
                photo = xphoto;
            }
          }
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
        //TODO  Check UID if an imported contact already exists           //XXXgW 
        //TODO  Importing a contact with same UID and new REV to overwrite the current contact   //XXXgW

        // add the contact to the addressbook
        addressbook.add(contact);
     });

     return lastUid;     //contactPromises;
  },


   newContact: function(addressbook) {
      let contactString = AddressbookUtil.newContactDefault
      // get a unique UID
      contactString = contactString.replace('%%uid%%',AddressbookUtil.uuidGen());

      var revDate = ICAL.Time.now().toString()      // "2016-11-19T14:26:18"
      contactString = contactString.replace('%%date%%', revDate);

      let contactUid = AddressbookUtil.parseContacts(addressbook, contactString, 'newContact');

      return contactUid;
   },

   uuidGen: function() {
      var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
                          .getService(Components.interfaces.nsIUUIDGenerator);
      var uuid = uuidGenerator.generateUUID().number;
      return uuid.substring(1,uuid.length-1).toString();
   },


   b64toBlob: function(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
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
 
      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
   },


  /**
   *   Open external link using browser
   *   @param {string}  url  will be converted to UTF8
   */
  openLink : function(url) {
     url =  this.convertUnicode ('UTF8', url);
     let msgnr =  Components.classes["@mozilla.org/messenger;1"]
          .createInstance(Components.interfaces.nsIMessenger);
     msgnr.launchExternalURL(url);
  },

  /**
   *   Convert a character stream from Unicode to other based on definition
   *   @param {string}  aCharset  character set name to convert to
   *   @param {string}  aSource  source stream
   */
  convertUnicode : function(aCharset, aSource){
     let unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
     unicodeConverter.charset = aCharset;
     return unicodeConverter.ConvertFromUnicode(aSource);
  },


  getUrl : function (url) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function() {
        if (req.status == 200) {
        // Resolve the promise with the response text
          resolve(req.response);
        }
        else {
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
   * Parse a LDIF contact file to get it as vCard
   * The LDAP Data Interchange Format (LDIF) 
   *     https://tools.ietf.org/html/rfc2849 
   * 
   * Note: 
   * Current code is a very simple / limited parsing for contacts exported from
   * TB/AB LDIF and has to be replaced with a more robust implementation!
   */
  parseLDIF(ldifFile) {
    let ldifLines = ldifFile.split("\n");
    let nLines = ldifLines.length
    let nContacts = 0;
    let colonIndex;
    let cItem;
    let cValue;

    let vCardLead = 
    "BEGIN:VCARD\n"
    +"VERSION:3.0\n"           //MUST, appear immediately after BEGIN:VCARD.
    +"PRODID://vContact//LDIF Import//-0.1\n"
    +"UID:" + this.uuidGen() + "\n";


    let ldif = [];
    let vcard = "";

    for (line in ldifLines) {
       var cLine = ldifLines[line]

       var dt = 0;
       // empty line indicates delimiter for next contact OR end of file
       if (cLine == "") {

          if (typeof(ldif['dn']) == 'undefined') 
             return vcard;

          nContacts++;


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

             function n(ldif, item) {
                return ((ldif[item] != null) ? ldif[item].trim() : "")
             }

             function v(cItem, ldif, item, vcard) {
                if (typeof ldif[item] === 'string') ldif[item] = ldif[item].trim();
                return ((ldif[item] != null) ? (vcard + cItem + ldif[item] + "\n") : vcard)
             }

          vcard += vCardLead;

          var fn = n(ldif, 'cn');
          if (fn == "") {
             fn = n(ldif,'dn');
          }
          vcard += 'FN:' + fn + '\n';
          vcard += 'N:' + n(ldif,'sn') + ';' + n(ldif, 'givenName') + ';;;' +'\n';

          vcard += 'ADR:;;' + n(ldif,'mozillaHomeStreet') 
                    + ';' + n(ldif, 'mozillaHomeLocalityName') 
                    + ';' + n(ldif, 'mozillaHomeCountryName') 
                    + ';' + n(ldif, 'mozillaHomePostalCode') 
                    + ';' + n(ldif, 'mozillaHomeCountryName') 
                    + ';' + n(ldif, 'mozillaHomeState') 
                    + '\n';

          vcard = v('NICKNAME:',ldif,'mozillaNickname', vcard);

          if (ldif['birthyear'] && ldif['birthmonth'] && ldif['birthday']) {
              vcard = vcard + 'BDAY:' + ldif['birthyear'] 
                  +'-' + ldif['birthmonth'] 
                  +'-' + ldif['birthday']
                  +'\n'
          }

          vcard = v('EMAIL;TYPE=HOME:',ldif,'mail', vcard);
          vcard = v('EMAIL;TYPE=HOME:',ldif,'mozillaSecondEmail', vcard);

          vcard = v('TEL;TYPE=HOME:',ldif,'homePhone', vcard);
          vcard = v('TEL;TYPE=WORK:',ldif,'telephoneNumber', vcard);
          vcard = v('TEL;TYPE=CELL:',ldif,'mobile', vcard);
          vcard = v('TEL;TYPE=FAX:', ldif,'facsimiletelephonenumber', vcard);

          vcard = v('URL;TYPE=HOME:',ldif,'mozillaHomeUrl', vcard);
          vcard = v('URL;TYPE=WORK:',ldif,'mozillaWorkUrl', vcard);

          vcard = v('NOTE:',ldif,'description', vcard);

          vcard = v('REV:',ldif,'modifytimestamp', vcard);

          vcard += 'END:VCARD\n\n'

          ldif = [];
          continue;
       }

       colonIndex = cLine.indexOf(":");

       cItem = cLine.substring(0, colonIndex);
       cValue = cLine.substring(colonIndex + 1).trim();
       if (cValue[0] == ":") {
          cValue = AddressbookUtil.b64_decode(cValue.substring(1).trim());
          cValue = cValue.replace(/[\n]/g, '\\n');
       }

       if (cItem == 'modifytimestamp') {
          if (+cValue !== 0) {
             cValue = (new Date(+cValue*1000)).toISOString();
          }
       }
       ldif[cItem] = cValue;
    }
  },
  
  
  
  
      b64_decode: function base64_decode(data) {
      // http://kevin.vanzonneveld.net
      // +   original by: Tyler Akins (http://rumkin.com)
      // +   improved by: Thunder.m
      // +      input by: Aman Gupta
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Onno Marsman
      // +   bugfixed by: Pellentesque Malesuada
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +      input by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
      // *     returns 1: 'Kevin van Zonneveld'
      // mozilla has this native
      // - but breaks in 2.0.0.12!
      //if (typeof this.window['btoa'] == 'function') {
      //    return btoa(data);
      //}
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz0123456789+/=";
      var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = "", dec1,
        tmp_arr = [],
        cntrl =0;

      if (!data) {
        return data;
      }

      data += '';

      do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
          tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
          tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
          tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
      } while (i < data.length);

      dec = tmp_arr.join('');

// console.log(" decode    ", dec )

      // 
      tmp_arr = []; cntrl = 0;
      i =0, ac=0; 
      do {
        h1 = dec.charCodeAt(i++)
        h2 = dec.charCodeAt(i)

// console.log(" decode    ", i , h1, String.fromCharCode(h1), h2, String.fromCharCode(h2) )
        if (h1 >= 195 && h1 <= 203){
           cntrl = (h1 - 194)*64
        } else {
           h1 += cntrl;
           tmp_arr[ac++] = String.fromCharCode(h1);
           cntrl = 0;
// console.log(" decode ** ", i , h1, String.fromCharCode(h1) )

        }
      } while (i < dec.length);

      dec = tmp_arr.join('');
      return dec;
    }

};


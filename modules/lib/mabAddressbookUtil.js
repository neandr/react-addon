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
  //  +"REV;VALUE=DATE-TIME:20160721T171732Z\n"
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
           // an error occurred!                   //XXXTODO   error handling!
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
    filePicker.appendFilter("vCard", "*.vcf; *.vcard");
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
      let parseResult = AddressbookUtil.parseContacts(addressbook, fileContents, filePicker.file.leafName);
      return parseResult;
    }
  },

  parseContacts: function(addressbook, contents, source) {
    // detect error from parsing
    try {
       var contacts = ICAL.parse(contents);
    } catch (e) {
       console.log("\n---vContacts ERROR --------- ",source, "\n", e);      //XXXgW
       return;
    }

    // check if it is an array of vcards or a single vcard
    if (contacts[0] == 'vcard') {
      // make a single contact a list to work with the next section
      contacts = [contacts];
    }

    // convert jcards into Contact objects
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

          //XXXTODO  Photo as url: How to handle when offline ??
          if (photoProperty.type === "uri") {
             let xphoto = photoProperty.getValues()[0]
             let ext = xphoto.substr((~-xphoto.lastIndexOf(".") >>> 0) + 2);
             if ((ext === 'png') || (ext === 'jpg')) {
                var imageType = "image/" + ext;
                photo = xphoto;
            }
          }
       }

       return {
          name: name.trim(),
          jcards: [vcard],
          photo: photo
       };

     // do another map of the contacts in a separate loop so
     // if a single contact fails none of the contacts will be
     // be inserted into the database
     }).map(function(contact) {
        // TODO: check if it already exists and add it?          //XXXgW  

        // add the contact to the addressbook
        addressbook.add(contact);
     });

     return contactPromises;
  },


   newContact: function(addressbook) {
      let contactString = AddressbookUtil.newContactDefault
      // get a unique UID
      contactString = contactString.replace('%%uid%%',AddressbookUtil.uuidGen());
      return AddressbookUtil.parseContacts(addressbook, contactString, 'newContact');
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
     url =  this.convertUnicode ('UTF8', url);       //?????
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
  }
};


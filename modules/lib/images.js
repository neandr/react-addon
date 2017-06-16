/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @desc Deals with handling of URLs for displaying images
 **/
function Images() { };

/**
* Revokes a URL given for an image
* @param {Blob} photo The image to revoke a URL for
**/
Images.handleURLRevoke = function(photo) {
   URL.revokeObjectURL(photo);
};

/**
* Gets a URL to a photo if it exists, or provides a default contact image
* @param {Blob} photo The image to get a URL for
**/
Images.getPhotoURL = function(photo) {
 if (photo != null)
 //console.log("   getPhotoURL :", photo.valueOf().toString())

   // if (photo) {
   if (photo && 
      ((photo.valueOf().toString() == "[object File]") 
         || (photo.valueOf().toString() == "[object Blob]"))) {
        return URL.createObjectURL(photo)
   }
   if (photo && (typeof photo == 'string')) {
      if ((photo.indexOf('https://') === 0) || (photo.indexOf('http://') === 0)) {
         let ext = photo.substr((~-photo.lastIndexOf(".") >>> 0) + 2);
         if ((ext === 'png') || (ext === 'jpg')) {
           return photo;
         }
      }
   }
   return "images/xContact.png";
}
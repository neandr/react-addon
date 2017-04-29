/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
* Provides a rounded image using the provided image url
**/


var ProfileImage = (props) => (
  <img className={props.className} onClick={props.imageClick}  //onload removed   //gW 2016-12-07
    src={props.image}/>
);

/*-----------------
var ProfileImage = (props) => (
  <img className={props.className} onClick={props.imageClick} onload={Images.handleURLRevoke.bind(null, props.image)}  //onload ???????????
    src={props.image}/>
);
--------*/
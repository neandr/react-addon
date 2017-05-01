## Thunderbird vContacts -- <small>*Move to a modern Addressbook*</small>

**_Note  This description will be updated for Spring'2017_**


This Thunderbird add-on was started in 2016 as a project of SCHOOL OF ENGINEERING AND COMPUTER SCIENCE/Victoria University of Wellington, New Zealand.

The project was aimed to build a modern addressbook based on industry standards, using modern technologies and to replace the current data store (mork).

#### Technical concepts

First steps of the VUW realization was to build a Thunderbird add-on which is working locally (can be used in TB offline mode) with an underlying database, some interfacing to local files for importing/exporting of contacts and collections.
The VUW project details can be found [here](https://github.com/Thunderbird301/react-addon/wiki)

**TB vContacts** is a refactor of the VUW project, [see here](https://github.com/neandr/vContacts). See below about 'Prove of Concept' and [here for the actual status](https://neandr.github.io/vContacts/notes.txt) with more details.

----
### How to use

**TB vContacts Extension **
The most current XPI can be downloaded from [here](https://github.com/neandr/vContacts/releases)

Install the XPI into Thunderbird as usual.
You may add the "vContacts" toolbar button to the TB menu bar with the "Customize" feature on the main toolbar.

**vContacts** starts with two default contacts, feel free to modify/delete.

**New Contacts** can be added with the buttons on the sidebar header or when the contact section is closed: [ + ] to add a new contact.

**Import Contacts** The import currently reads **vCard** files. A next update will be expanded to read **LDIF** contact files also. That way **TB/Addressbook** data which has been exported before with the LDIF format (and extension *.ldif) can be added.

**Export vCard** Selected contact(s) can be exported to vCard files.

**Mailto/Links** showing a contacts detail the mailto links are active, so clicking on it will directly open a TB Compose window. URL link open the web browser.

----
### vContact Status - <small>Prove of Concept</small>

vContact is in very early development state, not debugged, not tuned for performance, not fully tested and missing a lot of functionality (e.g. using tags/categories, search function not working, rendering of addresses only partly, editing of personal and contact items incomplete).

 <i>**Use it on your own risk** -- which should be low risk, no writing back to any TB environment.</i> 


**HELP NEEDED**
For further development feedback is very much welcomed, for the functionality, for the UI, for the coding, for documentation, for testing functions ...
Please use the [GIT issues]

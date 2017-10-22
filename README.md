## Thunderbird vContacts <small>-- *Move to a modern Addressbook*</small> <small><small>rev.171018.00</small></small>

A [project initialized](https://github.com/neandr/vContacts/VUW-Project.md.html) at the SCHOOL OF ENGINEERING AND COMPUTER SCIENCE/VUW, New Zealand.   
The project is aimed to build a modern addressbook based on industry standards, using modern technologies and to replace the current proprietary data store (mork) with a database.

---
#### vContacts Overview / Current Feature set

**vContacts** is a normal **TB Extension**, the most current XPI can be downloaded [[from here]](https://github.com/neandr/vContacts/releases)   
The XPI installs into Thunderbird as usual.   
![XPIIcon](https://neandr.github.io/vContacts/customize.png)   
The "vContacts" toolbar button has to be added to the TB menu bar with the "Customize" feature on the main toolbar.

**vContacts** starts with two default contacts, feel free to modify/delete.

**New Contacts** can be added when the contact section is closed: The button [ + ] will add a new contact template.
Also the Main Menu (Hamburger Menu) has a 'Add new Contact'

**Import Contacts**   
The import currently reads **vCard** (.vcf) and **LDIF** (.LDIF) contact files. That way **TB/Addressbook** data which has been exported before with the LDIF format (and extension *.ldif) can be added.

For tesing purpose a **VCF Generator** is provided as part of the project [[see here]](https://github.com/neandr/vContacts/tree/master/generateVCF). It generates VCF addresses for test purpose and writes to an output file, it uses German based names, locations, generates tel/communication and mail entries, gender, birthday/anniversary dates. Each vCard has also a rev code and an UUID.

**Export vCard** Selected contact(s) can be exported to vCard files.

**Mailto/Links** showing on contact details are active for 'mailto' and normal 'url'. So clicking on it will directly open a TB Compose window or open the web browser for http/https links.

** Mailto with preferred address(es) with To/CC/BCC**  
Selecting multiple contacts allow to collect their preferred 'mailto' addresses and show them on another dialog. That dialog can used to edit the contacts, add additional before choosing the To, CC or Bcc addressing which will be used on the TB Compose dialog.

**Tag/Categories**  
Each contact can hold tags/categories. Same 'default' tags come with the installation, more will be loaded with contact import. A later vContact version will allow to define/edit/delete tags.

**Contact Lists**  
vContact doesn't work with contact lists as they are offered by Thunderbird/Addressbook. An alternative concept is the use of tags/categories. On the Contacts Sidebar a menu can be used to filter for a certain tag/category and to start bulk actions like 'mailto' or delete, more to come.

** vContact Main Menu ** -- _Hambuger Menu_   

A slide-in menu offers additional functionality  
![pic1](https://neandr.github.io/vContacts/vContacts_topmenu.png)   

With the top left button the menu is opened to show more handles:  

![pic2](https://neandr.github.io/vContacts/hambg_Menu_contactclosed.png)



Some menu items link to project documentation and the GIT project.

----
#### vContact Screenshots

Next two pic show a selected contact to be displayed with it details at the right part of the window, the second picture is a contact in edit mode.

![opened](https://neandr.github.io/vContacts/Contact_opened.png)

![edit](https://neandr.github.io/vContacts/Contact_Edit.png)   


**Working with Tags/Categories**   
To group contacts the Tags or Categories are used. Every contact can hold multiple tags, so it would 'belong' to different groups, like 'Projects' and 'FollowUp'.

![tag1](https://neandr.github.io/vContacts/Tag_add_1.png) ![tag2](https://neandr.github.io/vContacts/Tag_add_2.png)   
In Edit mode the button [Add Tag] allows to open a dropdown menu, the selected tag will be added to the contact. Delete tags in Edit mode with the [-] button.


**Change Preferred/Default attribute**   
The first entry for Phone, Email or Webpage is named the 'preferred' attribute which will be used as a 'default' eg. for collecting mail addresses.  
![prio_1](https://neandr.github.io/vContacts/Phone_change_prio_1.png) ![prio_2](https://neandr.github.io/vContacts/Phone_change_prio_2.png)   

To change an entry to become the preferred one use the [up] arrow button.


**Mailto / Compose Message for Contacts**   
Composing a message to a single contact just click on the mailto link.   

For sending to multiple addresses select the contacts on the sidebar ...   
![Mailto_1](https://neandr.github.io/vContacts/Mailto_1.png)

 ... open the Main Menu on the top ...   
 ![Mailto_2](https://neandr.github.io/vContacts/Mailto_2.png)   
 ... and select the link "Mailto selected Contact(s)"   

On the next dialog the selected mailto addresses are shown, additional addresses can be added or others be removed etc.   

![Mailto_3](https://neandr.github.io/vContacts/Mailto_3.png)   

Use the [To] or [CC] or [BCC] to open a compose window with the assembled addresses. The [Copy mailto] copies to the copy/paste buffer. The copied addresses can be added directly to one of the rows [To] or [CC] or [BCC] on the compose window.

 ![Mailto_4](https://neandr.github.io/vContacts/Mailto_4.png)


----
### vContact Status <small>- _Prove of Concept_</small>

vContact is in very early development state, little debugged, not tuned for performance, not fully tested and lot of functionality needs completion (e.g. using tags/categories, rendering of addresses, editing of personal and contact items).

 <i>**Use it on your own risk** -- which should be low risk, vContact doesn't write back to any TB environment.</i>


**HELP NEEDED**
For further development feedback is very much welcomed, for the functionality, for the UI, for the coding, for documentation, for testing functions ...
Please use the [GIT issues]

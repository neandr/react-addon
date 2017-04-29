**_Note Current project status isn't reflected with this doc, needs updating for Spring'17_**


### vContacts -- <small>*Refactoring from VUW Project 301/11*</small>
---


#### <br/> Open points
----
*=> indicates possible solution*

**Functionality**

* Adding a new contact should open the Edit Contact directly
* Search for contact 
* Tagging/Categories (the contact displayed tags are dummy entries)
* Importing same contact will make duplicate 
=> check REV and UID to decide how to handle
* LDIF import (also  for importing from TB/Addressbook) to be completed
* mailto with multiple contacts selected
* delete with multiple contacts selected
* contact editing on personal details incomplete
* hide empty sections with contact display

**Technical**

* use the 'hamburger' on the sidebar header to open a slider with menu items for Import, Export, New Contact, Reset DB, etc
* Remove the DB should close the vContacts tab
* Performance tests and code optimization
* test facility
* UI optimization (layout/colors/etc)
* Importing a file with multiple LDIF contacts will fail if one of the ldif contact can't parse with iCAL.js
=> change to parse each LDIF contact separately 


#### <br/> Status 2016-11-29
----

**UTF8 Support**
Now supports full UTF8 decoding of imported contacts (like with *.ldif)

**Notes**
The vCard 'NOTE' has been added and is shown on the Contact Section 'Notes'. The text can contain multiple lines. Importing from LDIF 'description' is converted to 'Notes'.

** Removing DB ** 

vContacts works with a indexedDB which is part of the TB profile the extension is stored to. Any testing would leave the db, also after de-installing the extension. See also issue *#34  Investigate removing DB when uninstalling*. 
On the Sidebar header vContacts offers a button to delete the indexdeDB. The user has to close the tab before reusing vContact => TODO.

**Added Personal Details**

- Gender
- Anniversary
- Rev:  [Save] of an edited contact will add/update 'REV', example: REV;VALUE=DATE-TIME:20161119T152140
          
**New Contact**

- [ + ] button on Contacts sidebar and Contact section generates a new contact with the name "New Contact", it sets/updates UID/REV
=>TODO -  should directly open Edit Mode with that new contact

**Photo support for remote picture ?**

- Photo could support binary(png/jpg) and Link (http:// and https://)
-- degrades performance ??  => needs analysis!
-- not supported with fruux! (Security reasons?)
- iCal.js (vcard3Properties.photo) need modification to allow 'uri' type
> see iCal.js issue # 
> https://github.com/neandr/ical.js/commit/c8bc7d274bc711765e7ffb335d7adbc89d3a5887

** Close Contact UI **

- [Close] on the Contact Section now closes the current displayed contact and on the Contacts Sidebar all contacts are un-selected

**UI Layout** see issue #52

- Contacts Sidebar and Contact Main has been redesigned to not overlap sections 
- rearranged 
  -- Contact Header for more space for tags (uses scroliing)
  -- buttons to right
  -- Home/Work Address changed to combine some lines

**ProdId** see issue #56

- AddressbookUtil.prodid will be added at export 
- If an imported card had a PRODID, it will be held in indexedDB but with export it will be replaced with vContacts string.

**Email / URL Link** see issue #43

- Contact fields with mailto or url are active and will open default apps (eg. TB or FX)
- mailto should also work with multiple contacts (using the first mailto entry)  => new bug to be opened

---
#### VUW project issues resolved on vContacts
See issue list at ** https://github.com/Thunderbird301/react-addon/issues **

**2016-11-15**   - Status
 
~~\# 56  vCard Exporting needs 'own' PRODID; (neandr)  ~~
\# 53  Importing vCard elements should always have a TYPE=; (neandr)
~~\# 52  Contact detail section draws over header in edit mode; (neandr)~~
~~\# 51  Editing Contact header not saved; (neandr)~~
\# 49  Reorder on name change; (hc09141)
\# 45  Migrate from Mork; (hc09141)
~~\# 44   Saving images to vCard; (hc09141)~~
~~\# 43  Send to selected contacts; (hc09141)~~
~~\# 42  Introduce confirmation modals; (hc09141)~~
\# 41  Search for contact; (hc09141)
\# 40  Implement Tagging; (rnnrn)
\# 39  Provide calendar entry or drop downs for birthdays enhancement; (hc09141)
~~\# 38  Add a new contact; (hc09141)~~
~~\# 37  Hide empty contact fields; (rnnrn)~~
\# 36  Notifications for database changes; (rnnrn)
\# 35  Handle vCard importing/exporting errors; (rnnrn)
\# 34  Investigate removing DB when uninstalling future; (rnnrn)
~~\# 33  Editing Contacts bug; (rnnrn)~~
~~\# 32  Importing Images enhancement; (rnnrn)~~
\# 31  Rejig name of extention enhancement; (rnnrn)
~~\# 29  UTF-8 support for importing contacts; (phrus)~~
~~\# 06  Disable switching between contacts while editing; ()~~

#### Notes / further Readings

* Matching vCard Instances https://tools.ietf.org/html/rfc6350#section-7.1.1

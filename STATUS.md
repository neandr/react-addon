**vContacts**   - Refactoring from VUW Project 301/11

---
#### <br/> Status 2016-11-19
----
**REV**

- [Save] of an edited contact will ad/update the vCard item 'REV'
ex: REV;VALUE=DATE-TIME:20161119T152140
          
#### <br/> Status 2016-11-18
---------
**New Contact**

- [ + ] button on Contacts header generates a new contact with name "New Contact", sets UUID
- TODO:  should directly open Edit Mode with that new contact

**Photo support for remote picture ??**

- Photo could support binary(png/jpg) and Link (http:// and https://)
-- degrades performance ??  --> need analysis!
-- not supported with fruux! (Security reasons)
- iCal.js (vcard3Properties.photo) need modification to allow 'uri' type
> see iCal.js issue # 
> https://github.com/neandr/ical.js/commit/c8bc7d274bc711765e7ffb335d7adbc89d3a5887

** Close Contact UI **
- Contact Main now closes and no contact on the Contacts Sidebar is selected with using [Close] button

**UI Layout** see issue #52

- Contacts Sidebar and Contact Main has been redesigned to not overlap sections 
- rearranged 
  -- Contact Header for more space for tags (uses scroliing)
  -- buttons to right
  -- Home/Work Address changed to combine some lines

**ProdId** see issue #56

-  AddressbookUtil.prodid will be added at export 
- If an imported card had a PRODID, it will be held in indexedDB but with export it will be replaced with own string.

**Email /URL Link** see issue #43

- Contact fields with mailto or url are active and will open default apps (eg. TB or FX)
- mailto should also work with multiple contacts (using the first mailto entry)  --> new bug to be opened

---
#### VUW project issues resolved on vContacts
See issue list at ** https://github.com/Thunderbird301/react-addon/issues **

**2016-11-15**   - Status
 
~~\# 56  vCard Exporting needs 'own' PRODID; (neandr)  ~~
\# 53  Importing vCard elements should always have a TYPE=; (neandr)
~~\# 52  Contact detail section draws over header in edit mode; (neandr)~~
\# 51  Editing Contact header not saved; (neandr)
\# 49  Reorder on name change; (hc09141)
\# 45  Migrate from Mork; (hc09141)
~~\# 44   Saving images to vCard; (hc09141)~~
~~\# 43  Send to selected contacts; (hc09141)~~
~~\# 42  Introduce confirmation modals; (hc09141)~~
\# 41  Search for contact; (hc09141)
\# 40  Implement Tagging; (rnnrn)
\# 39  Provide calendar entry or drop downs for birthdays enhancement; (hc09141)
\# 38  Add a new contact; (hc09141)
~~\# 37  Hide empty contact fields; (rnnrn)~~
\# 36  Notifications for database changes; (rnnrn)
\# 35  Handle vCard importing/exporting errors; (rnnrn)
\# 34  Investigate removing DB when uninstalling future; (rnnrn)
~~\# 33  Editing Contacts bug; (rnnrn)~~
~~\# 32  Importing Images enhancement; (rnnrn)~~
\# 31  Rejig name of extention enhancement; (rnnrn)
~~\# 29  UTF-8 support for importing contacts; (phrus)~~
~~\# 06  Disable switching between contacts while editing; ()~~

#### Notes

* Matching vCard Instances https://tools.ietf.org/html/rfc6350#section-7.1.1
# Thunderbird vContacts (New Addressbook)

This Thunderbird add-on was started in 2016 as a project of SCHOOL OF ENGINEERING AND COMPUTER SCIENCE/Victoria University of Wellington, New Zealand. 
Please find initial details here:
https://ecs.victoria.ac.nz/Courses/ENGR301_2016T1/Project11

The project is aimed to build a modern addressbook based on industry standards, using modern technologies and to replace the current data store (mork). 

## Technical concepts

First steps of realization is to build a Thunderbird add-on which is working locally (can be used in TB offline mode) with an underlaying database, some interfacing to local files for importing/exporting of contacts and collections.

## How to use

### TB vContacts Extension 
The most current XPI can be downloaded from [here](https://dl.dropboxusercontent.com/u/35444930/vContacts/vContacts.xpi)

Install the XPI into Thunderbird as usaual. 
You may add the "vContacts" toolbar button to the TB menu bar with the "Customize" feature on the main toolbar.

### TB vContacts Extension Building
The addon design makes use of React, indexedDB and a library iCAL.js which is also used with TB/Lightning.

Building the extension ensure your system needs to have installed `npm` and `nodejs` and run 

* For Unix-like systems: `make`

* For Windows: `build.ps1` in powershell

#!/usr/bin/env python
# -*- coding: utf-8 -*-

version = 'gWahl   17-05-04_13'
versionNo = '.2'

'''
VCF  Addressgenerator
----------------------------------------
   Generates random VCF addresses for test purpose and writes to an output file.
   Uses German based names, locations, generates tel/communication and mail
   entries, gender, birthday/anniversary dates. Each vCard has also a rev code
   and UUID.

   Files and code is uft8

   Starting with 
      ./generateVCards [cardCount]
             eventually need to change mode with:   chmod 755 generateVCards.py
   
   Parameter 
      cardCount  optional, default = 5 (see parameter nVCF), 
                INT: if given 'cardCount' is the number of random vCards generated 

   Output
      File 'vcfCards.vcf' is written to start directory of generateVCards

   Note:
       The ANNIVERSARY should be disabled in the code if vCards are to be
       imported to fruux.com. fruux/contacts will fail for cards
       with these elements (open bug report with fruux) 

'''

nVCF = 5

import random, sys
from random import randint
import uuid
from datetime import datetime
from datetime import timedelta

givenNamesF    = 'data/gNamesF.txt';
givenNamesM    = 'data/gNamesM.txt';
givenNames     = 'data/gNames.txt';
familyNames    = 'data/familyNames.txt';
fileStreets    = 'data/streets.txt';
filePlzOrt     = 'data/plz-ort.txt';
fileCategories = 'data/categories.txt';
vcfFile        = 'vcfCards.vcf'

lStreets = ""
lPlzOrt  = ""

fmts = {'gender':'F,M', 'places':'WORK,HOME', 'mail':'WORK,HOME', 'com':'HOME,MSG,WORK,PREF,VOICE,FAX,CELL,VIDEO,CAR'}


def randomItem(fmt):
   items = fmts[fmt]
   r = random.randint(0,len(items.split(','))-1)
   return items.split(',')[r]


      #+ "\nCATEGORIES:" + randomLine(lCategories)
def getCategories(lCategories):
   r = random.randint(0,4)
   if r <= 1: return ""

   print(" # of cat:" + str(r))

   cat = "\nCATEGORIES:"
   for i in range(1,r):
      strg = randomLine(lCategories)
      if i != 1: cat += ','
      cat += strg

   print("  cat  >>" + cat + "<<")
   return cat

def getGender(gender):
   r = random.randint(0,1)
   if r == 0: return ""
   return "\nGENDER:" + gender


def getEMAIL(gName, famName):
   r = random.randint(0,3)
   if r == 0: return ""
   if r > 0: mail =        "\nEMAIL;TYPE=" + randomItem('mail') + ":"+ gName[0] + "_" + famName + "@isp.net"
   if r > 1: mail = mail + "\nEMAIL;TYPE=" + randomItem('mail') + ":"+ "info." + famName + "@xyz.net"
   if r > 2: mail = mail + "\nEMAIL;TYPE=" + randomItem('mail') + ":"+ famName[0] + "_" + gName + "@fm.com"
   return mail


def preTel():
   return '{:04d}'.format(random.randint(1,9999))

def localTel():
   return '{:06d}'.format(random.randint(1,999999))


def randomHouseN(min=1, max=196) :
   result = random.randint(min,max);
   if (random.randint(0,100)<=10) :
      #// fügt mit 10% Wahrscheinlichkeit 
      #// einen Buchstaben zur Nummer hinzu
      buchstaben = ['a','b','c', 'd']
      result = str(result) + buchstaben[random.randint(0,(len(buchstaben)-1))]
   return str(result)


def getADR(lPlzOrt, lStreets):
   r = random.randint(0,3)
   n =0
   adr = ""
   for i in range(0,r):
      plzOrt = randomLine(lPlzOrt)
      cOrt = str(plzOrt).split(" ")[1]
      cPLZ = str(plzOrt).split(" ")[0]

      adr += "\nADR;TYPE="+ randomItem('places') +":;;" + randomLine(lStreets) + " " + randomHouseN() + ";" + cOrt + ";;" + cPLZ + ";Germany"
   return adr


def randomDate():
   import datetime
   startdate=datetime.date(2000,1,1)
   date=startdate-timedelta(randint(1,15000))
   return str(date)[:10]


def randomLine(list):
   return (list[random.randint(0,(len(list)-1))]).strip()


def readFile(sFile):
   with open(sFile, 'r') as infile:
      docLines = infile.read()  # Read file content
   sList = docLines.splitlines()

   #print (sFile, len(sList))
   return sList


def main ():
   global nVCF, versionNo

   if len(sys.argv) == 2:
       nVCF = int(sys.argv[1])

  #print 'Argument List:', str(nVCF)


   lGivenNamesF = readFile(givenNamesF)
   lGivenNamesM = readFile(givenNamesM)
   lGivenNames = readFile(givenNames)
   lFamilyNames = readFile(familyNames)

   lStreets = readFile(fileStreets)
   lPlzOrt = readFile(filePlzOrt)

   lCategories = readFile(fileCategories)

   genVCF = open(vcfFile, 'w')

   for i in range(0, nVCF):
      gender = randomItem('gender')
      if gender == 'M':
         gName = randomLine(lGivenNamesM)
      if gender == 'F':
         gName = randomLine(lGivenNamesF)

      fName = randomLine(lFamilyNames)

      rev = (str(datetime.utcnow().isoformat())[:19]+"Z")


      vcf = ["BEGIN:VCARD\nVERSION:3.0\nPRODID:-//genVCF Version " + versionNo + "//DE" 
      + "\nUID:" + str(uuid.uuid4())
      + "\nREV:" + rev

      + "\nN:" + fName + ";" + gName + ";;;"
      + "\nFN:" + gName + " " + fName
      + "\nNICKNAME:" + "my" + gName

      + "\nBDAY:" + str(randomDate())

      # version 4 attributes !
      #+ "\nGENDER:" + gender
      + getGender(gender)

      #+ "\nX-ANNIVERSARY:" + str(randomDate())   #   doesn't work with fruux!
      + "\nANNIVERSARY:" + str(randomDate())      #   doesn't work with fruux!
      + "\nLANG:DE"

      #+ "\nCATEGORIES:" + randomLine(lCategories)
      + getCategories(lCategories)

      + getEMAIL(gName, fName)

      + "\nTEL;TYPE=" + randomItem('com') +":" + "+49-" + preTel() +"-" + localTel()
      + "\nTEL;TYPE=" + randomItem('com') + ',' + randomItem('com') +":" + "+49-" + preTel() +"-" + localTel()

      + getADR(lPlzOrt, lStreets)

      + "\nURL;TYPE=" + randomItem('places') + ":" + "https://fruux.com"
      + "\nURL;TYPE=INTERNET:https://tools.ietf.org/html/rfc6350#page-47"

      + "\nNOTE:" + "I'm a fictitious person \\nand not known in Germany nor in \\n PL 50-315  Wrocław"

      + "\nEND:VCARD\n\n"]

      print(i, "".join(vcf))

      genVCF.write("".join(vcf))

   genVCF.close()

'''
Definitions in https://tools.ietf.org/html/rfc2426

N:
   The structured type value corresponds, in
   sequence, to the Family Name, Given Name, Additional Names, Honorific
   Prefixes, and Honorific Suffixes. The text components are separated
   by the SEMI-COLON character (ASCII decimal 59). Individual text
   components can include multiple text values (e.g., multiple
   Additional Names) separated by the COMMA character (ASCII decimal
   44).

ADR: The structured type value corresponds,
   in sequence, to the post office box; the extended address; the street
   address; the locality (e.g., city); the region (e.g., state or
   province); the postal code; the country name.

Examples from https://tools.ietf.org/html/rfc2426#page-39

   BEGIN:vCard
   VERSION:3.0
   FN:Frank Dawson
   ORG:Lotus Development Corporation
   ADR;TYPE=WORK,POSTAL,PARCEL:;;6544 Battleford Drive
   ;Raleigh;NC;27613-3502;U.S.A.
   TEL;TYPE=VOICE,MSG,WORK:+1-919-676-9515
   TEL;TYPE=FAX,WORK:+1-919-676-9564
   EMAIL;TYPE=INTERNET,PREF:Frank_Dawson@Lotus.com
   EMAIL;TYPE=INTERNET:fdawson@earthlink.net
   URL:http://home.earthlink.net/~fdawson
   END:vCard

   BEGIN:vCard
   VERSION:3.0
   FN:Tim Howes
   ORG:Netscape Communications Corp.
   ADR;TYPE=WORK:;;501 E. Middlefield Rd.;Mountain View;
   CA; 94043;U.S.A.
   TEL;TYPE=VOICE,MSG,WORK:+1-415-937-3419
   TEL;TYPE=FAX,WORK:+1-415-528-4164
   EMAIL;TYPE=INTERNET:howes@netscape.com
   END:vCard
'''


#-------------------------------------------
if __name__ == '__main__':

   rcode = main()

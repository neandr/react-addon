#  gWahl  2017-08-20

NAME:=vContacts
	NAME_XPI:=$(NAME).xpi
	NAME_BAK_XPI:=$(NAME)$(shell date +'_%Y-%m-%d_%H%M').xpi

	#  Building a XPI for Thunderbird vContacts - Addressbook)
	#  See at https://github.com/neandr/vContacts/releases for
	#  current XPI version

	XPI_PROFILE=201708.GW.52
	XPI_PROFILES:=/media/guenter/DATA/_Mozilla/TB_gW/Profiles/$(XPI_PROFILE)/extensions
	XPI_LOCATION:=$(XPI_PROFILES)/tbvcontacts@gneandr.de.xpi


XPI_SRC:=$(shell find content -type f) $(shell find modules -type f) $(shell find defaults -type f)  $(wildcard react/*.jsx)
SRC = $(wildcard react/*.jsx)
LIB = $(SRC:react/%.jsx=modules/react/%.js)

modules/react:
	mkdir -p $(@D)

modules/react/%.js: react/%.jsx
ifeq (, $(shell which node ))
	nodejs node_modules/.bin/babel $< -o $@ --presets react
else
	node node_modules/.bin/babel $< -o $@ --presets react
endif

react: npm modules/react $(LIB)
xpi: $(NAME_XPI)
   #
   #  Copy the xpi to current directory  -->  $(MAKE_XPI)
   #  To make $(MAKE_XPI) public upload to Github Releases,
   #  e.g  https://github.com/neandr/vContacts/releases
   #
   #
	$(shell cp $(NAME_XPI) $(XPI_LOCATION))
	@echo ___ XPI ___ generated:   $(NAME_XPI)
	@echo ___ XPI ___ generated:   $(XPI_LOCATION)
	@echo ___ XPI ____bak:         $(NAME_BAK_XPI)

	$(shell cp $(NAME_XPI) ../vContacts_BAK/backups/$(NAME_BAK_XPI))

	# @echo $(XPI_NAME) > stamp.log
	@echo $(notdir $(CURDIR))$(shell date +'_%Y-%m-%d_%H%M') >> stamp.log


$(NAME_XPI): $(XPI_SRC) $(LIB) chrome.manifest  install.rdf
	zip -r $@ $^

npm: node_modules
node_modules: package.json
	npm install

clean:
	rm -f $(LIB)
	rm -f $(NAME_XPI)

all: react xpi

rebuild: clean all

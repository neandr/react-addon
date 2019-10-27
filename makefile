#  gNeandr (gWahl)  2019-10-27

NAME:=vContacts
	NAME_XPI:=$(NAME).xpi
	# NAME_XPI:=$(NAME)$(shell date +'_%Y-%m-%d_%H%M').xpi

	#  Building a XPI for Thunderbird vContacts - Addressbook)
	#  See at https://github.com/neandr/vContacts/releases
	#  for current XPI version

	# How to generate a new XPI:
	#   cd /change/to/dir/with/vContactsWX
	#   sudo make all
	#     or
	#   sudo make rebuild

	# To install/update npm
	#   cd /your/project/dir
	#   npm init -y
	#   npm install babel-cli@6 babel-preset-react-app@3


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
	@echo $(notdir $(CURDIR))$(shell date +'_%Y-%m-%d_%H%M') >> stamp.log

$(NAME_XPI): $(XPI_SRC) $(LIB) chrome.manifest install.rdf
	zip -r $@ $^

npm: node_modules
node_modules: package.json
	npm install

clean:
	rm -f $(LIB)
	rm -f $(NAME_XPI)

all: react xpi

rebuild: clean all

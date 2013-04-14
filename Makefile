.PHONY: build build_bootstrap install

build:
	@echo "Compiling stylesheets..."
	@lessc --yui-compress css/main.less > css/main.css
	@echo "Compiling javascripts..."
	@uglifyjs ./js/main.js ./js/modules/backtracking.js -b -o ./js/main.min.js
	@echo "Creating static site..."
	@jekyll
	@echo "Done."

build_bootstrap:
	@echo "Building bootstrap..."
	@cd ./css/bootstrap && make build
	@cp ./css/bootstrap/docs/assets/js/bootstrap.min.js ./js/bootstrap.min.js
	@cp ./css/bootstrap/img/glyphicons-halflings.png ./img/glyphicons-halflings.png
	@cp ./css/bootstrap/img/glyphicons-halflings-white.png ./img/glyphicons-halflings-white.png
	@echo "Done."

install:
	npm install -g lessc
	npm install -g uglify-js
	cd ./css/bootstrap && npm install
	gem install jekyll
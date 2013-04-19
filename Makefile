.PHONY: build build_bootstrap install clean

build:
	@echo "Compiling stylesheets..."
	@lessc --yui-compress css/main.less > css/main.css
	@echo "Compiling javascripts..."
	@uglifyjs \
		./js/main.js \
		./js/modules/backtracking.js \
		-b -o ./js/main.min.js
	@echo "Creating static site..."
	@jekyll --url http://127.0.0.1/uni/matheprisma-responsive/_site/
	@echo "Done."

build_bootstrap:
	@echo "Building bootstrap..."
	@cd ./css/bootstrap && make build
	@cp ./css/bootstrap/docs/assets/js/bootstrap.min.js ./js/bootstrap.min.js
	@cp ./css/bootstrap/fonts/* ./fonts/
	@echo "Done."

install:
	npm install -g lessc
	npm install -g uglify-js
	cd ./css/bootstrap && npm install
	gem install ijekyll

clean:
	@rm -fr ./fonts/*
	@echo "Done."
TESTS = test/*.test.js
REPORTER = spec
TIMEOUT = 3000
MOCHA_OPTS =
REGISTRY = --registry=https://registry.npm.taobao.org

install:
	@npm install $(REGISTRY) \
		--disturl=http://npm.taobao.org/dist

jshint: install
	@-./node_modules/.bin/jshint ./

test: install
	@./node_modules/.bin/mocha \
	  --harmony \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS) \
		$(TESTS)

test-cov: install
	@node --harmony \
		node_modules/.bin/istanbul cover --preserve-comments \
		./node_modules/.bin/_mocha \
		-- -u exports \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS) \
		$(TESTS)

test-travis: install
	@node --harmony \
		node_modules/.bin/istanbul cover --preserve-comments \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- \
		--reporter dot \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

autod: install
	@./node_modules/.bin/autod $(REGISTRY) -w --prefix "~" -e example.js
	@$(MAKE) install

.PHONY: test test-all

.PHONY: test lint

lint:
	deno fmt --check --unstable --ignore=lib,testdata
	deno lint --unstable --ignore=lib,testdata

test:
	deno test --allow-read --allow-run

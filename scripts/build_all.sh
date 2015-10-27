#!/bin/bash -e
ls -l public/
PARSE_CONFIG_DIR="config"
mkdir -p "$PARSE_CONFIG_DIR"
cp -rf public public
ls -lf public
go run scripts/gen_travis_parse_keys.go > "$PARSE_CONFIG_DIR/global.json"
parse deploy
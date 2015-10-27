#!/bin/bash -e
PARSE_CONFIG_DIR="parse_app/config"
mkdir -p "$PARSE_CONFIG_DIR" # git does not allow empty dirs to be checked in.
cp -rf public parse_app/public # copy generated website to parse_app location
go run scripts/gen_travis_parse_keys.go > "$PARSE_CONFIG_DIR/global.json" #gen keys.
cd parse_app
parse deploy #deploy to parse
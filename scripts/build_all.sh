#!/bin/bash -e
PARSE_CONFIG_DIR="config"
mkdir -p "$PARSE_CONFIG_DIR" # git does not allow empty dirs to be checked in.
go run scripts/gen_travis_parse_keys.go > "$PARSE_CONFIG_DIR/global.json" #gen keys.
parse deploy #deploy to parse
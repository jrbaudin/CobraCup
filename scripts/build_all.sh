#!/bin/bash -e
PARSE_CONFIG_DIR="config"
mkdir -p "$PARSE_CONFIG_DIR"
ls -lf public
go run scripts/gen_travis_parse_keys.go > "$PARSE_CONFIG_DIR/global.json"
parse deploy

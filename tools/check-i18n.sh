#!/bin/bash

for FILE in src/messages/*; do
    if [[ "$FILE" != "src/messages/en.json" ]]; then
        echo "== $FILE =="
        echo
        FORCE_COLOR=0 ./node_modules/.bin/comparejson src/messages/en.json "$FILE";
    fi
done

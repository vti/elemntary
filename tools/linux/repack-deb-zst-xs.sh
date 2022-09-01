#!/bin/bash

#set -x

FILE=$1
TEMP_DIR=$(mktemp -d)

if file "$FILE" | grep 'data compression xz'; then
    echo 'No need to convert'
    exit 0
fi

cp "$FILE" "$TEMP_DIR/"
mv "$FILE" "$FILE.old"

BASENAME="$(basename "$FILE")"

(cd $TEMP_DIR && ar x "$BASENAME" && rm "$BASENAME")

(cd $TEMP_DIR && zstd -d < control.tar.zst | xz > control.tar.xz)

(cd $TEMP_DIR && zstd -d < data.tar.zst | xz > data.tar.xz)

(cd $TEMP_DIR && ar -m -c -a sdsd "$BASENAME" debian-binary control.tar.xz data.tar.xz)

cp "$TEMP_DIR/$BASENAME" "$(dirname "$FILE")"

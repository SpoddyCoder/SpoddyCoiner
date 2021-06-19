#!/usr/bin/env bash
#
# build helper script
# $1 = output dir name (gas or dist)
#

if [ "$#" != "1" ]; then
    echo "Error! $0 - missing output dirname"
    exit 1;
fi

# set version in generated Code.js & also update it in the package.json, package-lock.json
VERS=$(cat ./version.txt)
sed -i "s/__VERSION__/$VERS/g" ./$1/Code.js
sed -i "/version/c\    \"version\" : \"$VERS\"," ./package*.json

# a little gentle sed because exports & require statements cannot work in the deployed AppsScript environment
# ...and yes i tried a webpack loader plugin to sort this but failed
sed -i '/^module\.exports/d; /^exports\./d; /require(/d; /eslint-disable/d;' ./$1/Code.js

# remove the webpack generated main file, we do not need this for GAS
rm -f ./$1/main

exit 0
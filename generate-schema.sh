#!/bin/bash -eu
curl https://api.openbd.jp/v1/schema | jq > ./src/schema/openbd.json
npx json-schema-to-zod -s ./src/schema/openbd.json -t ./src/schema/openbd.ts

#!/bin/bash -Ceu
curl https://api.openbd.jp/v1/schema > ./src/schema/openbd.json
npx json-schema-to-zod -s ./src/schema/openbd.json -t ./src/schema/openbd.ts

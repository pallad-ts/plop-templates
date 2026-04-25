#!/usr/bin/env bash

set -euo pipefail

PKG_NAME=$(node -p "require('./package.json').name")
PKG_VERSION=$(node -p "require('./package.json').version")
PACKAGE_ID="${PKG_NAME}@${PKG_VERSION}"
PUBLISHED_VERSION=$(npm view "${PACKAGE_ID}" version 2>/dev/null || true)

if [[ -n "${PUBLISHED_VERSION}" ]]; then
	echo "Skipping ${PACKAGE_ID} (already published)"
else
	echo "Publishing ${PACKAGE_ID}"
	npm publish --provenance
fi

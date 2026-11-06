import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'))
const cards = JSON.parse(readFileSync(join(here, 'data', 'cards.json'), 'utf8'))
const app = readFileSync(join(here, 'src', 'app.js'), 'utf8')
const withCards = app.replace('/*__CARDS__*/', 'const CARDS = ' + JSON.stringify(cards) + ';')

const bundle = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory(require) {
    const React = require('react');
    const { useState, useEffect, useRef, useCallback } = React;
    const h = React.createElement;
${withCards}
  },
});
`
writeFileSync(join(here, 'client.js'), bundle)
console.log('client.js written:', bundle.length, 'bytes; id:', pkg.name, '; cards:', Object.keys(cards).length)
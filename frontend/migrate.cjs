const fs = require('fs')
const path = require('path')

function walk(dir) {
  fs.readdirSync(dir).forEach((f) => {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) {
      walk(p)
    } else if (p.endsWith('.vue')) {
      let c = fs.readFileSync(p, 'utf8')
      if (c.includes('<script setup>') && !c.includes('<script setup lang="ts">')) {
        c = c.replace('<script setup>', '<script setup lang="ts">')
        fs.writeFileSync(p, c)
      }
    }
  })
}
walk('./src')
console.log('Migrated .vue files to lang="ts"')

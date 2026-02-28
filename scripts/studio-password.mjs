#!/usr/bin/env node

/**
 * Generate bcrypt password hashes for Studio editor allowlist.
 *
 * Usage:
 *   node scripts/studio-password.mjs <password>
 *   node scripts/studio-password.mjs                 # interactive prompt
 *
 * Output: bcrypt hash ready to paste into STUDIO_EDITORS env var.
 */

import bcrypt from 'bcryptjs'
import { createInterface } from 'node:readline'

const password = process.argv[2]

if (password) {
  const hash = await bcrypt.hash(password, 12)
  console.log(`\nPassword hash:\n${hash}\n`)
  console.log(`Example STUDIO_EDITORS entry:`)
  console.log(`{"email":"editor@example.com","passwordHash":"${hash}","name":"Editor Name"}\n`)
  process.exit(0)
}

// Interactive mode
const rl = createInterface({ input: process.stdin, output: process.stderr })

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve))
}

const email = await ask('Editor email: ')
const name = await ask('Editor name: ')
const pass = await ask('Password: ')

const hash = await bcrypt.hash(pass, 12)
rl.close()

console.log(`\nGenerated entry (add to STUDIO_EDITORS env var):\n`)
console.log(JSON.stringify({ email, passwordHash: hash, name }))
console.log()

import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
if (process.platform !== 'darwin') throw Error('MACOS_REQUIRED');
mkdirSync(`${root}dist`, { recursive: true, mode: 0o700 });
execFileSync('/usr/bin/swiftc', ['-module-cache-path', `${root}dist/module-cache`, `${root}native/Keychain.swift`, '-o', `${root}dist/sport-compass-keychain`], { stdio: 'inherit' });
execFileSync(`${root}dist/sport-compass-keychain`, ['self-check'], { stdio: 'inherit' });

# Vendored X25519 fallback

`x25519.mjs` comes from `@noble/curves@1.9.7` and `@noble/hashes@1.8.0`, bundled with `esbuild@0.25.12` for Safari 15. The adjacent MIT license files apply. Noble publishes its audits, which cover upstream versions of the libraries. [Noble audit references](https://github.com/paulmillr/noble-curves#security)

To regenerate in a temporary directory, install those three pinned packages. Use an entry module containing `export { x25519 } from '@noble/curves/ed25519.js';`. In an esbuild on-load plugin for the curves package's `esm/ed25519.js`, keep the prefix before the comment `// Hash To Curve Elligator2 Map` and remove the `export ` prefix on `export const` declarations except `x25519`. Bundle the entry with `bundle: true`, `format: 'esm'`, `platform: 'browser'` and `target: 'safari15'`. This removes unused EdDSA, Ristretto and hashing code through tree shaking. The X25519 arithmetic and its dependencies are upstream code.

The shipped bundle exports only X25519. SHA-256, HKDF and AES-GCM use WebCrypto even when the fallback is active. The engine tests check this bundle against an RFC 7748 vector and a Node peer. The loopback browser test also forces the WebCrypto X25519 availability error to exercise the fallback.

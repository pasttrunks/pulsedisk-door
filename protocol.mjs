// Fixed-width handshake fields and AES-GCM record format are specified in ../DOOR-PROTOCOL.md.
export const VERSION = 2;
export const CHUNK = 1024 * 1024;
export const utf8 = (s) => new TextEncoder().encode(s);
export const toJson = (bytes) => JSON.parse(new TextDecoder().decode(bytes));
export const json = (value) => utf8(JSON.stringify(value));

export function join(...parts) {
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}

const hash = async (...parts) => new Uint8Array(await crypto.subtle.digest('SHA-256', join(...parts)));
const label = (purpose) => join(utf8('pulsedisk-door-' + purpose + '\0'), Uint8Array.of(VERSION));
export const commitment = (pub, nonce) => hash(label('commit'), pub, nonce);
export const transcript = (id, commit, browserPub, pcPub, browserNonce, pcNonce) =>
  hash(label('transcript'), id, commit, browserPub, pcPub, browserNonce, pcNonce);

const SHAPES = ['circle', 'square', 'triangle', 'star', 'moon', 'leaf', 'drop', 'bolt'];
const COLORS = ['blue', 'green', 'orange', 'pink', 'violet', 'teal', 'yellow', 'red'];
export async function session(shared, digest) {
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: digest, info: label('key') },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const sas = await hash(label('sas'), digest);
  const bits = (sas[0] << 10) | (sas[1] << 2) | (sas[2] >> 6);
  const shapes = [12, 6, 0].map((shift) => ({ shape: SHAPES[(bits >> (shift + 3)) & 7], color: COLORS[(bits >> shift) & 7] }));
  return { key, shapes };
}

export async function keyPair(subtle = crypto.subtle) {
  let pair;
  try {
    pair = await subtle.generateKey({ name: 'X25519' }, false, ['deriveBits']);
  } catch (err) {
    if (err.name !== 'NotSupportedError') throw err;
    const { x25519 } = await import('./vendor/x25519.mjs');
    const secret = crypto.getRandomValues(new Uint8Array(32));
    return { pub: x25519.getPublicKey(secret), shared: (peer) => x25519.getSharedSecret(secret, peer) };
  }
  return {
    pub: new Uint8Array(await subtle.exportKey('raw', pair.publicKey)),
    async shared(peer) {
      const publicKey = await subtle.importKey('raw', peer, { name: 'X25519' }, false, []);
      return new Uint8Array(await subtle.deriveBits({ name: 'X25519', public: publicKey }, pair.privateKey, 256));
    },
  };
}

export function nonce(direction, counter) {
  const bytes = new Uint8Array(12);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, direction);
  view.setBigUint64(4, counter);
  return bytes;
}

export async function seal(key, direction, counter, aad, plain) {
  const iv = nonce(direction, counter);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: utf8(aad) }, key, plain);
  return join(iv.subarray(4), new Uint8Array(encrypted));
}

export async function open(key, direction, counter, aad, frame) {
  const iv = nonce(direction, counter);
  if (frame.length >= 24 && iv.subarray(4).every((byte, i) => byte === frame[i])) {
    try {
      return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: utf8(aad) }, key, frame.subarray(8)));
    } catch { /* A relay may corrupt or substitute a record. */ }
  }
  throw Object.assign(new Error('The connection could not be verified.'), { code: 'BAD_SEAL' });
}

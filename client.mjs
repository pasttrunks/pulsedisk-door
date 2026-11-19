import { decodeAddress } from './address.mjs';
import { CHUNK, VERSION, commitment, join, json, keyPair, open, seal, session, toJson, transcript } from './protocol.mjs';

const fail = (code) => Object.assign(new Error(code), { code });
const empty = new Uint8Array(0);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function openRelay(words) {
  const { host, port } = decodeAddress(words, location.hostname === '127.0.0.1');
  const origin = new URL('http://' + host + ':' + port).origin;
  const popup = window.open(origin + '/relay', '_blank', 'popup,width=360,height=160');
  if (!popup) throw fail('POPUP_BLOCKED');
  let next = 0;
  let pending;
  let ready = false;
  const timeout = 12000;
  const max = CHUNK + 24;

  function receive({ origin: sender, source, data }) {
    if (sender !== origin || source !== popup || !data) return;
    if (data.kind === 'pulsedisk-ready') ready = true;
    if (data.kind === 'pulsedisk-response' && pending && pending.id === data.id &&
        Number.isInteger(data.status) && data.body instanceof ArrayBuffer && data.body.byteLength <= max) {
      pending.finish(null, { status: data.status, bytes: new Uint8Array(data.body) });
    }
  }
  window.addEventListener('message', receive);

  function close() {
    pending?.finish(fail('CLOSED'));
    window.removeEventListener('message', receive);
    popup.close();
  }

  async function waitReady() {
    const until = Date.now() + timeout;
    while (!ready) {
      if (popup.closed || Date.now() >= until) throw fail('RELAY_UNAVAILABLE');
      await sleep(150);
    }
  }

  function send(path, bytes, guest) {
    return new Promise((resolve, reject) => {
      if (popup.closed || pending) return reject(fail('RELAY_UNAVAILABLE'));
      const id = ++next;
      const timedOut = setTimeout(() => pending.finish(fail('RELAY_UNAVAILABLE')), timeout);
      pending = {
        id,
        finish(err, response) {
          clearTimeout(timedOut);
          pending = undefined;
          if (err) reject(err);
          else resolve(response);
        },
      };
      const body = bytes.slice().buffer;
      try { popup.postMessage({ kind: 'pulsedisk-request', id, path, guest, body }, origin, [body]); }
      catch (err) { pending.finish(err); }
    });
  }

  return { send, close, waitReady };
}

function checked({ status, bytes }) {
  if (status === 200) return bytes;
  let detail;
  try { detail = toJson(bytes); } catch { /* A closed relay may have no response body. */ }
  const err = fail(typeof detail?.code === 'string' ? detail.code : 'RELAY_UNAVAILABLE');
  err.status = status;
  err.retryAfter = detail?.retryAfter;
  throw err;
}

export async function pair(send) {
  const keys = await keyPair();
  const browserNonce = crypto.getRandomValues(new Uint8Array(32));
  const version = Uint8Array.of(VERSION);
  const commit = await commitment(keys.pub, browserNonce);
  const challenge = checked(await send('/door/commit', join(version, commit)));
  if (challenge.length !== 77 || challenge[0] !== VERSION) throw fail('PAIRING_FAILED');
  const id = challenge.subarray(1, 13);
  const pcPub = challenge.subarray(13, 45);
  const pcNonce = challenge.subarray(45);
  const digest = await transcript(id, commit, keys.pub, pcPub, browserNonce, pcNonce);
  const { key, shapes } = await session(await keys.shared(pcPub), digest);
  const response = checked(await send('/door/reveal', join(version, id, keys.pub, browserNonce)));
  const proof = toJson(await open(key, 1, 0n, 'hello', response));
  if (proof.ok !== true) throw fail('PAIRING_FAILED');
  const guest = btoa(String.fromCharCode(...id)).replace(/\+/g, '-').replace(/\//g, '_');
  return makeSession(send, key, guest, shapes);
}

function makeSession(send, key, guest, shapes) {
  let counter = 0n;
  let tail = Promise.resolve();
  let files;
  function request(path, aad, data) {
    // Serializing the exchange also serializes state polls and overlapping UI actions.
    const run = tail.then(async () => {
      const n = ++counter;
      const record = await seal(key, 0, n, aad, data);
      const reply = checked(await send(path, record, guest));
      return open(key, 1, n, aad, reply);
    });
    tail = run.catch(() => {});
    return run;
  }

  const op = (data) => request('/door/op', 'op', json(data)).then(toJson);
  const state = () => request('/door/state', 'state', empty).then(toJson);
  const chunk = (upload, seq, bytes) => request('/door/chunk?u=' + upload + '&s=' + seq,
    'chunk:' + upload + ':' + seq, bytes).then(toJson);
  const offer = async () => (files = (await op({ op: 'offer' })).files);

  async function waitAllowed() {
    for (;;) {
      const { state: current } = await state();
      if (current === 'allowed') return;
      if (current !== 'knocking') throw fail(current === 'denied' ? 'DENIED' : 'CLOSED');
      await sleep(500);
    }
  }

  async function upload(file, { signal, onProgress } = {}) {
    const begin = await op({ op: 'begin', name: file.name || 'File', size: file.size });
    try {
      for (let offset = 0, seq = 0; offset < file.size; offset += CHUNK, seq++) {
        if (signal?.aborted) throw fail('CANCELLED');
        const bytes = new Uint8Array(await file.slice(offset, offset + CHUNK).arrayBuffer());
        const ack = await chunk(begin.upload, seq, bytes);
        onProgress?.(ack.received);
      }
      if (signal?.aborted) throw fail('CANCELLED');
      return (await op({ op: 'end', upload: begin.upload })).name;
    } catch (err) {
      await op({ op: 'abort', upload: begin.upload }).catch(() => {});
      throw err;
    }
  }

  async function download(i, { onProgress } = {}) {
    const file = (files ?? await offer()).find((f) => f.i === i);
    if (!file) throw fail('NO_FILE');
    const chunks = [];
    let offset = 0;
    try {
      for (let seq = 0; seq === 0 || offset < file.size; seq++) {
        const bytes = await request('/door/download', 'download', json({ i, seq }));
        if (bytes.length !== Math.min(CHUNK, file.size - offset)) throw fail('BAD_SEAL');
        chunks.push(bytes);
        offset += bytes.length;
        onProgress?.(offset);
      }
    } catch (err) {
      await request('/door/download', 'download', json({ i, cancel: true })).catch(() => {});
      throw err;
    }
    return new Blob(chunks, { type: 'application/octet-stream' });
  }

  return {
    guest, shapes, state, waitAllowed, offer, upload, download, op, chunk,
    leave: () => op({ op: 'leave' }),
  };
}

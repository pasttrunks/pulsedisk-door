// Single-tab WebRTC DataChannel transport for PulseDisk Doorway.
// Uses the Cloudflare signaling Worker only for initial SDP/ICE setup, then closes the signaling socket
// immediately once the direct DataChannel opens. All pairing shapes and AES-256-GCM records stay end-to-end.
export const DEFAULT_SIGNAL_URL = 'https://pulsedisk-door-signal.discordsammy2.workers.dev';

const SLICE_BYTES = 32 * 1024;
const MAX_BODY_BYTES = 1024 * 1024 + 64;
// Same Wi-Fi only (security review, 2026-11-20): no STUN or TURN, and only private or mDNS (.local) host
// candidates leave this page, so the PC is reached on the local network or not at all.
const ICE_SERVERS = [];
const isPrivateV4 = (a) => /^(10\.|192\.168\.|169\.254\.)/.test(a) || /^172\.(1[6-9]|2\d|3[01])\./.test(a);
const isPrivateV6 = (a) => /^(fe8|fe9|fea|feb|fc|fd)/i.test(a.replace(/^\[/, ''));
const isLocalAddress = (a) => a.endsWith('.local') || isPrivateV4(a) || (a.includes(':') && isPrivateV6(a));
export function isLocalCandidate(candidate) {
  const parts = String(candidate).replace(/^a=/, '').replace(/^candidate:/, '').trim().split(/\s+/);
  return (parts[7] || '') === 'host' && isLocalAddress(parts[4] || '');
}
export function localOnlySdp(sdp) {
  return String(sdp).split(/\r\n/).filter((line) => !line.startsWith('a=candidate:') || isLocalCandidate(line)).join('\r\n');
}
const fail = (code) => Object.assign(new Error(code), { code });

function wsUrlOf(baseUrl, room) {
  const u = new URL('/room/' + encodeURIComponent(room) + '?role=guest', baseUrl);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  return u.toString();
}

export function openWebRtc(room, signalUrl = DEFAULT_SIGNAL_URL, { connectTimeoutMs = 5500, rpcTimeoutMs = 20000 } = {}) {
  if (typeof RTCPeerConnection !== 'function' || typeof WebSocket !== 'function') {
    throw fail('WEBRTC_UNAVAILABLE');
  }
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const dc = pc.createDataChannel('pulsedisk-door', { ordered: true });
  dc.binaryType = 'arraybuffer';

  let ws = null;
  let closed = false;
  let opened = false;
  let nextId = 0;
  let pending = null;
  let incoming = null;
  const queuedIce = [];

  function cleanupSignal() {
    if (!ws) return;
    const s = ws;
    ws = null;
    s.onopen = s.onmessage = s.onclose = s.onerror = null;
    try { s.close(1000, 'done'); } catch { /* ignore */ }
  }

  function finishPending(err, res) {
    if (!pending) return;
    const p = pending;
    pending = null;
    clearTimeout(p.timer);
    if (err) p.reject(err);
    else p.resolve(res);
  }

  function close() {
    if (closed) return;
    closed = true;
    cleanupSignal();
    finishPending(fail('CLOSED'));
    try { dc.close(); } catch { /* ignore */ }
    try { pc.close(); } catch { /* ignore */ }
  }

  dc.onmessage = (ev) => {
    if (typeof ev.data === 'string') {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.kind !== 'res' || !Number.isInteger(msg.id) || !Number.isInteger(msg.status) ||
            !Number.isInteger(msg.size) || msg.size < 0 || msg.size > MAX_BODY_BYTES) {
          close();
          return;
        }
        if (!pending || pending.id !== msg.id) return;
        if (msg.size === 0) {
          incoming = null;
          finishPending(null, { status: msg.status, bytes: new Uint8Array(0) });
        } else {
          incoming = { id: msg.id, status: msg.status, size: msg.size, chunks: [], got: 0 };
        }
      } catch {
        close();
      }
      return;
    }
    if (ev.data instanceof ArrayBuffer && incoming) {
      const part = new Uint8Array(ev.data);
      incoming.chunks.push(part);
      incoming.got += part.byteLength;
      if (incoming.got > incoming.size) {
        incoming = null;
        close();
        return;
      }
      if (incoming.got === incoming.size) {
        const full = new Uint8Array(incoming.size);
        let off = 0;
        for (const c of incoming.chunks) { full.set(c, off); off += c.byteLength; }
        const status = incoming.status;
        const id = incoming.id;
        incoming = null;
        if (pending && pending.id === id) finishPending(null, { status, bytes: full });
      }
    }
  };

  dc.onclose = () => finishPending(fail('CLOSED'));
  dc.onerror = () => finishPending(fail('CLOSED'));

  function waitReady() {
    return new Promise((resolve, reject) => {
      if (closed) return reject(fail('WEBRTC_UNAVAILABLE'));
      let settled = false;
      const done = (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (err) { close(); reject(err); }
        else { opened = true; cleanupSignal(); resolve(); }
      };
      const timer = setTimeout(() => done(fail('WEBRTC_UNAVAILABLE')), connectTimeoutMs);

      const sendSignal = (msg) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          try { ws.send(JSON.stringify(msg)); } catch { /* handled by close */ }
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && e.candidate.candidate && !opened && isLocalCandidate(e.candidate.candidate)) sendSignal({ type: 'ice', candidate: e.candidate.toJSON() });
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          if (!opened) done(fail('WEBRTC_UNAVAILABLE'));
          else finishPending(fail('CLOSED'));
        }
      };
      dc.onopen = () => done(null);

      try {
        ws = new WebSocket(wsUrlOf(signalUrl, room));
      } catch {
        return done(fail('WEBRTC_UNAVAILABLE'));
      }

      ws.onmessage = async (ev) => {
        if (typeof ev.data !== 'string' || settled) return;
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (msg.type === 'ready') {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal({ type: 'offer', sdp: { type: 'offer', sdp: localOnlySdp(pc.localDescription.sdp) } });
          } catch {
            done(fail('WEBRTC_UNAVAILABLE'));
          }
        } else if (msg.type === 'answer' && msg.sdp) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: localOnlySdp(msg.sdp.sdp) }));
            for (const cand of queuedIce.splice(0)) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
          } catch {
            done(fail('WEBRTC_UNAVAILABLE'));
          }
        } else if (msg.type === 'ice' && msg.candidate) {
          if (!isLocalCandidate(msg.candidate.candidate || '')) return;
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => {});
          } else {
            queuedIce.push(msg.candidate);
          }
        }
      };
      ws.onerror = () => { if (!opened) done(fail('WEBRTC_UNAVAILABLE')); };
      ws.onclose = () => { if (!opened) done(fail('WEBRTC_UNAVAILABLE')); };
    });
  }

  async function send(path, bytes, guest) {
    if (closed || dc.readyState !== 'open' || pending) throw fail('RELAY_UNAVAILABLE');
    const id = ++nextId;
    const payload = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || 0);
    const waitResponse = new Promise((resolve, reject) => {
      const timer = setTimeout(() => finishPending(fail('RELAY_UNAVAILABLE')), rpcTimeoutMs);
      pending = { id, resolve, reject, timer };
    });
    try {
      dc.send(JSON.stringify({ kind: 'req', id, path, guest: guest || undefined, ua: navigator.userAgent, size: payload.byteLength }));
      for (let off = 0; off < payload.byteLength; off += SLICE_BYTES) {
        if (dc.readyState !== 'open') throw fail('CLOSED');
        if (dc.bufferedAmount > 2 * 1024 * 1024) {
          await new Promise((resolve) => {
            dc.bufferedAmountLowThreshold = 512 * 1024;
            const ok = () => { dc.removeEventListener('bufferedamountlow', ok); dc.removeEventListener('close', ok); resolve(); };
            dc.addEventListener('bufferedamountlow', ok);
            dc.addEventListener('close', ok);
          });
        }
        if (dc.readyState !== 'open') throw fail('CLOSED');
        dc.send(payload.subarray(off, Math.min(payload.byteLength, off + SLICE_BYTES)));
      }
    } catch (err) {
      finishPending(err);
    }
    return waitResponse;
  }

  return { waitReady, send, close };
}

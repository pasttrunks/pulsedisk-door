import { pair } from './client.mjs';
import { openWebRtc } from './webrtc.mjs';

(function () {
  if (!window.isSecureContext || window.top !== window) return;
  var $ = function (id) { return document.getElementById(id); };
  var app = $('app');
  var door = null;
  var relay = null;
  var busy = false;
  var rtcRoom = null;
  var bridge = $('relay-bridge');
  function enableConnect() {
    if (rtcRoom || typeof bridge.contentWindow?.openPulseDiskRelay === 'function') $('knock-btn').disabled = false;
  }
  bridge.addEventListener('load', enableConnect, { once: true });
  // Pre-fill the address words (and optional WebRTC room id) when opened from the PC doorway's QR code.
  if (location.hash && location.hash.length > 1) {
    try {
      var hashParams = new URLSearchParams(location.hash.slice(1));
      var pre = (hashParams.get('code') || '').trim();
      var room = (hashParams.get('r') || '').trim();
      var inp = $('code');
      if (pre && inp) inp.value = pre;
      if (/^[A-Za-z0-9_-]{12,32}$/.test(room)) rtcRoom = room;
      history.replaceState(null, '', location.pathname + location.search);
    } catch (_) { /* ignore malformed hash */ }
  }
  enableConnect();
  var watching = false;

  // ---- Words ----
  function bytes(n) {
    if (!isFinite(n) || n < 0) return '';
    var u = ['bytes', 'KB', 'MB', 'GB', 'TB'], i = 0;
    while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
    return (i === 0 ? n : n < 10 ? n.toFixed(1) : Math.round(n)) + ' ' + u[i];
  }
  var plural = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
  var END_WORDS = {
    DENIED: ['The PC said no', 'Ask the person at the PC to try again.'],
    CLOSED: ['The door is closed', 'Open a new doorway on the PC, then enter its words.'],
    TOO_MANY_GUESTS: ['The door is full', 'Close the page on another browser, then try again.'],
    GONE: ['The door is closed', 'Open a new doorway on the PC, then enter its words.'],
    MISMATCH: ['The shapes differ', 'Choose Deny on the PC and close the doorway.'],
  };

  // ---- Screens ----
  function show(name) {
    app.setAttribute('data-screen', name);
    ['code', 'shapes', 'inside', 'end'].forEach(function (s) { $('screen-' + s).hidden = s !== name; });
    var h = document.querySelector('#screen-' + name + ' h1');
    if (h && name !== 'code') { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  function end(code) {
    var words = Object.prototype.hasOwnProperty.call(END_WORDS, code) ? END_WORDS[code] : END_WORDS.CLOSED;
    $('end-title').textContent = words[0];
    $('end-line').textContent = words[1];
    door = null;
    relay?.close();
    relay = null;
    show('end');
  }

  // ---- The shapes, drawn like the app draws them ----
  var COLORS = {
    blue: ['#9cc4ff', '#4b8dff', '#1d4fd8'], green: ['#93f5b8', '#2fd26f', '#11873f'], orange: ['#ffc58a', '#ff8a2a', '#d8530b'],
    pink: ['#ffb3d6', '#ff5fa8', '#c81e72'], violet: ['#d3bdff', '#9466ff', '#5b26d4'], teal: ['#98f3ea', '#22cbbd', '#0b7f78'],
    yellow: ['#fff0a0', '#ffd23a', '#d99a06'], red: ['#ffaaa6', '#ff5249', '#c41f19'],
  };
  function star() {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var r = i % 2 ? 20 : 44, a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push((50 + r * Math.cos(a)).toFixed(1) + ' ' + (53 + r * Math.sin(a)).toFixed(1));
    }
    return 'M' + pts.join(' L') + ' Z';
  }
  var PATHS = {
    square: 'M30 13 H70 Q87 13 87 30 V70 Q87 87 70 87 H30 Q13 87 13 70 V30 Q13 13 30 13 Z',
    triangle: 'M50 11 C54 11 56.5 13 59 17 L91 74 C94.5 81 90.5 88 82.5 88 H17.5 C9.5 88 5.5 81 9 74 L41 17 C43.5 13 46 11 50 11 Z',
    star: star(),
    leaf: 'M16 84 C14 44 42 14 88 12 C88 58 62 86 16 84 Z',
    drop: 'M50 7 C56 16 82 42 82 63 A32 32 0 0 1 18 63 C18 42 44 16 50 7 Z',
    bolt: 'M57 5 L18 57 H45 L37 95 L82 40 H55 L63 5 Z',
    moon: 'M60 9 A42 42 0 1 0 91 62 A33 33 0 0 1 60 9 Z',
  };
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function shapeSvg(s, uid) {
    var c = COLORS[s.color] || COLORS.blue;
    var svg = el('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true', focusable: 'false' });
    svg.style.filter = 'drop-shadow(0 14px 22px ' + c[1] + '88)';
    var defs = el('defs', {}, svg);
    var g = el('linearGradient', { id: 'g' + uid, x1: '.15', y1: '0', x2: '.85', y2: '1' }, defs);
    el('stop', { offset: '0', 'stop-color': c[0] }, g); el('stop', { offset: '.48', 'stop-color': c[1] }, g); el('stop', { offset: '1', 'stop-color': c[2] }, g);
    var h = el('radialGradient', { id: 'h' + uid, cx: '.3', cy: '.22', r: '.55' }, defs);
    el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '.75' }, h); el('stop', { offset: '.55', 'stop-color': '#fff', 'stop-opacity': '.08' }, h); el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }, h);
    var body = function (parent) {
      return s.shape === 'circle' ? el('circle', { cx: '50', cy: '50', r: '40' }, parent) : el('path', { d: PATHS[s.shape] || PATHS.square, 'stroke-linejoin': 'round' }, parent);
    };
    var clip = el('clipPath', { id: 'c' + uid }, defs);
    body(clip);
    var fill = el('g', { fill: 'url(#g' + uid + ')', stroke: 'url(#g' + uid + ')', 'stroke-width': s.shape === 'star' || s.shape === 'bolt' ? '5' : '0' }, svg);
    body(fill);
    var shine = el('g', { 'clip-path': 'url(#c' + uid + ')' }, svg);
    el('rect', { x: '0', y: '0', width: '100', height: '100', fill: 'url(#h' + uid + ')' }, shine);
    if (s.shape === 'leaf') el('path', { d: 'M22 78 C40 58 58 40 80 20', fill: 'none', stroke: '#fff', 'stroke-opacity': '.45', 'stroke-width': '2.5', 'stroke-linecap': 'round' }, shine);
    return svg;
  }
  function drawShapes(list) {
    var box = $('shapes');
    box.textContent = '';
    list.forEach(function (s, i) {
      var fig = document.createElement('figure');
      fig.className = 'shape';
      fig.setAttribute('role', 'listitem');
      fig.appendChild(shapeSvg(s, 's' + i));
      var cap = document.createElement('figcaption');
      cap.textContent = s.color.charAt(0).toUpperCase() + s.color.slice(1) + ' ' + s.shape;
      fig.appendChild(cap);
      box.appendChild(fig);
    });
  }

  // Connect via single-tab WebRTC when a room id is present, with automatic fallback to the 2-tab relay.
  async function connectDoor(allowPopupFallback) {
    if (busy || $('knock-btn').disabled) return;
    busy = true;
    $('knock-btn').disabled = true;
    $('code-error').textContent = '';
    try {
      var connected = false;
      if (rtcRoom) {
        try {
          relay = openWebRtc(rtcRoom);
          await relay.waitReady();
          connected = true;
        } catch (_) {
          relay?.close();
          relay = null;
          rtcRoom = null; // next Connect tap uses the 2-tab relay synchronously on the click gesture
        }
      }
      if (!connected) {
        if (!allowPopupFallback) {
          $('code-error').textContent = 'Direct connect was unavailable. Tap Connect to use the fallback tab.';
          return;
        }
        relay = bridge.contentWindow.openPulseDiskRelay($('code').value);
        await relay.waitReady();
      }
      door = await pair(relay.send);
      $('shape-no').disabled = $('shape-yes').disabled = false;
      $('pair-actions').hidden = false;
      $('shape-wait').hidden = true;
      drawShapes(door.shapes);
      show('shapes');
      const confirmation = new Promise(function (resolve, reject) {
        $('shape-yes').onclick = function () {
          $('shape-no').disabled = $('shape-yes').disabled = true;
          // The phone has said yes; the PC still has to. Say so, so nobody waits wondering.
          $('pair-actions').hidden = true;
          $('shape-wait').hidden = false;
          resolve();
        };
        $('shape-no').onclick = function () {
          reject(Object.assign(new Error('Shapes differ'), { code: 'MISMATCH' }));
        };
      });
      await Promise.all([confirmation, door.waitAllowed()]);
      enter();
    } catch (err) {
      if (door || Object.prototype.hasOwnProperty.call(END_WORDS, err.code)) {
        end(err.code);
        return;
      }
      relay?.close();
      relay = null;
      if (err.code === 'BAD_WORDS') $('code-error').textContent = err.message;
      else if (err.code === 'POPUP_BLOCKED') $('code-error').textContent = 'Allow pop-ups for this site and try again.';
      else if (err.code === 'SLOW_DOWN' || err.code === 'BUSY') {
        const seconds = Math.max(1, Math.min(900, Number(err.retryAfter) || 60));
        $('code-error').textContent = 'Too many tries. Try again in ' + Math.ceil(seconds) + ' seconds.';
      } else if (err.code === 'BAD_SEAL' || err.code === 'PAIRING_FAILED') {
        $('code-error').textContent = 'Pairing could not be verified. Close the doorway on your PC.';
      } else {
        $('code-error').textContent = 'The PC didn’t answer. Check the words and try again.';
      }
    } finally {
      $('shape-yes').onclick = $('shape-no').onclick = null;
      busy = false;
      $('knock-btn').disabled = false;
    }
  }

  $('knock').addEventListener('submit', function (event) {
    event.preventDefault();
    void connectDoor(true);
  });

  // QR scan with a WebRTC room id connects automatically in the same tab (no popup gesture required).
  if (rtcRoom) {
    void connectDoor(false);
  }

  $('again').addEventListener('click', function () { $('code').value = ''; $('code-error').textContent = ''; show('code'); $('code').focus(); });

  // ---- 3. Inside: the well and the offer ----
  var pour = { total: 0, done: 0, files: 0, filesDone: 0, controller: null, queue: [] };
  function level() {
    var f = pour.total ? Math.min(1, pour.done / pour.total) : 0;
    var lvl = pour.queue.length || pour.controller ? 200 - 205 * f : 210;
    $('liquid').style.setProperty('--level', lvl + 'px');
    $('well').classList.toggle('pouring', !!pour.controller);
    // Once the liquid rises past the words, they turn dark so they stay readable.
    $('well').classList.toggle('high', lvl < 112);
  }
  var DOC = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';
  function fileRow(name, size, list) {
    var li = document.createElement('li');
    li.className = 'file';
    li.innerHTML = '<span class="file-icon" aria-hidden="true">' + DOC + '</span><span class="file-text"><span class="file-name"></span><span class="file-meta"></span><span class="bar"><i></i></span></span><span class="file-state"></span>';
    li.querySelector('.file-name').textContent = name;
    li.querySelector('.file-meta').textContent = bytes(size);
    list.insertBefore(li, list.firstChild);
    return li;
  }
  function setRow(li, p, state, cls) {
    li.querySelector('.bar i').style.setProperty('--p', String(p));
    li.querySelector('.bar').hidden = cls === 'done' || cls === 'failed' || p === null;
    li.querySelector('.file-state').textContent = state;
    if (cls) li.className = 'file ' + cls;
  }
  function wellWords() {
    if (pour.controller) {
      $('well-title').textContent = 'Sending ' + Math.min(pour.files, pour.filesDone + 1) + ' of ' + pour.files;
      $('well-line').textContent = bytes(pour.done) + ' of ' + bytes(pour.total);
    } else {
      $('well-title').textContent = pour.filesDone ? plural(pour.filesDone, 'file') + ' sent' : 'Drop files here';
      $('well-line').innerHTML = pour.filesDone ? 'Drop more, or <u>choose files</u>' : 'or <u>choose files</u>';
    }
    $('stop').hidden = !pour.controller;
  }
  function send(files) {
    files = Array.prototype.slice.call(files || []).filter(function (f) { return f && typeof f.size === 'number'; });
    if (!files.length || !door) return;
    files.forEach(function (f) { pour.queue.push({ file: f, row: fileRow(f.name || 'File', f.size, $('sent')) }); pour.total += f.size; pour.files++; });
    pour.queue.forEach(function (q) { if (!q.started) setRow(q.row, 0, 'Waiting'); });
    level(); wellWords();
    if (!pour.controller) next();
  }
  function next() {
    var item = pour.queue.shift();
    if (!item || !door) { pour.controller = null; pour.total = pour.done = 0; pour.files = 0; level(); wellWords(); return; }
    item.started = true;
    var ctl = pour.controller = (typeof AbortController === 'function' ? new AbortController() : { signal: null, abort: function () {} });
    var base = pour.done;
    wellWords();
    door.upload(item.file, {
      signal: ctl.signal,
      onProgress: function (n) { pour.done = base + n; setRow(item.row, item.file.size ? n / item.file.size : 1, Math.round((item.file.size ? n / item.file.size : 1) * 100) + '%'); level(); wellWords(); },
    }).then(function (landed) {
      pour.done = base + item.file.size; pour.filesDone++;
      setRow(item.row, 1, 'Sent', 'done');
      if (landed && landed !== item.file.name) item.row.querySelector('.file-meta').textContent = bytes(item.file.size) + ' · saved as ' + landed;
    }).catch(function (err) {
      var code = err && err.code;
      setRow(item.row, null, code === 'CANCELLED' ? 'Stopped' : code === 'NO_SPACE' ? 'PC is full' : 'Didn’t arrive', 'failed');
      if (code === 'CLOSED' || code === 'NOT_ALLOWED' || code === 'HTTP_404') { pour.queue = []; end('CLOSED'); }
      if (code === 'CANCELLED') {
        pour.queue.forEach(function (q) { setRow(q.row, null, 'Stopped', 'failed'); });
        pour.queue = [];
      }
    }).then(function () { pour.controller = null; next(); });
  }
  $('pick').addEventListener('change', function (e) { send(e.target.files); e.target.value = ''; });
  $('stop').addEventListener('click', function () { if (pour.controller) pour.controller.abort(); });
  var well = $('well');
  var depth = 0;
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) {
    e.preventDefault();
    depth = 0; well.classList.remove('over');
    if (app.getAttribute('data-screen') === 'inside') send(e.dataTransfer && e.dataTransfer.files);
  });
  well.addEventListener('dragenter', function () { depth++; well.classList.add('over'); });
  well.addEventListener('dragleave', function () { if (--depth <= 0) { depth = 0; well.classList.remove('over'); } });

  function download(f, li) {
    var btn = li.querySelector('button');
    btn.disabled = true;
    setRow(li, 0, '');
    door.download(f.i, { onProgress: function (n) { setRow(li, f.size ? n / f.size : 1, ''); } }).then(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = f.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 20000);
      setRow(li, 1, 'Saved', 'done');
      btn.remove();
    }).catch(function (err) {
      setRow(li, null, err && err.code === 'CHANGED' ? 'Changed on the PC' : 'Didn’t download', 'failed');
      btn.disabled = false;
    });
  }
  var offered = {};
  function refreshOffer() {
    if (!door) return Promise.resolve();
    return door.offer().then(function (files) {
      $('offer-wrap').hidden = !files.length;
      files.forEach(function (f) {
        if (offered[f.i]) return;
        var li = fileRow(f.name, f.size, $('offer'));
        $('offer').appendChild(li);
        setRow(li, null, '');
        var b = document.createElement('button');
        b.className = 'btn btn-quiet btn-small';
        b.type = 'button';
        b.textContent = 'Download';
        b.addEventListener('click', function () { download(f, li); });
        li.querySelector('.file-state').replaceWith(b);
        var st = document.createElement('span'); st.className = 'file-state';
        li.appendChild(st);
        offered[f.i] = li;
      });
    }).catch(function (err) { if (err && (err.code === 'CLOSED' || err.code === 'NOT_ALLOWED' || err.code === 'HTTP_404')) end('CLOSED'); });
  }
  function watch() {
    if (watching) return;
    watching = true;
    var misses = 0;
    (function loop() {
      if (!door) { watching = false; return; }
      door.state(0).then(function (s) {
        misses = 0;
        if (s.state === 'allowed') { refreshOffer(); setTimeout(loop, 4000); }
        else { watching = false; if (!pour.controller) end(s.state === 'denied' ? 'DENIED' : 'CLOSED'); }
      }).catch(function () {
        // The door stops answering once the PC closes it.
        if (++misses >= 2 && !pour.controller) { watching = false; end('CLOSED'); } else setTimeout(loop, 3000);
      });
    })();
  }
  function enter() {
    show('inside');
    wellWords(); level();
    refreshOffer();
    watch();
  }
  window.addEventListener('pagehide', function () { if (door) void door.leave().catch(function () {}); });

  $('code').focus();
})();

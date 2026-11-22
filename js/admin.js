(function () {
  const { CATEGORIES, DRINKS, byId } = window.MENU;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'admin:' + CONFIG.topic;

  // Berichten lokaal bewaren zodat bestellingen ook na de 12u-limiet van ntfy zichtbaar blijven.
  let messages = {};
  try { messages = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(messages)); } catch (e) {} };

  let view = 'open';
  let soundOn = false;
  let firstLoad = true;
  const seenOrders = new Set();
  const freshIds = new Set();

  function buildState() {
    const orders = {};
    const statuses = {};
    Object.values(messages)
      .sort((a, b) => a._time - b._time || (a.ts || 0) - (b.ts || 0))
      .forEach((m) => {
        if (m.t === 'order') orders[m.id] = { ...m, status: 'open' };
        if (m.t === 'status') statuses[m.id] = m.s;
      });
    Object.entries(statuses).forEach(([id, s]) => {
      if (orders[id]) orders[id].status = s === 'done' || s === 'cancelled' ? s : 'open';
    });
    return Object.values(orders);
  }

  function ago(ts) {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return 'net nu';
    if (m < 60) return m + ' min geleden';
    return new Date(ts).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  }

  function orderHtml(o) {
    const id = esc(o.id);
    const cancelBtn = `<button class="cancel-btn" data-cancel="${id}" aria-label="Annuleren">✕ Annuleren</button>`;
    const btns = o.status === 'cancelled'
      ? `<button class="undo-btn" data-undo="${id}">↩︎ Herstellen</button>`
      : o.status === 'done'
        ? `<button class="undo-btn" data-undo="${id}">↩︎ Terug naar open</button>${cancelBtn}`
        : `<button class="done-btn" data-done="${id}">✓ Klaar</button>${cancelBtn}`;
    return `<article class="order ${o.status} ${freshIds.has(o.id) ? 'new' : ''}">
      <header><div><span class="oc">#${esc(o.id)}</span> <span class="who">${esc(o.name)}</span></div><span class="when">${ago(o.ts || o._time * 1000)}</span></header>
      <ul>${(o.items || []).map((i) => {
        const d = byId[i.id];
        return `<li><b>${Number(i.qty) || 0}</b>${d ? `<img src="${d.src}" alt="">` : ''}<span>${esc(i.name)}</span></li>`;
      }).join('')}</ul>
      ${o.note ? `<div class="note">💬 ${esc(o.note)}</div>` : ''}
      ${o.status === 'cancelled' ? `<div class="cancelled-tag">❌ Geannuleerd</div>` : ''}
      <div class="btns">${btns}</div>
    </article>`;
  }

  function render() {
    const orders = buildState();
    const open = orders.filter((o) => o.status === 'open').sort((a, b) => a.ts - b.ts); // oudste eerst
    const done = orders.filter((o) => o.status === 'done').sort((a, b) => b.ts - a.ts);
    const cancelled = orders.filter((o) => o.status === 'cancelled').sort((a, b) => b.ts - a.ts);
    $('#nOpen').textContent = open.length;
    $('#nDone').textContent = done.length ? `(${done.length})` : '';
    document.title = (open.length ? `(${open.length}) ` : '') + 'Bar Admin';

    let html = '';
    if (view === 'open') {
      html = open.length ? open.map(orderHtml).join('') : `<p class="empty">Geen open bestellingen 🎉<br>Nieuwe bestellingen verschijnen hier vanzelf.</p>`;
    } else if (view === 'done') {
      html = done.length ? done.map(orderHtml).join('') : `<p class="empty">Nog niets afgewerkt.</p>`;
      if (cancelled.length) html += `<h3 class="section-h">❌ Geannuleerd (${cancelled.length})</h3>` + cancelled.map(orderHtml).join('');
    } else {
      html = totalsHtml(orders.filter((o) => o.status !== 'cancelled'));
    }
    html += helpHtml();
    $('#list').innerHTML = html;
    freshIds.clear();
  }

  function totalsHtml(orders) {
    const tot = {};
    orders.forEach((o) => (o.items || []).forEach((i) => { tot[i.id] = (tot[i.id] || 0) + (Number(i.qty) || 0); }));
    const sum = Object.values(tot).reduce((a, b) => a + b, 0);
    if (!sum) return `<p class="empty">Nog geen bestellingen.</p>`;
    let html = `<p style="font-weight:800">${orders.length} bestellingen · ${sum} drankjes</p><div class="totals">`;
    CATEGORIES.forEach((c) => {
      const rows = DRINKS.filter((d) => d.cat === c.id && tot[d.id]).sort((a, b) => tot[b.id] - tot[a.id]);
      if (!rows.length) return;
      html += `<h3>${c.emoji} ${esc(c.name)}</h3>` + rows.map((d) => `<div class="t"><img src="${d.src}" alt=""><span>${esc(d.name)}</span><b>${tot[d.id]}</b></div>`).join('');
    });
    return html + '</div>';
  }

  function helpHtml() {
    const topicUrl = CONFIG.ntfyServer.replace(/\/$/, '') + '/' + CONFIG.topic;
    return `<div class="help">🔔 <b>Meldingen op je telefoon?</b> Installeer de gratis app <a href="https://ntfy.sh" target="_blank" rel="noopener">ntfy</a> en abonneer je op <code>${esc(CONFIG.topic)}</code>, of open <a href="${topicUrl}" target="_blank" rel="noopener">${esc(topicUrl)}</a>.</div>`;
  }

  // ---------- Acties ----------
  async function setStatus(id, s, btn) {
    btn.disabled = true;
    const o = buildState().find((x) => x.id === id);
    const label = { done: ['✅', 'klaar'], cancelled: ['❌', 'geannuleerd'], open: ['↩️', 'terug open'] }[s];
    try {
      const res = await Ntfy.publish({
        title: `${label[0]} #${id} ${label[1]}`,
        message: o ? `Bestelling van ${o.name}` : `Bestelling #${id}`,
        tags: ['status'],
        priority: 1,
        data: { t: 'status', id, s },
      });
      // Meteen lokaal toepassen; de echo via de live-verbinding wordt ontdubbeld.
      messages[res.id] = { t: 'status', id, s, _msgId: res.id, _time: res.time };
      save();
      render();
    } catch (e) {
      btn.disabled = false;
      alert('Status bijwerken mislukt. Controleer de internetverbinding.');
    }
  }

  $('#list').addEventListener('click', (e) => {
    const d = e.target.closest('[data-done]');
    const u = e.target.closest('[data-undo]');
    if (d) setStatus(d.dataset.done, 'done', d);
    if (u) setStatus(u.dataset.undo, 'open', u);
    const c = e.target.closest('[data-cancel]');
    if (c) {
      const o = buildState().find((x) => x.id === c.dataset.cancel);
      if (confirm(`Bestelling #${c.dataset.cancel}${o ? ' van ' + o.name : ''} annuleren?`)) setStatus(c.dataset.cancel, 'cancelled', c);
    }
  });

  $('#tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (!t) return;
    view = t.dataset.view;
    document.querySelectorAll('#tabs .tab').forEach((x) => x.classList.toggle('active', x === t));
    render();
  });

  // ---------- Geluid ----------
  let audioCtx;
  $('#soundBtn').addEventListener('click', () => {
    soundOn = !soundOn;
    $('#soundBtn').textContent = soundOn ? '🔔 Geluid aan' : '🔕 Geluid uit';
    $('#soundBtn').classList.toggle('on', soundOn);
    if (soundOn) { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); ding(); }
  });
  function ding() {
    if (!soundOn || !audioCtx) return;
    [880, 1320].forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.frequency.value = f;
      o.type = 'sine';
      const t = audioCtx.currentTime + i * 0.16;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
  }

  // ---------- Live ----------
  Object.values(messages).forEach((m) => { if (m.t === 'order') seenOrders.add(m.id); });
  let renderTimer;
  const scheduleRender = () => { clearTimeout(renderTimer); renderTimer = setTimeout(render, 120); };

  Ntfy.subscribe((d) => {
    if (messages[d._msgId]) return;
    messages[d._msgId] = d;
    save();
    if (d.t === 'order' && !seenOrders.has(d.id)) {
      seenOrders.add(d.id);
      if (!firstLoad) {
        freshIds.add(d.id);
        ding();
        if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      }
    }
    scheduleRender();
  }, (state) => {
    const el = $('#conn');
    el.className = 'conn ' + state;
    el.querySelector('span').textContent = state === 'open' ? 'Live' : state === 'reconnecting' ? 'Opnieuw verbinden…' : 'Offline';
    if (state === 'open') setTimeout(() => { firstLoad = false; }, 1500);
  });

  render();
  setInterval(render, 30000); // "x min geleden" bijwerken
})();

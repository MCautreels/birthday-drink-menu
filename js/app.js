(function () {
  const { CATEGORIES, DRINKS, byId } = window.MENU;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };

  let cart = store.get('cart', {}); // { drinkId: qty }
  let myOrders = store.get('myOrders', []); // [{id, items, name, time, status}]

  // ---------- Confetti ----------
  const colors = ['#ff5a7a', '#7c5cff', '#ffc93c', '#2cc5a0', '#4cc9f0'];
  const conf = $('#confetti');
  for (let i = 0; i < 26; i++) {
    const el = document.createElement('i');
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    el.style.background = colors[i % colors.length];
    el.style.transform = `rotate(${Math.random() * 180}deg)`;
    conf.appendChild(el);
  }

  // ---------- Menu ----------
  function renderMenu() {
    $('#tabs').innerHTML = CATEGORIES.map(
      (c, i) => `<button class="tab${i === 0 ? ' active' : ''}" data-cat="${c.id}">${c.emoji} ${esc(c.name)}</button>`
    ).join('');

    $('#menu').innerHTML = CATEGORIES.map((c) => {
      const items = DRINKS.filter((d) => d.cat === c.id);
      return `<section class="cat" id="cat-${c.id}">
        <h2>${c.emoji} ${esc(c.name)}</h2>
        ${c.note ? `<p class="note">${esc(c.note)}</p>` : ''}
        <div class="grid">${items.map(cardHtml).join('')}</div>
      </section>`;
    }).join('');
  }

  function cardHtml(d) {
    const free = d.badge === '0,0%' || d.badge === '0,3%';
    return `<article class="drink" data-id="${d.id}">
      ${d.badge ? `<span class="badge${free ? ' free' : ''}">${esc(d.badge)}</span>` : ''}
      <div class="photo"><img src="${d.src}" alt="${esc(d.name)}" loading="lazy"></div>
      <div class="info"><h3>${esc(d.name)}</h3><p class="sub">${esc(d.sub || '')}</p></div>
      <div class="actions"></div>
    </article>`;
  }

  function stepperHtml(id, qty) {
    return `<div class="stepper"><button data-dec="${id}" aria-label="Minder">−</button><span>${qty}</span><button data-inc="${id}" aria-label="Meer">+</button></div>`;
  }

  function renderCardActions() {
    document.querySelectorAll('.drink').forEach((el) => {
      const id = el.dataset.id;
      const qty = cart[id] || 0;
      el.classList.toggle('in-cart', qty > 0);
      el.querySelector('.actions').innerHTML = qty > 0 ? stepperHtml(id, qty) : `<button class="add-btn" data-inc="${id}">+ Toevoegen</button>`;
    });
  }

  function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }

  function updateCart() {
    Object.keys(cart).forEach((k) => { if (!cart[k] || !byId[k]) delete cart[k]; });
    store.set('cart', cart);
    renderCardActions();
    const n = cartCount();
    $('#cartCount').textContent = n;
    $('#cartBar').classList.toggle('show', n > 0 && !sheetOpen);
    if (sheetMode === 'cart') renderCartSheet();
  }

  function change(id, delta) {
    cart[id] = Math.max(0, (cart[id] || 0) + delta);
    if (navigator.vibrate) navigator.vibrate(10);
    updateCart();
  }

  document.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) change(inc.dataset.inc, 1);
    if (dec) change(dec.dataset.dec, -1);
  });

  // ---------- Tabs + scroll spy ----------
  $('#tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (!t) return;
    document.getElementById('cat-' + t.dataset.cat).scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveTab(t.dataset.cat);
    lockSpy = Date.now() + 700;
  });
  let lockSpy = 0;
  function setActiveTab(cat) {
    document.querySelectorAll('.tab').forEach((t) => {
      const on = t.dataset.cat === cat;
      t.classList.toggle('active', on);
      if (on) t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    });
  }
  let currentCat = CATEGORIES[0].id;
  function spy() {
    if (Date.now() < lockSpy) return;
    let cur = CATEGORIES[0].id;
    for (const c of CATEGORIES) {
      const el = document.getElementById('cat-' + c.id);
      if (el.getBoundingClientRect().top < 120) cur = c.id;
    }
    if (innerHeight + scrollY >= document.body.scrollHeight - 4) cur = CATEGORIES[CATEGORIES.length - 1].id;
    if (cur !== currentCat) { currentCat = cur; setActiveTab(cur); }
  }
  addEventListener('scroll', spy, { passive: true });

  // ---------- Sheet ----------
  let sheetOpen = false;
  let sheetMode = null;
  function openSheet(mode) {
    sheetMode = mode;
    sheetOpen = true;
    if (mode === 'cart') renderCartSheet();
    if (mode === 'mine') renderMineSheet();
    $('#overlay').classList.add('show');
    $('#sheet').classList.add('show');
    $('#cartBar').classList.remove('show');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    sheetOpen = false;
    sheetMode = null;
    $('#overlay').classList.remove('show');
    $('#sheet').classList.remove('show');
    document.body.style.overflow = '';
    updateCart();
  }
  $('#overlay').addEventListener('click', closeSheet);
  $('#sheetClose').addEventListener('click', closeSheet);
  $('#cartBar').addEventListener('click', () => openSheet('cart'));
  $('#myOrdersBtn').addEventListener('click', () => openSheet('mine'));

  function renderCartSheet() {
    const lines = Object.entries(cart).filter(([, q]) => q > 0);
    if (!lines.length) {
      $('#sheetBody').innerHTML = `<h2>Mijn bestelling</h2><p class="empty">Nog niets gekozen. Tik op een drankje om het toe te voegen.</p>`;
      return;
    }
    const nameVal = $('#orderName') ? $('#orderName').value : store.get('name', '');
    const noteVal = $('#orderNote') ? $('#orderNote').value : '';
    $('#sheetBody').innerHTML = `
      <h2>Mijn bestelling</h2>
      ${lines.map(([id, q]) => {
        const d = byId[id];
        return `<div class="line"><img src="${d.src}" alt=""><div class="name">${esc(d.name)}<small>${esc(d.sub || '')}</small></div>${stepperHtml(id, q)}</div>`;
      }).join('')}
      <label class="field">Je naam<input id="orderName" autocomplete="given-name" placeholder="bv. Tante Lies" value="${esc(nameVal)}" maxlength="40"></label>
      <label class="field">Opmerking <span>(optioneel)</span><textarea id="orderNote" placeholder="bv. met ijsblokjes, ik zit in de tuin…" maxlength="200">${esc(noteVal)}</textarea></label>
      <div class="error" id="orderError" hidden></div>
      <button class="primary-btn" id="placeOrder">Bestellen (${cartCount()}) 🎉</button>`;
    $('#placeOrder').addEventListener('click', placeOrder);
  }

  function code() {
    const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 3; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }

  async function placeOrder() {
    const name = $('#orderName').value.trim();
    const note = $('#orderNote').value.trim();
    const err = $('#orderError');
    if (!name) {
      err.textContent = 'Vul je naam in, dan weten we voor wie het is.';
      err.hidden = false;
      $('#orderName').focus();
      return;
    }
    store.set('name', name);
    const items = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, name: byId[id].name, qty }));
    const order = { t: 'order', id: code(), name, note, items, ts: Date.now() };
    const btn = $('#placeOrder');
    btn.disabled = true;
    btn.textContent = 'Versturen…';
    err.hidden = true;
    try {
      await Ntfy.publish({
        title: `🍹 #${order.id} · ${name}`,
        message: items.map((i) => `${i.qty}× ${i.name}`).join('\n') + (note ? `\n💬 ${note}` : ''),
        tags: ['tada'],
        priority: 4,
        data: order,
      });
      myOrders.unshift({ id: order.id, name, items, ts: order.ts, status: 'open' });
      store.set('myOrders', myOrders);
      cart = {};
      updateCart();
      showConfirmation(order);
      watchStatus();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = `Bestellen (${cartCount()}) 🎉`;
      err.textContent = 'Oei, dat lukte niet. Controleer je internet en probeer opnieuw.';
      err.hidden = false;
    }
  }

  function statusHtml(o) {
    return o.status === 'done'
      ? `<span class="status ready">✅ Klaar!</span>`
      : `<span class="status">⏳ Wordt klaargemaakt</span>`;
  }

  function showConfirmation(order) {
    sheetMode = 'confirm';
    $('#sheetBody').innerHTML = `<div class="done" data-confirm="${order.id}">
      <div class="big">🥳</div>
      <h2>Bestelling doorgegeven!</h2>
      <div class="code">#${order.id}</div>
      <p>Bedankt ${esc(order.name)}! Je drankjes komen eraan.</p>
      <div id="confirmStatus">${statusHtml({ status: 'open' })}</div>
      <button class="primary-btn" id="again">Nog iets bestellen</button>
    </div>`;
    $('#again').addEventListener('click', closeSheet);
    renderMyOrdersBtn();
  }

  function renderMineSheet() {
    $('#sheetBody').innerHTML = `<h2>Mijn bestellingen</h2>` + (myOrders.length
      ? myOrders.map((o) => `<div class="mine"><header><span class="code-sm">#${o.id}</span>${statusHtml(o)}</header>
          <ul>${o.items.map((i) => `<li>${i.qty}× ${esc(i.name)}</li>`).join('')}</ul></div>`).join('')
      : `<p class="empty">Nog geen bestellingen.</p>`);
  }

  function renderMyOrdersBtn() {
    const btn = $('#myOrdersBtn');
    if (!myOrders.length) { btn.hidden = true; return; }
    const open = myOrders.filter((o) => o.status !== 'done').length;
    btn.hidden = false;
    btn.innerHTML = open
      ? `<span class="dot"></span>Mijn bestellingen (${open} bezig)`
      : `<span class="dot ready"></span>Mijn bestellingen`;
  }

  // ---------- Live status of my orders ----------
  let unsub = null;
  function watchStatus() {
    const open = myOrders.filter((o) => o.status !== 'done');
    if (!open.length || document.hidden) { if (unsub) { unsub(); unsub = null; } return; }
    if (unsub) return;
    const latest = {};
    unsub = Ntfy.subscribe((d) => {
      if (d.t !== 'status') return;
      const o = myOrders.find((x) => x.id === d.id);
      if (!o) return;
      if (latest[d.id] && latest[d.id] > d._time) return;
      latest[d.id] = d._time;
      const before = o.status;
      o.status = d.s === 'done' ? 'done' : 'open';
      store.set('myOrders', myOrders);
      renderMyOrdersBtn();
      if (sheetMode === 'mine') renderMineSheet();
      const c = document.querySelector(`[data-confirm="${o.id}"] #confirmStatus`);
      if (c) c.innerHTML = statusHtml(o);
      if (before !== 'done' && o.status === 'done') {
        toast(`✅ Bestelling #${o.id} is klaar!`);
        if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
      }
      if (!myOrders.some((x) => x.status !== 'done') && unsub) { unsub(); unsub = null; }
    });
  }
  document.addEventListener('visibilitychange', watchStatus);

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  // Oude bestellingen (> 12u) opruimen
  myOrders = myOrders.filter((o) => Date.now() - o.ts < 12 * 3600 * 1000);
  store.set('myOrders', myOrders);

  renderMenu();
  updateCart();
  renderMyOrdersBtn();
  watchStatus();
})();

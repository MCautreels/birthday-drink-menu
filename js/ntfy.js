// Kleine wrapper rond ntfy.sh: berichten publiceren en live meeluisteren.
// De gestructureerde data (bestelling / status) zit base64-gecodeerd in de
// "click"-link van het bericht, zodat de pushmelding zelf leesbaar blijft.
(function () {
  const b64e = (s) =>
    btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = (s) => {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  };

  function adminUrl() {
    return new URL('admin.html', location.href).href.split('#')[0];
  }

  async function publish({ title, message, tags, priority, data }) {
    const body = {
      topic: CONFIG.topic,
      title,
      message,
      tags: tags || [],
      priority: priority || 3,
      click: adminUrl() + '#d=' + b64e(JSON.stringify(data)),
    };
    // Geen Content-Type header -> geen CORS preflight nodig.
    const res = await fetch(CONFIG.ntfyServer.replace(/\/$/, '') + '/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Versturen mislukt (HTTP ' + res.status + ')');
    return res.json();
  }

  function parse(msg) {
    if (!msg || msg.event !== 'message' || !msg.click) return null;
    const m = msg.click.match(/#d=([A-Za-z0-9_-]+)/);
    if (!m) return null;
    try {
      const data = JSON.parse(b64d(m[1]));
      return { ...data, _msgId: msg.id, _time: msg.time };
    } catch (e) {
      return null;
    }
  }

  // Eén blijvende verbinding (Server-Sent Events). Bij herverbinden worden alle
  // berichten opnieuw gestuurd; ontdubbelen gebeurt op _msgId.
  function subscribe(onData, onState) {
    const url = CONFIG.ntfyServer.replace(/\/$/, '') + '/' + encodeURIComponent(CONFIG.topic) + '/sse?since=all';
    const es = new EventSource(url);
    es.onopen = () => onState && onState('open');
    es.onerror = () => onState && onState(es.readyState === 2 ? 'closed' : 'reconnecting');
    es.onmessage = (ev) => {
      try {
        const d = parse(JSON.parse(ev.data));
        if (d) onData(d);
      } catch (e) {}
    };
    return () => es.close();
  }

  window.Ntfy = { publish, subscribe, parse };
})();

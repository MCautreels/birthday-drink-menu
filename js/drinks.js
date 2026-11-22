// De drankkaart. Elk drankje heeft een getekend flesje (art). Liever toch een foto?
// Zet een afbeelding in /images en vul bij het drankje "img: 'images/naam.jpg'" in.
(function () {
  // --- Getekende flesjes (SVG) ---------------------
  function art(kind, o) {
    const liquid = o.liquid || '#f4d35e';
    const label = o.label || '#ffffff';
    const ink = o.ink || '#333';
    const text = o.text || '';
    const glass = o.glass || '#2f4a3a';
    const raw = text.split('|');
    const t = raw.map((x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
    // Lettergrootte verkleinen zodat lange namen binnen het etiket passen.
    const fit = (i, fs, max, k) => Math.min(fs, max / (Math.max(1, (raw[i] || '').length) * (k || 0.62))).toFixed(1);
    let body = '';
    if (kind === 'wine' || kind === 'sparkling') {
      body = `
        <path d="M52 8h16v34c0 8 18 16 18 34v108a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V76c0-18 18-26 18-34z" fill="${glass}"/>
        <path d="M38 120h44v62a4 4 0 0 1-4 4H42a4 4 0 0 1-4-4z" fill="${liquid}" opacity=".9"/>
        ${kind === 'sparkling'
          ? `<path d="M50 4h20v46H50z" fill="${o.foil || '#d4af37'}"/><path d="M50 44h20l6 10H44z" fill="${o.foil || '#d4af37'}" opacity=".85"/>`
          : `<rect x="51" y="4" width="18" height="20" rx="2" fill="${o.foil || '#7a1f2b'}"/>`}
        <rect x="36" y="92" width="48" height="58" rx="4" fill="${label}"/>
        <text x="60" y="117" font-family="Georgia,serif" font-size="${fit(0, 9, 44, 0.6)}" text-anchor="middle" fill="${ink}" font-weight="700">${t[0] || ''}</text>
        <text x="60" y="131" font-family="Georgia,serif" font-size="${fit(1, 7, 44, 0.55)}" text-anchor="middle" fill="${ink}">${t[1] || ''}</text>
        <text x="60" y="142" font-family="Georgia,serif" font-size="${fit(2, 6, 44, 0.55)}" text-anchor="middle" fill="${ink}" opacity=".7">${t[2] || ''}</text>
        <path d="M44 80c0-8 6-14 10-18" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35" fill="none"/>`;
    } else if (kind === 'can') {
      body = `
        <rect x="32" y="30" width="56" height="150" rx="10" fill="${liquid}"/>
        <rect x="36" y="22" width="48" height="12" rx="4" fill="#c9ccd1"/>
        <rect x="36" y="176" width="48" height="8" rx="3" fill="#c9ccd1"/>
        <rect x="32" y="80" width="56" height="52" fill="${label}"/>
        <text x="60" y="104" font-family="Arial Black,Arial,sans-serif" font-size="${fit(0, 11, 50, 0.72)}" text-anchor="middle" fill="${ink}">${t[0] || ''}</text>
        <text x="60" y="120" font-family="Arial,sans-serif" font-size="${fit(1, 8, 50, 0.55)}" text-anchor="middle" fill="${ink}">${t[1] || ''}</text>
        <rect x="40" y="40" width="6" height="130" rx="3" fill="#fff" opacity=".3"/>`;
    } else if (kind === 'mocktail') {
      // In de stijl van een klein glazen mocktailflesje.
      body = `
        <path d="M50 14h20v22c0 6 16 10 16 26v114a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V62c0-16 16-20 16-26z" fill="#e9f1f2" stroke="#b8c7c9" stroke-width="2"/>
        <path d="M36 96h48v80a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6z" fill="${liquid}" opacity=".85"/>
        <rect x="48" y="6" width="24" height="12" rx="3" fill="${o.cap || '#222'}"/>
        <rect x="36" y="74" width="48" height="76" rx="3" fill="#fbfaf5"/>
        <text x="60" y="88" font-family="Georgia,serif" font-size="5.5" text-anchor="middle" fill="#555" letter-spacing=".5">SIR. JAMES 101</text>
        <text x="60" y="106" font-family="Georgia,serif" font-size="${o.size || 11}" text-anchor="middle" fill="${ink}" font-weight="700">${t[0] || ''}</text>
        <text x="60" y="119" font-family="Georgia,serif" font-size="${o.size || 11}" text-anchor="middle" fill="${ink}" font-weight="700">${t[1] || ''}</text>
        <text x="60" y="131" font-family="Georgia,serif" font-size="6" text-anchor="middle" fill="#555">MOCKTAIL</text>
        <text x="60" y="143" font-family="Arial,sans-serif" font-size="5.5" text-anchor="middle" fill="#2c8a5a" font-weight="700">ALCOHOL FREE</text>
        <circle cx="${o.fruitX || 76}" cy="160" r="9" fill="${o.fruit || liquid}" stroke="#fff" stroke-width="2"/>`;
    } else if (kind === 'beer') {
      // Belgisch bierflesje: "stubby" (Duvel) of "tall" (Karmeliet).
      const tall = o.shape === 'tall';
      const shape = tall
        ? 'M53 14h14v46c0 14 17 20 17 38v80a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V98c0-18 17-24 17-38z'
        : 'M52 14h16v40c0 12 18 20 18 38v86a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6V92c0-18 18-26 18-38z';
      body = `
        <path d="${shape}" fill="${glass}"/>
        <rect x="${tall ? 51 : 50}" y="8" width="${tall ? 18 : 20}" height="9" rx="2" fill="${o.cap || '#c9a227'}"/>
        <rect x="${tall ? 53 : 52}" y="30" width="${tall ? 14 : 16}" height="16" rx="2" fill="${o.neck || label}"/>
        <path d="M${tall ? 36 : 34} 112h${tall ? 48 : 52}v52H${tall ? 36 : 34}z" fill="${label}"/>
        ${o.stripe ? `<rect x="${tall ? 36 : 34}" y="112" width="${tall ? 48 : 52}" height="6" fill="${o.stripe}"/><rect x="${tall ? 36 : 34}" y="158" width="${tall ? 48 : 52}" height="6" fill="${o.stripe}"/>` : ''}
        <text x="60" y="${t[1] ? 138 : 143}" font-family="${o.font || 'Georgia,serif'}" font-size="${fit(0, o.size || 14, 46, 0.62)}" text-anchor="middle" fill="${ink}" font-weight="700" ${o.italic ? 'font-style="italic"' : ''}>${t[0] || ''}</text>
        <text x="60" y="152" font-family="Arial,sans-serif" font-size="6.5" text-anchor="middle" fill="${ink}" font-weight="700" letter-spacing=".6">${t[1] || ''}</text>
        <path d="M${tall ? 42 : 40} 100c0-8 6-14 11-18" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25" fill="none"/>`;
    } else if (kind === 'pet') {
      // Plastic fles (frisdrank / water).
      const shape = 'M50 22h20v8c0 10 18 14 18 32v20c-3 4-3 8 0 12v76c0 8-4 12-10 12H42c-6 0-10-4-10-12V94c3-4 3-8 0-12V62c0-18 18-22 18-32z';
      body = `
        <defs><clipPath id="b"><path d="${shape}"/></clipPath></defs>
        <path d="${shape}" fill="${o.empty || '#eaf4fb'}" stroke="${o.edge || '#c7dcea'}" stroke-width="1.5"/>
        <g clip-path="url(#b)"><rect x="0" y="${o.level || 58}" width="120" height="190" fill="${liquid}" opacity="${o.opacity || 1}"/></g>
        ${o.bubbles ? '<g fill="#fff" opacity=".8"><circle cx="46" cy="170" r="2"/><circle cx="72" cy="160" r="2.5"/><circle cx="56" cy="74" r="1.8"/><circle cx="66" cy="84" r="1.5"/><circle cx="48" cy="80" r="1.2"/><circle cx="70" cy="174" r="1.5"/></g>' : ''}
        <rect x="48" y="10" width="24" height="14" rx="3" fill="${o.cap || '#d62828'}"/>
        <rect x="32" y="104" width="56" height="42" fill="${label}"/>
        ${o.stripe ? `<rect x="32" y="104" width="56" height="5" fill="${o.stripe}"/><rect x="32" y="141" width="56" height="5" fill="${o.stripe}"/>` : ''}
        <text x="60" y="${t[1] ? 126 : 130}" font-family="${o.font || 'Arial Black,Arial,sans-serif'}" font-size="${fit(0, o.size || 11, 50, 0.72)}" text-anchor="middle" fill="${ink}" font-weight="900" ${o.italic ? 'font-style="italic"' : ''}>${t[0] || ''}</text>
        <text x="60" y="137" font-family="Arial,sans-serif" font-size="7" text-anchor="middle" fill="${o.ink2 || ink}" font-weight="700" letter-spacing=".5">${t[1] || ''}</text>
        <rect x="38" y="64" width="5" height="100" rx="2.5" fill="#fff" opacity=".35"/>`;
    } else if (kind === 'slimcan') {
      // Smal blikje in Italiaanse stijl.
      body = `
        <rect x="35" y="22" width="50" height="162" rx="8" fill="${liquid}"/>
        <rect x="38" y="16" width="44" height="10" rx="4" fill="#c9ccd1"/>
        <rect x="38" y="180" width="44" height="7" rx="3" fill="#c9ccd1"/>
        <rect x="35" y="40" width="50" height="34" fill="${o.band || '#1d2b5a'}"/>
        <path d="M60 46l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.5-4 6-.6z" fill="#e63946" stroke="#fff" stroke-width=".8"/>
        <text x="60" y="71" font-family="Georgia,serif" font-size="5.4" text-anchor="middle" fill="#fff" font-weight="700" textLength="44" lengthAdjust="spacingAndGlyphs">SANPELLEGRINO</text>
        <text x="60" y="94" font-family="Georgia,serif" font-size="${fit(0, 8, 46, 0.72)}" text-anchor="middle" fill="${ink}" font-weight="700">${t[0] || ''}</text>
        <text x="60" y="104" font-family="Georgia,serif" font-size="${fit(1, 8, 46, 0.72)}" text-anchor="middle" fill="${ink}" font-weight="700">${t[1] || ''}</text>
        <circle cx="54" cy="138" r="13" fill="${o.fruit || '#ff8c42'}" opacity=".95"/>
        <circle cx="68" cy="150" r="10" fill="${o.fruit2 || o.fruit || '#ffb26b'}" opacity=".95"/>
        <path d="M54 125v26M41 138h26M45 129l18 18M63 129l-18 18" stroke="#fff" stroke-width=".8" opacity=".6"/>
        <rect x="40" y="30" width="4" height="146" rx="2" fill="#fff" opacity=".3"/>`;
    }
    const svg =`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 190">${body}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  const CATEGORIES = [
    { id: 'wijn', name: 'Bubbels & wijn', emoji: '🥂' },
    { id: 'bier', name: 'Bier', emoji: '🍺' },
    { id: 'mocktails', name: 'Mocktails', emoji: '🍹', note: 'Sir. James 101: alcoholvrije cocktails' },
    { id: 'fris', name: 'Frisdrank', emoji: '🥤' },
    { id: 'water', name: 'Water', emoji: '💧' },
  ];

  const DRINKS = [
    // Bubbels & wijn
    { id: 'prosecco', cat: 'wijn', name: 'Prosecco', sub: 'Lagioiosa Millesimato', desc: 'Frisse Italiaanse bubbels',
      art: art('sparkling', { glass: '#3d5a40', liquid: '#f3e6a1', foil: '#c9a227', text: 'Lagioiosa|PROSECCO|Millesimato' }) },
    { id: 'witte-wijn', cat: 'wijn', name: 'Witte wijn', sub: "Fantini Trebbiano d'Abruzzo", desc: 'Fris en fruitig',
      art: art('wine', { glass: '#8fa86b', liquid: '#f1e7a6', foil: '#e2c044', text: 'Fantini|Trebbiano|d\'Abruzzo' }) },
    { id: 'rose', cat: 'wijn', name: 'Rosé', sub: 'Masso Antico Primitivo', desc: 'Zacht en zomers',
      art: art('wine', { glass: '#f0b8c0', liquid: '#f49cad', foil: '#d9677d', text: 'Masso Antico|Rosato|Puglia' }) },
    { id: 'rode-wijn', cat: 'wijn', name: 'Rode wijn', sub: 'Masso Antico Primitivo', desc: 'Vol en rond, uit Puglia', art: art('wine', { glass: '#2a1a1f', liquid: '#7b1e2f', foil: '#8c1c2c', label: '#f4ecdc', ink: '#5a1420', text: 'Masso Antico|Primitivo|Salento' }) },

    // Bier
    { id: 'duvel', cat: 'bier', name: 'Duvel', sub: 'Blond speciaalbier', badge: '8,5%', art: art('beer', { glass: '#4a2e14', label: '#fbf7ec', neck: '#c8102e', cap: '#c8102e', ink: '#c8102e', stripe: '#c8102e', text: 'Duvel|SPECIAALBIER', italic: true, size: 15 }) },
    { id: 'duvel-tripel-hop', cat: 'bier', name: 'Duvel Tripel Hop', sub: 'Extra gehopt', badge: '9,5%', art: art('beer', { glass: '#4a2e14', label: '#fbf7ec', neck: '#7cb342', cap: '#7cb342', ink: '#c8102e', stripe: '#7cb342', text: 'Duvel|TRIPEL HOP', italic: true, size: 15 }) },
    { id: 'tripel-karmeliet', cat: 'bier', name: 'Tripel Karmeliet', sub: 'Tripel met drie granen', badge: '8,4%', art: art('beer', { shape: 'tall', glass: '#6b4a1f', label: '#f3e5c0', neck: '#b8862b', cap: '#b8862b', ink: '#4a3410', stripe: '#b8862b', text: 'Tripel|KARMELIET', size: 13, italic: true }) },
    { id: 'zestra', cat: 'bier', name: 'Troubadour Zestra', sub: 'Bijna alcoholvrij', badge: '0,3%',
      art: art('can', { liquid: '#f6b93b', label: '#1e3a5f', ink: '#fff', text: 'ZESTRA|Troubadour 0,3%' }) },

    // Mocktails (Sir. James 101, alcoholvrij)
    { id: 'sj-sex-on-the-beach', cat: 'mocktails', name: 'Sex on the Beach', sub: 'Sir. James 101', badge: '0,0%',
      art: art('mocktail', { liquid: '#ff7b54', fruit: '#ffb26b', text: 'SEX ON|THE BEACH', size: 9.5 }) },
    { id: 'sj-passion-fruit-martini', cat: 'mocktails', name: 'Passion Fruit Martini', sub: 'Sir. James 101', badge: '0,0%',
      art: art('mocktail', { liquid: '#f7c548', fruit: '#9b5de5', text: 'PASSION|FRUIT', size: 10 }) },
    { id: 'sj-mojito', cat: 'mocktails', name: 'Mojito', sub: 'Sir. James 101', badge: '0,0%', art: art('mocktail', { liquid: '#b5e48c', fruit: '#52b788', text: 'MOJITO', size: 12 }) },
    { id: 'sj-gt', cat: 'mocktails', name: 'G&T', sub: 'Sir. James 101', badge: '0,0%', art: art('mocktail', { liquid: '#dff3f0', fruit: '#a7d676', text: 'GIN|TONIC', size: 11 }) },
    { id: 'sj-pink-gt', cat: 'mocktails', name: 'Pink G&T', sub: 'Sir. James 101', badge: '0,0%',
      art: art('mocktail', { liquid: '#f6a6c1', fruit: '#e63e6d', text: 'PINK GIN|TONIC', size: 10 }) },
    { id: 'sj-paloma', cat: 'mocktails', name: 'Paloma', sub: 'Sir. James 101', badge: '0,0%', art: art('mocktail', { liquid: '#ffb3a7', fruit: '#ff6f61', text: 'PALOMA', size: 12 }) },

    // Frisdrank
    { id: 'cola-zero', cat: 'fris', name: 'Cola Zero', sub: 'Zonder suiker', art: art('pet', { liquid: '#2b1610', label: '#111', ink: '#e4002b', ink2: '#fff', cap: '#111', stripe: '#e4002b', text: 'COLA|ZERO SUGAR', font: 'Georgia,serif', italic: true, size: 14 }) },
    { id: 'icetea-zero', cat: 'fris', name: 'Ice Tea Zero', sub: 'Zonder suiker', art: art('pet', { liquid: '#e8a33d', opacity: .85, label: '#ffd23f', ink: '#1f4e9c', cap: '#1f4e9c', stripe: '#1f4e9c', text: 'ICE TEA|ZERO', size: 11 }) },
    { id: 'sprite-zero', cat: 'fris', name: 'Sprite Zero', sub: 'Zonder suiker', art: art('pet', { liquid: '#d8f3dc', empty: '#f1faf3', edge: '#a8d5b5', label: '#2d6a4f', ink: '#ffe066', ink2: '#fff', cap: '#2d6a4f', stripe: '#ffe066', text: 'SPRITE|ZERO SUGAR', size: 11, bubbles: true }) },
    { id: 'clementina', cat: 'fris', name: 'San Pellegrino Clementina', sub: 'Mandarijn', art: art('slimcan', { liquid: '#2e9e5b', band: '#1d2b5a', ink: '#fff', fruit: '#ff9f1c', fruit2: '#ffbf69', text: 'CLEMENTINA' }) },
    { id: 'aranciata-rossa', cat: 'fris', name: 'San Pellegrino Aranciata Rossa', sub: 'Bloedsinaasappel', art: art('slimcan', { liquid: '#e85d2a', band: '#1d2b5a', ink: '#fff', fruit: '#c1121f', fruit2: '#ff8c42', text: 'ARANCIATA|ROSSA' }) },
    { id: 'melograno', cat: 'fris', name: 'San Pellegrino Melograno & Arancia', sub: 'Granaatappel & sinaasappel', art: art('slimcan', { liquid: '#c2185b', band: '#1d2b5a', ink: '#fff', fruit: '#8e0e3c', fruit2: '#ff9f1c', text: 'MELOGRANO|& ARANCIA', size: 7 }) },

    // Water
    { id: 'plat-water', cat: 'water', name: 'Plat water', sub: 'Zonder bubbels', art: art('pet', { liquid: '#cfe9fb', opacity: .9, label: '#1565c0', ink: '#fff', cap: '#1565c0', stripe: '#90caf9', text: 'PLAT|WATER', size: 13 }) },
    { id: 'bruiswater', cat: 'water', name: 'Bruiswater', sub: 'Met bubbels', art: art('pet', { liquid: '#cfe9fb', opacity: .9, label: '#d62828', ink: '#fff', cap: '#d62828', stripe: '#ffb4a2', text: 'BRUIS|WATER', size: 13, bubbles: true }) },
  ];

  DRINKS.forEach((d) => (d.src = d.img || d.art));
  window.MENU = { CATEGORIES, DRINKS, byId: Object.fromEntries(DRINKS.map((d) => [d.id, d])) };
})();

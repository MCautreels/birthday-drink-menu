// De drankkaart. Wil je een foto vervangen of toevoegen? Zet een afbeelding in
// /images en vul bij het drankje "img" in. Zonder "img" wordt een tekening getoond.
(function () {
  // --- Getekende flesjes (SVG) voor drankjes zonder foto ---------------------
  function art(kind, o) {
    const liquid = o.liquid || '#f4d35e';
    const label = o.label || '#ffffff';
    const ink = o.ink || '#333';
    const text = o.text || '';
    const glass = o.glass || '#2f4a3a';
    let body = '';
    if (kind === 'wine' || kind === 'sparkling') {
      body = `
        <path d="M52 8h16v34c0 8 18 16 18 34v108a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V76c0-18 18-26 18-34z" fill="${glass}"/>
        <path d="M38 120h44v62a4 4 0 0 1-4 4H42a4 4 0 0 1-4-4z" fill="${liquid}" opacity=".9"/>
        ${kind === 'sparkling'
          ? `<path d="M50 4h20v46H50z" fill="${o.foil || '#d4af37'}"/><path d="M50 44h20l6 10H44z" fill="${o.foil || '#d4af37'}" opacity=".85"/>`
          : `<rect x="51" y="4" width="18" height="20" rx="2" fill="${o.foil || '#7a1f2b'}"/>`}
        <rect x="38" y="92" width="44" height="58" rx="4" fill="${label}"/>
        <text x="60" y="117" font-family="Georgia,serif" font-size="9" text-anchor="middle" fill="${ink}" font-weight="700">${text.split('|')[0] || ''}</text>
        <text x="60" y="131" font-family="Georgia,serif" font-size="7" text-anchor="middle" fill="${ink}">${text.split('|')[1] || ''}</text>
        <text x="60" y="142" font-family="Georgia,serif" font-size="6" text-anchor="middle" fill="${ink}" opacity=".7">${text.split('|')[2] || ''}</text>
        <path d="M44 80c0-8 6-14 10-18" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35" fill="none"/>`;
    } else if (kind === 'can') {
      body = `
        <rect x="32" y="30" width="56" height="150" rx="10" fill="${liquid}"/>
        <rect x="36" y="22" width="48" height="12" rx="4" fill="#c9ccd1"/>
        <rect x="36" y="176" width="48" height="8" rx="3" fill="#c9ccd1"/>
        <rect x="32" y="80" width="56" height="52" fill="${label}"/>
        <text x="60" y="104" font-family="Arial Black,Arial,sans-serif" font-size="11" text-anchor="middle" fill="${ink}">${text.split('|')[0] || ''}</text>
        <text x="60" y="120" font-family="Arial,sans-serif" font-size="8" text-anchor="middle" fill="${ink}">${text.split('|')[1] || ''}</text>
        <rect x="40" y="40" width="6" height="130" rx="3" fill="#fff" opacity=".3"/>`;
    } else if (kind === 'mocktail') {
      // In de stijl van een klein glazen mocktailflesje.
      body = `
        <path d="M50 14h20v22c0 6 16 10 16 26v114a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V62c0-16 16-20 16-26z" fill="#e9f1f2" stroke="#b8c7c9" stroke-width="2"/>
        <path d="M36 96h48v80a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6z" fill="${liquid}" opacity=".85"/>
        <rect x="48" y="6" width="24" height="12" rx="3" fill="${o.cap || '#222'}"/>
        <rect x="36" y="74" width="48" height="76" rx="3" fill="#fbfaf5"/>
        <text x="60" y="88" font-family="Georgia,serif" font-size="5.5" text-anchor="middle" fill="#555" letter-spacing=".5">SIR. JAMES 101</text>
        <text x="60" y="106" font-family="Georgia,serif" font-size="${o.size || 11}" text-anchor="middle" fill="${ink}" font-weight="700">${text.split('|')[0] || ''}</text>
        <text x="60" y="119" font-family="Georgia,serif" font-size="${o.size || 11}" text-anchor="middle" fill="${ink}" font-weight="700">${text.split('|')[1] || ''}</text>
        <text x="60" y="131" font-family="Georgia,serif" font-size="6" text-anchor="middle" fill="#555">MOCKTAIL</text>
        <text x="60" y="143" font-family="Arial,sans-serif" font-size="5.5" text-anchor="middle" fill="#2c8a5a" font-weight="700">ALCOHOL FREE</text>
        <circle cx="${o.fruitX || 76}" cy="160" r="9" fill="${o.fruit || liquid}" stroke="#fff" stroke-width="2"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 190">${body}</svg>`;
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
    { id: 'rode-wijn', cat: 'wijn', name: 'Rode wijn', sub: 'Masso Antico Primitivo', desc: 'Vol en rond, uit Puglia', img: 'images/rode-wijn.jpg' },

    // Bier
    { id: 'duvel', cat: 'bier', name: 'Duvel', sub: 'Blond speciaalbier', badge: '8,5%', img: 'images/duvel.jpg' },
    { id: 'duvel-tripel-hop', cat: 'bier', name: 'Duvel Tripel Hop', sub: 'Extra gehopt', badge: '9,5%', img: 'images/duvel-tripel-hop.jpg' },
    { id: 'tripel-karmeliet', cat: 'bier', name: 'Tripel Karmeliet', sub: 'Tripel met drie granen', badge: '8,4%', img: 'images/tripel-karmeliet.jpg' },
    { id: 'zestra', cat: 'bier', name: 'Troubadour Zestra', sub: 'Bijna alcoholvrij', badge: '0,3%',
      art: art('can', { liquid: '#f6b93b', label: '#1e3a5f', ink: '#fff', text: 'ZESTRA|Troubadour 0,3%' }) },

    // Mocktails (Sir. James 101, alcoholvrij)
    { id: 'sj-sex-on-the-beach', cat: 'mocktails', name: 'Sex on the Beach', sub: 'Sir. James 101', badge: '0,0%',
      art: art('mocktail', { liquid: '#ff7b54', fruit: '#ffb26b', text: 'SEX ON|THE BEACH', size: 9.5 }) },
    { id: 'sj-passion-fruit-martini', cat: 'mocktails', name: 'Passion Fruit Martini', sub: 'Sir. James 101', badge: '0,0%',
      art: art('mocktail', { liquid: '#f7c548', fruit: '#9b5de5', text: 'PASSION|FRUIT', size: 10 }) },
    { id: 'sj-mojito', cat: 'mocktails', name: 'Mojito', sub: 'Sir. James 101', badge: '0,0%', img: 'images/sj-mojito.jpg' },
    { id: 'sj-gt', cat: 'mocktails', name: 'G&T', sub: 'Sir. James 101', badge: '0,0%', img: 'images/sj-gt.jpg' },
    { id: 'sj-pink-gt', cat: 'mocktails', name: 'Pink G&T', sub: 'Sir. James 101', badge: '0,0%',
      art: art('mocktail', { liquid: '#f6a6c1', fruit: '#e63e6d', text: 'PINK GIN|TONIC', size: 10 }) },
    { id: 'sj-paloma', cat: 'mocktails', name: 'Paloma', sub: 'Sir. James 101', badge: '0,0%', img: 'images/sj-paloma.jpg' },

    // Frisdrank
    { id: 'cola-zero', cat: 'fris', name: 'Cola Zero', sub: 'Zonder suiker', img: 'images/cola-zero.jpg' },
    { id: 'icetea-zero', cat: 'fris', name: 'Ice Tea Zero', sub: 'Zonder suiker', img: 'images/icetea-zero.jpg' },
    { id: 'sprite-zero', cat: 'fris', name: 'Sprite Zero', sub: 'Zonder suiker', img: 'images/sprite-zero.jpg' },
    { id: 'clementina', cat: 'fris', name: 'San Pellegrino Clementina', sub: 'Mandarijn', img: 'images/clementina.jpg' },
    { id: 'aranciata-rossa', cat: 'fris', name: 'San Pellegrino Aranciata Rossa', sub: 'Bloedsinaasappel', img: 'images/aranciata.jpg' },
    { id: 'melograno', cat: 'fris', name: 'San Pellegrino Melograno & Arancia', sub: 'Granaatappel & sinaasappel', img: 'images/melograno.jpg' },

    // Water
    { id: 'plat-water', cat: 'water', name: 'Plat water', sub: 'Zonder bubbels', img: 'images/plat-water.jpg' },
    { id: 'bruiswater', cat: 'water', name: 'Bruiswater', sub: 'Met bubbels', img: 'images/bruiswater.jpg' },
  ];

  DRINKS.forEach((d) => (d.src = d.img || d.art));
  window.MENU = { CATEGORIES, DRINKS, byId: Object.fromEntries(DRINKS.map((d) => [d.id, d])) };
})();

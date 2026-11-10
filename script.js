'use strict';
/* =========================================================
   ¡GOLAZO DE TILDES! EL CAMPEONATO DE LAS PALABRAS
   Juego de acentuación para 4.º grado
   ========================================================= */

/* ---------- CONFIGURACIÓN ----------
   Pegá entre las comillas la URL de la aplicación web de Google Apps Script
   (termina en /exec). Ver README.md. Si queda vacía, el juego funciona igual
   y guarda solo en la computadora. */
const CONFIG = {
  SCRIPT_URL: ''
};

/* ---------- EQUIPOS (CATEGORÍAS) ---------- */
const BINS = [
  { id: 'aguda',         label: 'Agudas',         one: 'Aguda',         hint: 'Fuerza en la última sílaba',            color: '#ef4444', num: '1' },
  { id: 'grave',         label: 'Graves',         one: 'Grave',         hint: 'Fuerza en la penúltima',                color: '#2563eb', num: '2' },
  { id: 'esdrujula',     label: 'Esdrújulas',     one: 'Esdrújula',     hint: 'Fuerza en la antepenúltima',            color: '#f59e0b', num: '3' },
  { id: 'sobresdrujula', label: 'Sobresdrújulas', one: 'Sobresdrújula', hint: 'Fuerza antes de la antepenúltima',      color: '#a855f7', num: '4' }
];
const binOne = id => (BINS.find(b => b.id === id) || { one: '—' }).one;

const RULES = [
  { c: '#ef4444', t: 'Agudas', d: 'llevan tilde cuando terminan en N, S o vocal (ca-fé, ra-tón, com-pás).' },
  { c: '#2563eb', t: 'Graves', d: 'llevan tilde cuando NO terminan en N, S ni vocal (ár-bol, lá-piz).' },
  { c: '#f59e0b', t: 'Esdrújulas', d: 'llevan tilde siempre (mú-si-ca).' },
  { c: '#a855f7', t: 'Sobresdrújulas', d: 'llevan tilde siempre (cuén-ta-me-lo).' }
];

/* ---------- LOS CUATRO DESAFÍOS ---------- */
const CHALLENGES = [
  {
    id: 1, title: 'El entrenamiento del golpe de voz', short: 'Entrenamiento', goal: 'Reconocer la sílaba tónica',
    icon: '⚽', color: '#22c55e', host: 'coach', hostName: 'Profe Gambeta',
    intro: '¡Bienvenidos al entrenamiento! Todas las palabras tienen una sílaba que suena más fuerte: es la <b>sílaba tónica</b>. Las demás suenan más suave: son las <b>sílabas átonas</b>. Truco de entrenador: decí la palabra como si gritaras un gol… ¡go-LAAA-zo!',
    cheer: '¡Entrenamiento completo! Tu oído ya detecta el golpe de voz.',
    activities: [
      { id: 'd1a1', type: 'choice', skill: 'Sílaba tónica', title: 'Calentamiento',
        prompt: 'Escuchá y leé la palabra. ¿Qué sílaba suena más fuerte?', word: 'pelota', options: ['pe', 'lo', 'ta'], answer: 1 },
      { id: 'd1a2', type: 'split', skill: 'Separación en sílabas', title: 'Las tarjetas del vestuario',
        prompt: 'Tocá entre las letras para cortar cada palabra en sílabas. ✂', words: [
          { w: 'camisa', cuts: [2, 4] }, { w: 'canción', cuts: [3] }, { w: 'teléfono', cuts: [2, 4, 6] }] },
      { id: 'd1a3', type: 'tonic', skill: 'Sílaba tónica', title: 'Pase al golpe de voz',
        prompt: 'Tocá la sílaba que suena más fuerte en cada palabra.', items: [
          { s: ['re', 'loj'], answer: 1 }, { s: ['ár', 'bol'], answer: 0 }, { s: ['mú', 'si', 'ca'], answer: 0 },
          { s: ['pa', 'pel'], answer: 1 }, { s: ['ca', 'mi', 'sa'], answer: 1 }] },
      { id: 'd1a4', type: 'choice', skill: 'Sílabas tónica y átonas', title: 'Fuerte y suave',
        prompt: 'En «galleta», la sílaba tónica es «lle». ¿Cuáles son las sílabas átonas (las que suenan más suave)?',
        word: 'ga-lle-ta', speakWord: 'galleta', options: ['ga y ta', 'lle', 'ga y lle', 'Ninguna: todas suenan igual'], answer: 0 },
      { id: 'd1a5', type: 'multi', skill: 'Posición de la sílaba tónica', title: '¿En qué lugar de la cancha?',
        prompt: '¿En qué lugar está la sílaba más fuerte de cada palabra?', options: ['Última', 'Penúltima', 'Antepenúltima'], items: [
          { label: 'can-ción', speak: 'canción', answer: 0 }, { label: 'me-sa', speak: 'mesa', answer: 1 },
          { label: 'te-lé-fo-no', speak: 'teléfono', answer: 2 }, { label: 'pe-lo-ta', speak: 'pelota', answer: 1 }] },
      { id: 'd1a6', type: 'choice', skill: 'Sílaba tónica', title: 'Desafío del VAR',
        prompt: 'El VAR marcó en MAYÚSCULAS la sílaba fuerte de cada palabra. ¿En qué jugada se equivocó?',
        options: ['za-PA-to', 'can-CIÓN', 'RE-loj', 'MÚ-si-ca'], answer: 2 }
    ]
  },
  {
    id: 2, title: 'El VAR de las palabras', short: 'Sala del VAR', goal: 'Clasificar palabras según su sílaba tónica',
    icon: '📺', color: '#3b82f6', host: 'ref', hostName: 'Árbitra Varela',
    intro: '¡Bienvenidos a la sala del VAR! Según dónde esté la sílaba tónica, cada palabra juega en un equipo:<br><b>Agudas:</b> última sílaba · <b>Graves:</b> penúltima · <b>Esdrújulas:</b> antepenúltima · <b>Sobresdrújulas:</b> antes de la antepenúltima.',
    cheer: '¡Revisión terminada! Ya sabés en qué equipo juega cada palabra.',
    activities: [
      { id: 'd2a1', type: 'classify', skill: 'Clasificación', title: '¡A las camisetas!',
        prompt: 'Arrastrá cada palabra a su camiseta (o tocá la palabra y después la camiseta).', words: [
          ['canción', 'aguda'], ['reloj', 'aguda'], ['árbol', 'grave'], ['mesa', 'grave'],
          ['música', 'esdrujula'], ['pájaro', 'esdrujula'], ['cuéntamelo', 'sobresdrujula'], ['dígaselo', 'sobresdrujula']] },
      { id: 'd2a2', type: 'multi', skill: 'Clasificación', title: 'Repetición en cámara lenta',
        prompt: 'Mirá cada palabra separada en sílabas. ¿En qué equipo juega?', options: ['Aguda', 'Grave', 'Esdrújula', 'Sobresdrújula'], items: [
          { label: 'a-zú-car', speak: 'azúcar', answer: 1 }, { label: 'co-li-brí', speak: 'colibrí', answer: 0 },
          { label: 'pe-lí-cu-la', speak: 'película', answer: 2 }] },
      { id: 'd2a3', type: 'speed', skill: 'Clasificación', title: 'Contrarreloj del VAR', seconds: 8,
        prompt: '¡Clasificá cada palabra que aparece! El reloj es solo para divertirse: si se termina, seguís jugando igual.', words: [
          ['papel', 'aguda'], ['lápiz', 'grave'], ['brújula', 'esdrujula'], ['sofá', 'aguda'], ['explícamelo', 'sobresdrujula'], ['ventana', 'grave']] },
      { id: 'd2a4', type: 'choice', skill: 'Clasificación', title: 'Jugador en el equipo equivocado',
        prompt: 'Este es el equipo de las GRAVES. ¿Qué palabra se metió en el equipo equivocado?',
        options: ['árbol', 'cancha', 'camión', 'dulce'], answer: 2 },
      { id: 'd2a5', type: 'multi', skill: 'Clasificación', title: 'Los carteles de la cancha',
        prompt: 'Clasificá las palabras de los carteles del estadio.', options: ['Aguda', 'Grave', 'Esdrújula', 'Sobresdrújula'], items: [
          { label: 'ESTADIO', speak: 'estadio', answer: 1, sign: true }, { label: 'GOLEADOR', speak: 'goleador', answer: 0, sign: true },
          { label: 'PÚBLICO', speak: 'público', answer: 2, sign: true }, { label: 'CAMPEÓN', speak: 'campeón', answer: 0, sign: true },
          { label: '¡PÁSAMELA!', speak: 'pásamela', answer: 3, sign: true }] },
      { id: 'd2a6', type: 'choice', skill: 'Clasificación', title: 'El fichaje sobresdrújulo',
        prompt: 'Solo una de estas palabras juega en el equipo de las sobresdrújulas. ¿Cuál es?',
        options: ['teléfono', 'murciélago', 'llévatelo', 'pájaro'], answer: 2 }
    ]
  },
  {
    id: 3, title: 'El vestuario de las tildes', short: 'Vestuario', goal: 'Aplicar las reglas de acentuación',
    icon: '👕', color: '#f59e0b', host: 'player', hostName: 'Capitana Acento', rules: true,
    intro: '¡Atención, equipo! <b>Todas las palabras tienen sílaba tónica, pero no todas llevan tilde.</b> La tilde es la rayita que a veces se escribe sobre la vocal de la sílaba tónica. Estas son las reglas del vestuario:',
    cheer: '¡Camisetas listas! Ya aplicás las reglas de la tilde.',
    activities: [
      { id: 'd3a1', type: 'multi', skill: 'Reglas de tilde', title: '¿Lleva tilde o no?',
        prompt: 'Estas camisetas tienen las palabras escritas sin tilde. ¿Cuáles la necesitan?', options: ['Sí, lleva', 'No lleva'], items: [
          { label: 'raton', hint: 'aguda', answer: 0 }, { label: 'pared', hint: 'aguda', answer: 1 },
          { label: 'arbol', hint: 'grave', answer: 0 }, { label: 'zapato', hint: 'grave', answer: 1 },
          { label: 'examen', hint: 'grave', answer: 1 }] },
      { id: 'd3a2', type: 'tilde', skill: 'Reglas de tilde', title: 'Estampando tildes',
        prompt: 'Tocá la vocal donde va la tilde. Si creés que no lleva, tocá «Sin tilde».', items: [
          { w: 'cafe', answer: 3 }, { w: 'lapiz', answer: 1 }, { w: 'musica', answer: 1 }, { w: 'camion', answer: 4 }] },
      { id: 'd3a3', type: 'errors', skill: 'Corrección de errores', title: 'Subtítulos con fallas',
        prompt: 'En los subtítulos de este video hay 2 palabras con errores de tilde. Tocalas para marcarlas.',
        video: 'Golazo en el último minuto',
        text: 'El delantero tómo la pelota, corrió por la cancha y festejó con el público del estádio.', errors: ['tómo', 'estádio'] },
      { id: 'd3a4', type: 'choice', skill: 'Justificación', title: 'La explicación de la capitana',
        prompt: '¿Por qué «lápiz» lleva tilde?', options: [
          'Porque es grave y no termina en n, s ni vocal.', 'Porque es aguda y termina en z.',
          'Porque todas las palabras graves llevan tilde.', 'Porque es esdrújula.'], answer: 0 },
      { id: 'd3a5', type: 'multi', skill: 'Corrección de errores', title: 'La lista del vestuario',
        prompt: 'El utilero escribió dos versiones de cada palabra. Elegí la que está bien escrita.', items: [
          { label: '1', options: ['sillon', 'sillón'], answer: 1 }, { label: '2', options: ['relój', 'reloj'], answer: 1 },
          { label: '3', options: ['difícil', 'dificil'], answer: 0 }, { label: '4', options: ['jóven', 'joven'], answer: 1 },
          { label: '5', options: ['compás', 'compas'], answer: 0 }] },
      { id: 'd3a6', type: 'multi', skill: 'Clasificación y regla', title: 'Cada palabra con su regla', vertical: true,
        prompt: 'Uní cada palabra con la regla que explica por qué lleva o no lleva tilde.', options: [
          'Aguda terminada en vocal: lleva tilde', 'Aguda que no termina en n, s ni vocal: no lleva tilde',
          'Grave terminada en vocal: no lleva tilde', 'Esdrújula: siempre lleva tilde', 'Sobresdrújula: siempre lleva tilde'], items: [
          { label: 'sofá', answer: 0 }, { label: 'mesa', answer: 2 }, { label: 'pájaro', answer: 3 },
          { label: 'reloj', answer: 1 }, { label: 'cómpraselo', answer: 4 }] }
    ]
  },
  {
    id: 4, title: 'La gran final: campeones de la acentuación', short: 'La gran final', goal: 'Integrar todo lo aprendido',
    icon: '🏆', color: '#a855f7', host: 'tildo', hostName: 'Tildo',
    intro: '¡Llegó la <b>GRAN FINAL</b>! Para levantar la copa vas a usar todo: sílaba tónica, equipos de palabras y reglas de tilde. ¡Cada respuesta perfecta es un golazo!',
    cheer: '¡Campeones y campeonas de la acentuación!',
    activities: [
      { id: 'd4a1', type: 'errors', skill: 'Corrección de errores', title: 'La publicación de Tildo', post: true,
        prompt: 'Tildo publicó esto, pero tiene 2 errores de tilde: en una palabra sobra y en otra falta. Tocá las 2 palabras con error.',
        text: 'Hoy jugamos un partído increíble y el arbitro cobró un penal en el último minuto.', errors: ['partído', 'arbitro'] },
      { id: 'd4a2', type: 'classify', skill: 'Clasificación', title: 'La formación de la final',
        prompt: 'Armá la formación: ubicá cada palabra en su camiseta.', words: [
          ['corazón', 'aguda'], ['jamás', 'aguda'], ['fútbol', 'grave'], ['cuaderno', 'grave'],
          ['lámpara', 'esdrujula'], ['sábado', 'esdrujula'], ['devuélvemela', 'sobresdrujula'], ['entrégaselo', 'sobresdrujula']] },
      { id: 'd4a3', type: 'tilde', skill: 'Reglas de tilde', title: 'Carteles sin terminar',
        prompt: 'A estos carteles les falta revisar las tildes. Tocá la vocal que lleva tilde o elegí «Sin tilde».', items: [
          { w: 'arbitro', answer: 0 }, { w: 'jugador', answer: -1 }, { w: 'angel', answer: 0 }, { w: 'dibujalo', answer: 3 }] },
      { id: 'd4a4', type: 'choice', skill: 'Reglas de tilde', title: '¿Quién se coló en el equipo?',
        prompt: 'Este es el equipo de las agudas CON tilde. ¿Qué palabra no debería estar?',
        options: ['sofá', 'balcón', 'después', 'reloj'], answer: 3 },
      { id: 'd4a5', type: 'choice', skill: 'Justificación', title: 'La pregunta del árbitro',
        prompt: '¿Por qué «cantar» NO lleva tilde?', options: [
          'Porque es aguda y no termina en n, s ni vocal.', 'Porque es grave y termina en r.',
          'Porque las palabras agudas nunca llevan tilde.', 'Porque no tiene sílaba tónica.'], answer: 0 },
      { id: 'd4a6', type: 'multi', skill: 'Corrección de errores', title: 'Los carteles del partido',
        prompt: 'Elegí el cartel bien escrito en cada par.', items: [
          { label: 'Cartel 1', options: ['Último minuto', 'Ultimo minuto'], answer: 0 },
          { label: 'Cartel 2', options: ['Equipo campeon', 'Equipo campeón'], answer: 1 },
          { label: 'Cartel 3', options: ['¡Gol de cabeza!', '¡Gól de cabeza!'], answer: 0 },
          { label: 'Cartel 4', options: ['Vestuário local', 'Vestuario local'], answer: 1 }] },
      { id: 'd4a7', type: 'choice', skill: 'Sílaba tónica y tilde', title: 'El último penal',
        prompt: 'La palabra «pelota» no lleva tilde. ¿Tiene sílaba tónica?', options: [
          'Sí: la sílaba tónica es «lo».', 'No, porque no lleva tilde.',
          'Sí: la sílaba tónica es «pe».', 'No: solo las palabras con tilde tienen sílaba tónica.'], answer: 0 }
    ]
  }
];

/* Frases de Tildo. «¡Perfecto, caballero!» se reserva para las respuestas correctas. */
const LINES_START = ['¡Una tilde puede cambiarlo todo!', '¡Ese golpe de voz no se me escapa!', '¡El VAR de las palabras nunca falla!',
  'Decí la palabra en voz alta, despacito. ¡El oído es tu mejor jugador!', '¡Leé la consigna con calma y a la cancha!',
  '¡Qué palabra tan bien ubicada!', '¿Dudás? Aplaudí cada sílaba: ¡pa-pa-PÁ!'];
const LINES_DONE = ['¡Jugada registrada!', '¡Respuesta guardada en el VAR!', '¡Qué manera de jugar!', '¡Seguimos jugando!'];
const PERFECTO = '¡Perfecto, caballero!';
const CASI = '¡Casi, caballero!';
const LINES_SKIP = ['¡Tranqui! Esta jugada te espera para después.', 'Seguimos jugando. ¡Después volvemos!'];

/* ---------- UTILIDADES ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const titleCase = s => s.trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const ACC = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
const applyAcc = (w, i) => (i == null || i < 0) ? w : w.slice(0, i) + ACC[w[i]] + w.slice(i + 1);
const stripPunct = t => t.replace(/[.,;:¡!¿?«»"]/g, '');
const pad = n => String(n).padStart(2, '0');
const fmtDate = ts => { const d = new Date(ts); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

const mem = {};
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return mem[k] || null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } },
  keys() { try { return Object.keys(localStorage); } catch (e) { return Object.keys(mem); } }
};
const STORE_PREFIX = 'tildeEnJuego_v1_';

/* Preparar datos derivados */
CHALLENGES.forEach(c => c.activities.forEach((a, i) => {
  a.n = i + 1;
  if (a.type === 'errors') {
    a.tokens = a.text.split(' ');
    a.errIdx = a.tokens.map((t, j) => a.errors.includes(stripPunct(t)) ? j : -1).filter(j => j >= 0);
  }
}));
const findAct = id => { for (const c of CHALLENGES) for (const a of c.activities) if (a.id === id) return { c, a }; return null; };

/* ---------- PERSONAJES 3D (SVG con volumen) ---------- */
let svgUid = 0;
function charSVG(kind, mood = 'happy') {
  if (kind === 'tildo') return tildoSVG(mood);
  const id = 'g' + (svgUid++);
  const P = {
    caballero: { shirt: '#3b82f6', shirtD: '#1e3a8a', skin: '#f5c29a', skinD: '#c98a5e', hair: '#3b2416' },
    coach:     { shirt: '#22c55e', shirtD: '#14532d', skin: '#dba27a', skinD: '#a8694a', hair: '#1f2937' },
    ref:       { shirt: '#1f2937', shirtD: '#020617', skin: '#eab08a', skinD: '#b97852', hair: '#7c2d12' },
    player:    { shirt: '#ef4444', shirtD: '#7f1d1d', skin: '#c68a5a', skinD: '#8d5a34', hair: '#1c1917' }
  }[kind];
  const mouth = mood === 'wow'
    ? `<ellipse cx="100" cy="132" rx="9" ry="11" fill="#7f1d1d"/><ellipse cx="100" cy="137" rx="5" ry="4" fill="#f87171"/>`
    : `<path d="M78 126 Q100 150 122 126 Q100 138 78 126Z" fill="#7f1d1d"/><path d="M86 132 Q100 140 114 132 Q100 146 86 132Z" fill="#f87171"/>`;
  let extra = '', top = '';
  if (kind === 'caballero') {
    top = `<rect x="64" y="8" width="72" height="42" rx="8" fill="url(#${id}h)"/><rect x="64" y="38" width="72" height="9" fill="#facc15"/>
           <ellipse cx="100" cy="50" rx="58" ry="10" fill="#111827"/>`;
    extra = `<path d="M100 118 C90 108 70 110 62 124 C74 118 86 124 100 122 C114 124 126 118 138 124 C130 110 110 108 100 118Z" fill="${P.hair}"/>
             <path d="M100 172 L78 160 L78 186Z M100 172 L122 160 L122 186Z" fill="#dc2626"/><circle cx="100" cy="172" r="7" fill="#b91c1c"/>
             <path d="M70 168 L92 200 L100 176 L108 200 L130 168" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/>`;
  } else if (kind === 'coach') {
    top = `<path d="M44 82 Q100 18 156 82 Z" fill="#f97316"/><path d="M44 82 Q100 70 156 82" stroke="#c2410c" stroke-width="5" fill="none"/>
           <path d="M122 78 Q166 70 178 86 Q146 92 122 84Z" fill="#ea580c"/>`;
    extra = `<path d="M84 166 Q100 200 116 166" stroke="#e5e7eb" stroke-width="3" fill="none"/><rect x="108" y="196" width="20" height="10" rx="4" fill="#cbd5e1"/>
             <text x="100" y="230" font-family="Baloo 2, sans-serif" font-size="22" font-weight="800" text-anchor="middle" fill="#fff">PROFE</text>`;
  } else if (kind === 'ref') {
    top = `<path d="M48 84 Q52 30 100 36 Q148 30 152 84 Q130 58 100 60 Q70 58 48 84Z" fill="${P.hair}"/>`;
    extra = `<path d="M70 164 L100 180 L130 164" fill="none" stroke="#facc15" stroke-width="6"/>
             <rect x="58" y="196" width="18" height="24" rx="3" fill="#facc15" transform="rotate(-12 67 208)"/>
             <rect x="124" y="196" width="18" height="24" rx="3" fill="#ef4444" transform="rotate(12 133 208)"/>
             <circle cx="100" cy="206" r="8" fill="#cbd5e1"/>`;
  } else {
    top = `<path d="M46 82 L56 40 L72 62 L84 30 L100 56 L116 28 L128 60 L146 40 L154 82 Q100 58 46 82Z" fill="${P.hair}"/>`;
    extra = `<text x="100" y="226" font-family="Baloo 2, sans-serif" font-size="40" font-weight="800" text-anchor="middle" fill="#fde68a">10</text>
             <path d="M70 164 L100 176 L130 164" fill="none" stroke="#fde68a" stroke-width="6"/>`;
  }
  return `<svg class="char" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="${id}s" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2e2"/><stop offset="55%" stop-color="${P.skin}"/><stop offset="100%" stop-color="${P.skinD}"/></radialGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.shirt}"/><stop offset="1" stop-color="${P.shirtD}"/></linearGradient>
    <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#374151"/><stop offset=".5" stop-color="#111827"/><stop offset="1" stop-color="#000"/></linearGradient>
    <radialGradient id="${id}e" cx="40%" cy="35%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e2e8f0"/></radialGradient>
  </defs>
  <ellipse cx="100" cy="244" rx="62" ry="6" fill="#000" opacity=".3"/>
  <path d="M38 244 Q36 178 70 160 L130 160 Q164 178 162 244 Z" fill="url(#${id}b)"/>
  <path d="M52 240 Q52 190 74 172" stroke="#fff" stroke-opacity=".25" stroke-width="8" fill="none" stroke-linecap="round"/>
  <rect x="87" y="146" width="26" height="20" rx="9" fill="url(#${id}s)"/>
  <circle cx="45" cy="100" r="12" fill="url(#${id}s)"/><circle cx="155" cy="100" r="12" fill="url(#${id}s)"/>
  <circle cx="100" cy="98" r="56" fill="url(#${id}s)"/>
  ${top}
  <path d="M70 80 Q80 72 90 80" stroke="${P.hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M110 80 Q120 72 130 80" stroke="${P.hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="80" cy="99" rx="11" ry="13" fill="url(#${id}e)"/><ellipse cx="120" cy="99" rx="11" ry="13" fill="url(#${id}e)"/>
  <circle cx="82" cy="101" r="6" fill="#1e293b"/><circle cx="122" cy="101" r="6" fill="#1e293b"/>
  <circle cx="84" cy="98" r="2.2" fill="#fff"/><circle cx="124" cy="98" r="2.2" fill="#fff"/>
  <ellipse cx="66" cy="118" rx="9" ry="5" fill="#fb7185" opacity=".45"/><ellipse cx="134" cy="118" rx="9" ry="5" fill="#fb7185" opacity=".45"/>
  ${mouth}
  ${extra}
</svg>`;
}

/* Tildo: pelota de fútbol con una tilde en la cabeza */
function tildoSVG(mood = 'happy') {
  const id = 'td' + (svgUid++);
  const mouth = mood === 'wow'
    ? `<path d="M76 122 Q100 158 124 122 Z" fill="#7f1d1d"/><path d="M86 136 Q100 148 114 136 Q100 154 86 136Z" fill="#f87171"/><path d="M80 123 L120 123 L118 128 L82 128Z" fill="#fff"/>`
    : `<path d="M80 122 Q100 144 120 122" stroke="#7f1d1d" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const sparks = mood === 'wow'
    ? `<path d="M30 40 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4Z" fill="#facc15"/><path d="M170 58 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3Z" fill="#facc15"/>`
    : '';
  const pent = pts => `<polygon points="${pts}" fill="#1e293b"/>`;
  return `<svg class="char" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="${id}b" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></radialGradient>
    <linearGradient id="${id}j" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#14532d"/></linearGradient>
    <linearGradient id="${id}t" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#fde047"/></linearGradient>
    <radialGradient id="${id}e" cx="40%" cy="35%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e2e8f0"/></radialGradient>
    <clipPath id="${id}c"><circle cx="100" cy="100" r="60"/></clipPath>
  </defs>
  <ellipse cx="100" cy="244" rx="62" ry="6" fill="#000" opacity=".3"/>
  <path d="M40 244 Q38 180 72 164 L128 164 Q162 180 160 244 Z" fill="url(#${id}j)"/>
  <path d="M54 240 Q54 192 76 176" stroke="#fff" stroke-opacity=".25" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M78 164 L100 180 L122 164" fill="none" stroke="#fde047" stroke-width="6"/>
  <path d="M92 226 L110 200" stroke="#fde047" stroke-width="9" stroke-linecap="round"/>
  <circle cx="36" cy="204" r="13" fill="#fff" stroke="#cbd5e1" stroke-width="3"/><circle cx="164" cy="204" r="13" fill="#fff" stroke="#cbd5e1" stroke-width="3"/>
  <path d="M106 50 L132 6" stroke="#92400e" stroke-width="22" stroke-linecap="round"/>
  <path d="M106 48 L131 7" stroke="url(#${id}t)" stroke-width="15" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="60" fill="url(#${id}b)"/>
  <g clip-path="url(#${id}c)" opacity=".92">
    ${pent('100,30 117,42 111,60 89,60 83,42')}
    ${pent('28,80 50,86 52,110 32,120 18,100')}
    ${pent('172,80 150,86 148,110 168,120 182,100')}
    ${pent('54,142 76,140 84,158 68,172 48,162')}
    ${pent('146,142 124,140 116,158 132,172 152,162')}
    <path d="M83 42 L50 86 M117 42 L150 86 M52 110 L54 142 M148 110 L146 142 M84 158 L116 158" stroke="#94a3b8" stroke-width="2.5" fill="none"/>
  </g>
  <circle cx="100" cy="100" r="60" fill="none" stroke="#0f172a" stroke-width="3"/>
  <ellipse cx="76" cy="66" rx="16" ry="9" fill="#fff" opacity=".7" transform="rotate(-30 76 66)"/>
  <path d="M68 80 Q80 72 92 80" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M108 80 Q120 72 132 80" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="80" cy="99" rx="12" ry="14" fill="url(#${id}e)" stroke="#cbd5e1" stroke-width="1.5"/><ellipse cx="120" cy="99" rx="12" ry="14" fill="url(#${id}e)" stroke="#cbd5e1" stroke-width="1.5"/>
  <circle cx="82" cy="101" r="6.5" fill="#1e293b"/><circle cx="122" cy="101" r="6.5" fill="#1e293b"/>
  <circle cx="84" cy="98" r="2.4" fill="#fff"/><circle cx="124" cy="98" r="2.4" fill="#fff"/>
  <ellipse cx="62" cy="118" rx="9" ry="5" fill="#fb7185" opacity=".5"/><ellipse cx="138" cy="118" rx="9" ry="5" fill="#fb7185" opacity=".5"/>
  ${mouth}
  ${sparks}
</svg>`;
}

/* Camiseta 3D para cada equipo */
function shirtSVG(b) {
  const id = 'sh' + (svgUid++);
  return `<svg class="shirt-svg" viewBox="0 0 100 90" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="${b.color}"/><stop offset="1" stop-color="${b.color}"/></linearGradient></defs>
  <path d="M30 6 L42 2 Q50 10 58 2 L70 6 L96 22 L86 40 L74 34 L74 86 L26 86 L26 34 L14 40 L4 22Z" fill="url(#${id})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
  <path d="M26 34 L26 86 L34 86 L34 30Z" fill="#000" opacity=".12"/>
  <text x="50" y="68" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="30" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width="1">${b.num}</text></svg>`;
}

/* ---------- SONIDO Y VOZ ---------- */
let actx = null, muted = false;
function sfx(kind) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { pop: [[660, .07]], win: [[523, .11], [659, .11], [784, .11], [1047, .28]], whistle: [[1900, .12], [1750, .3]], skip: [[440, .08], [520, .1]], casi: [[587, .12], [494, .22]] }[kind] || [[500, .05]];
    let t = actx.currentTime;
    seq.forEach(([f, d]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'whistle' ? 'square' : 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(kind === 'whistle' ? .05 : .13, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d); t += d * .9;
    });
  } catch (e) { /* sin sonido */ }
}
function speak(w, rate = .75, pitch = 1) {
  try {
    const u = new SpeechSynthesisUtterance(w);
    u.lang = 'es-AR'; u.rate = rate; u.pitch = pitch;
    const vs = speechSynthesis.getVoices();
    const v = vs.find(v => /^es[-_](AR|419|MX|US)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang));
    if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { toast('Esta computadora no puede leer en voz alta. ¡Leé la palabra en voz alta vos!'); }
}
function toggleMute() {
  muted = !muted;
  document.querySelectorAll('#btn-mute,#btn-mute-map').forEach(b => b.textContent = muted ? '🔇' : '🔊');
}

/* ---------- EFECTOS VISUALES ---------- */
let parts = [], confettiRunning = false;
function confetti(n = 110) {
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const cols = ['#facc15', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ffffff'];
  for (let i = 0; i < n; i++) parts.push({
    x: innerWidth / 2 + (Math.random() - .5) * 260, y: innerHeight * .42,
    vx: (Math.random() - .5) * 16, vy: -Math.random() * 15 - 5, s: Math.random() * 9 + 5,
    r: Math.random() * 6, vr: (Math.random() - .5) * .35, c: cols[i % cols.length], star: Math.random() < .25, life: 0
  });
  if (confettiRunning) return;
  confettiRunning = true;
  (function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => {
      p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.star) { ctx.font = `${p.s * 2.6}px serif`; ctx.fillText('⭐', -p.s, p.s); }
      else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    parts = parts.filter(p => p.y < cv.height + 40 && p.life < 260);
    if (parts.length) requestAnimationFrame(loop);
    else { confettiRunning = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  })();
}
function celebrate(text, casi = false) {
  const el = $('#celebrate'), t = $('#cele-text');
  t.textContent = text; el.classList.remove('hidden'); t.classList.toggle('casi', casi);
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  if (casi) sfx('casi'); else { confetti(100); sfx('win'); }
  clearTimeout(celebrate._t); celebrate._t = setTimeout(() => el.classList.add('hidden'), 1800);
}
function toast(msg, ms = 3200) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}
function overlay(html) { $('#overlay-card').innerHTML = html; $('#overlay').classList.remove('hidden'); }
function closeOverlay() { $('#overlay').classList.add('hidden'); }

/* ---------- ESTADO DEL JUGADOR ---------- */
let S = null;                       // estado del estudiante
const ui = { ch: null, idx: 0, draft: null, sel: null, actStart: 0, chStart: 0 };

const storeKey = st => STORE_PREFIX + st.division + '_' + st.nameKey;
function saveLocal() { if (S) store.set(storeKey(S), S); }
function chState(id = ui.ch) {
  const cs = S.ch[id] || (S.ch[id] = { answers: {}, finished: false, time: 0 });
  cs.tries = cs.tries || {}; cs.drafts = cs.drafts || {};
  return cs;
}
const clone = v => JSON.parse(JSON.stringify(v));
function saveDraft() { chState().drafts[curAct().id] = clone(ui.draft); saveLocal(); }
function getAns(id) { const f = findAct(id); return f && S.ch[f.c.id] ? S.ch[f.c.id].answers[id] : null; }
const curCh = () => CHALLENGES.find(c => c.id === ui.ch);
const curAct = () => curCh().activities[ui.idx];
const answeredCount = (c, st = S) => c.activities.filter(a => st.ch[c.id] && st.ch[c.id].answers[a.id]).length;
const isUnlocked = c => c.id === 1 || (S.ch[c.id - 1] && S.ch[c.id - 1].finished) || answeredCount(CHALLENGES[c.id - 2]) === CHALLENGES[c.id - 2].activities.length;
function accumulateTime() {
  if (ui.ch && ui.chStart) { chState().time += Math.round((Date.now() - ui.chStart) / 1000); ui.chStart = Date.now(); }
}

/* ---------- CORRECCIÓN INTERNA (no se muestra a los estudiantes) ---------- */
function segment(w, cuts) {
  const L = [...w], out = []; let prev = 0;
  [...cuts].sort((x, y) => x - y).forEach(c => { out.push(L.slice(prev, c).join('')); prev = c; });
  out.push(L.slice(prev).join(''));
  return out;
}
function grade(a, v) {
  const R = (score, given, correct) => ({ score: Math.round(score * 100) / 100, given, correct });
  switch (a.type) {
    case 'choice': return R(v === a.answer ? 1 : 0, a.options[v], a.options[a.answer]);
    case 'multi': {
      let ok = 0; const g = [], c = [];
      a.items.forEach((it, i) => { const op = it.options || a.options; if (v[i] === it.answer) ok++; g.push(`${it.label}: ${op[v[i]] ?? '—'}`); c.push(`${it.label}: ${op[it.answer]}`); });
      return R(ok / a.items.length, g.join(' | '), c.join(' | '));
    }
    case 'split': {
      let ok = 0;
      a.words.forEach((wd, i) => { if ([...v[i]].sort().join() === [...wd.cuts].sort().join()) ok++; });
      return R(ok / a.words.length, a.words.map((wd, i) => segment(wd.w, v[i]).join('-')).join(' | '), a.words.map(wd => segment(wd.w, wd.cuts).join('-')).join(' | '));
    }
    case 'tonic': {
      let ok = 0; const show = (it, k) => it.s.map((s, j) => j === k ? s.toUpperCase() : s).join('-');
      a.items.forEach((it, i) => { if (v[i] === it.answer) ok++; });
      return R(ok / a.items.length, a.items.map((it, i) => show(it, v[i])).join(' | '), a.items.map(it => show(it, it.answer)).join(' | '));
    }
    case 'classify': {
      let ok = 0; a.words.forEach(([w, b]) => { if (v[w] === b) ok++; });
      return R(ok / a.words.length, a.words.map(([w]) => `${w} → ${binOne(v[w])}`).join(' | '), a.words.map(([w, b]) => `${w} → ${binOne(b)}`).join(' | '));
    }
    case 'speed': {
      let ok = 0; a.words.forEach(([w, b], i) => { if (v[i] === b) ok++; });
      return R(ok / a.words.length, a.words.map(([w], i) => `${w} → ${binOne(v[i])}`).join(' | '), a.words.map(([w, b]) => `${w} → ${binOne(b)}`).join(' | '));
    }
    case 'errors': {
      const tp = v.filter(i => a.errIdx.includes(i)).length, fp = v.length - tp;
      return R(Math.max(0, tp - fp) / a.errIdx.length, v.map(i => stripPunct(a.tokens[i])).join(', ') || '—', a.errors.join(', '));
    }
    case 'tilde': {
      let ok = 0; const show = (w, k) => k === -1 ? `${w} (sin tilde)` : applyAcc(w, k);
      a.items.forEach((it, i) => { if (v[i] === it.answer) ok++; });
      return R(ok / a.items.length, a.items.map((it, i) => show(it.w, v[i])).join(' | '), a.items.map(it => show(it.w, it.answer)).join(' | '));
    }
  }
  return R(0, '', '');
}
function initDraft(a) {
  switch (a.type) {
    case 'choice': return null;
    case 'multi': case 'tonic': case 'tilde': return Array(a.items.length).fill(null);
    case 'split': return a.words.map(() => []);
    case 'classify': return {};
    default: return [];
  }
}
function isComplete(a, v) {
  switch (a.type) {
    case 'choice': return v !== null;
    case 'multi': case 'tonic': case 'tilde': return v.every(x => x !== null);
    case 'split': return v.every(x => x.length > 0);
    case 'classify': return Object.keys(v).length === a.words.length;
    case 'speed': return v.length === a.words.length;
    case 'errors': return v.length > 0;
  }
  return false;
}

/* ---------- VISTAS DE CADA TIPO DE ACTIVIDAD ---------- */
const speakBtn = w => `<button class="speak" data-k="speak" data-w="${esc(w)}" title="Escuchar" aria-label="Escuchar ${esc(w)}">🔊</button>`;
const VIEWS = {
  choice(a, v) {
    let h = '';
    if (a.word) h += `<div class="word-ball"><span>${esc(a.word)}</span>${speakBtn(a.speakWord || a.word)}</div>`;
    return h + `<div class="opts n${a.options.length}">` + a.options.map((o, i) =>
      `<button class="opt3d ${v === i ? 'sel' : ''}" data-k="opt" data-i="${i}">${a.options.length > 3 ? `<span class="opt-letter">${'ABCD'[i]}</span>` : ''}<span>${esc(o)}</span></button>`).join('') + `</div>`;
  },
  multi(a, v) {
    return `<div class="multi ${a.vertical ? 'vertical' : ''}">` + a.items.map((it, i) => {
      const op = it.options || a.options;
      return `<div class="mrow"><div class="mlabel ${it.sign ? 'sign' : ''}">${esc(it.label)}${it.speak ? speakBtn(it.speak) : ''}${it.hint ? `<small class="tag">es ${esc(it.hint)}</small>` : ''}</div>
        <div class="mopts">${op.map((o, j) => `<button class="chip ${v[i] === j ? 'sel' : ''}" data-k="m" data-i="${i}" data-o="${j}">${esc(o)}</button>`).join('')}</div></div>`;
    }).join('') + `</div>`;
  },
  split(a, v) {
    return `<div class="splits">` + a.words.map((wd, i) => {
      const L = [...wd.w], cuts = v[i]; let row = '';
      L.forEach((ch, j) => {
        row += `<span class="letter">${esc(ch)}</span>`;
        if (j < L.length - 1) { const on = cuts.includes(j + 1); row += `<button class="gap ${on ? 'on' : ''}" data-k="cut" data-w="${i}" data-p="${j + 1}" aria-label="Cortar aquí">${on ? '✂' : ''}</button>`; }
      });
      const segs = cuts.length ? segment(wd.w, cuts) : [];
      return `<div class="split-card"><div class="split-row">${row}${speakBtn(wd.w)}</div>
        <div class="split-preview">${segs.map(s => `<span class="syl-tile">${esc(s)}</span>`).join('')}</div></div>`;
    }).join('') + `</div>`;
  },
  tonic(a, v) {
    return `<div class="tonic-list">` + a.items.map((it, i) => `<div class="tonic-row"><div class="syls">${it.s.map((s, j) =>
      `<button class="syl ${v[i] === j ? 'strong' : ''}" data-k="ton" data-i="${i}" data-s="${j}">${esc(s)}</button>`).join('<span class="dash">-</span>')}</div>${speakBtn(it.s.join(''))}</div>`).join('') + `</div>`;
  },
  classify(a, v) {
    const bank = a.words.filter(([w]) => !v[w]);
    let h = `<div class="bank">${bank.length ? bank.map(([w]) =>
      `<button class="ball-chip ${ui.sel === w ? 'sel' : ''}" data-k="pick" data-w="${esc(w)}" data-drag="${esc(w)}" draggable="true">⚽ ${esc(w)}</button>`).join('')
      : '<span class="bank-empty">¡Todas las palabras están en la cancha!</span>'}</div>`;
    h += `<div class="shirts">` + BINS.map(b => `<div class="shirt-zone" data-k="bin" data-b="${b.id}" style="--c:${b.color}">${shirtSVG(b)}
      <div class="shirt-name">${b.label}</div><div class="shirt-hint">${b.hint}</div>
      <div class="placed">${a.words.filter(([w]) => v[w] === b.id).map(([w]) => `<button class="placed-chip" data-k="unplace" data-w="${esc(w)}" data-drag="${esc(w)}" draggable="true">${esc(w)}${getAns(a.id) ? '' : ' ✕'}</button>`).join('')}</div></div>`).join('') + `</div>`;
    return h;
  },
  speed(a, v, locked) {
    const n = a.words.length;
    if (v.length < n && !locked) {
      const w = a.words[v.length][0];
      return `<div class="speed"><div class="speed-count">Palabra ${v.length + 1} de ${n}</div>
        <div class="speed-ball" key="${v.length}"><span>${esc(w)}</span>${speakBtn(w)}</div>
        <div class="timer"><div class="timer-fill" style="animation-duration:${a.seconds}s"></div></div>
        <div class="timer-msg">⏱ ¡Rápido, pero sin apuro!</div>
        <div class="speed-bins">${BINS.map(b => `<button class="bin-btn" style="--c:${b.color}" data-k="sp" data-b="${b.id}">${b.one}</button>`).join('')}</div></div>`;
    }
    return `<div class="speed-done"><h4>${locked ? 'Tu ronda' : '¡Ronda terminada! Revisá y confirmá.'}</h4>
      <div class="recap">${a.words.map(([w], i) => `<span class="recap-chip">${esc(w)} → <b>${binOne(v[i])}</b></span>`).join('')}</div>
      ${locked ? '' : '<button class="btn btn-soft btn-sm" data-k="spreset">↺ Repetir la ronda</button>'}</div>`;
  },
  errors(a, v) {
    const toks = a.tokens.map((t, i) => `<button class="tok ${v.includes(i) ? 'flag' : ''}" data-k="tok" data-t="${i}">${esc(t)}</button>`).join(' ');
    const card = a.post
      ? `<div class="post-card"><div class="post-head"><div class="post-avatar">${charSVG('tildo')}</div><div><b>Tildo ✔</b><small>@tildo.oficial · hace 5 min</small></div></div>
         <p class="subtitle">${toks}</p><div class="post-foot"><span>❤️ 1,2 mil</span><span>💬 348</span><span>🔁 97</span></div></div>`
      : `<div class="video-card"><div class="video-screen"><span class="video-title">🎬 ${esc(a.video)}</span><div class="play">▶</div></div>
         <div class="video-bar"><i></i></div><p class="subtitle">${toks}</p></div>`;
    return card + `<div class="err-count">Marcaste ${v.length} de ${a.errors.length} palabras.</div>`;
  },
  tilde(a, v) {
    return `<div class="tilde-list">` + a.items.map((it, i) => {
      const sel = v[i];
      const letters = [...it.w].map((ch, j) => 'aeiou'.includes(ch)
        ? `<button class="tl vowel ${sel === j ? 'on' : ''}" data-k="til" data-i="${i}" data-l="${j}">${sel === j ? ACC[ch] : ch}</button>`
        : `<span class="tl">${esc(ch)}</span>`).join('');
      return `<div class="tilde-row"><div class="tletters">${letters}</div>
        <button class="chip ${sel === -1 ? 'sel' : ''}" data-k="til" data-i="${i}" data-l="-1">Sin tilde</button>
        <div class="tresult">${sel == null ? '…' : esc(applyAcc(it.w, sel))}</div></div>`;
    }).join('') + `</div>`;
  }
};

/* ---------- NAVEGACIÓN ENTRE PANTALLAS ---------- */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
}

/* INGRESO */
function initLogin() {
  $('#login-mascot').innerHTML = charSVG('tildo');
  $('#login-form').addEventListener('submit', e => {
    e.preventDefault();
    const dv = $('#in-div').value.replace(/\s/g, '').toUpperCase();
    const nm = $('#in-name').value.trim().replace(/\s+/g, ' ');
    const err = $('#login-error');
    if (!dv || !nm) { err.textContent = 'Completá los dos campos para entrar.'; return; }
    if (dv !== '4A' && dv !== '4B') { err.textContent = 'En «Grado y división» escribí 4A o 4B.'; return; }
    if (nm.split(' ').length < 2 || !/^[\p{L}' -]+$/u.test(nm)) { err.textContent = 'Escribí tu nombre y tu apellido (solo letras).'; return; }
    err.textContent = '';
    login(dv, titleCase(nm));
  });
  $('#btn-teacher').addEventListener('click', () => { show('screen-teacher'); });
}
function login(division, name) {
  const nameKey = norm(name);
  const saved = store.get(STORE_PREFIX + division + '_' + nameKey);
  S = saved || { v: 1, division, name, nameKey, key: division + '|' + nameKey, created: Date.now(), ch: {} };
  saveLocal(); sfx('whistle');
  renderMap(); show('screen-map');
  toast(saved ? `¡Hola de nuevo, ${name.split(' ')[0]}! Tu progreso te estaba esperando.` : `¡Bienvenido/a al campeonato, ${name.split(' ')[0]}!`);
  fetchRemoteProgress();
  if (S.dirty) sync();
}

/* MAPA */
function renderMap() {
  $('#map-name').textContent = S.name;
  $('#map-div').textContent = S.division === '4A' ? '4.º A' : '4.º B';
  $('#map-avatar').innerHTML = charSVG('player');
  $('#map-mascot').innerHTML = charSVG('tildo');
  const allDone = CHALLENGES.every(c => S.ch[c.id] && S.ch[c.id].finished);
  $('#map-bubble').innerHTML = allDone ? '¡Sos campeón o campeona de la acentuación! Podés volver a cualquier desafío para completar lo pendiente.' : 'Elegí el desafío. ¡Vamos paso a paso hasta la gran final!';
  $('#map-path').innerHTML = CHALLENGES.map(c => {
    const done = answeredCount(c), n = c.activities.length, open = isUnlocked(c), fin = S.ch[c.id] && S.ch[c.id].finished;
    const state = !open ? 'Se desbloquea al terminar el desafío anterior'
      : fin ? (done === n ? '¡Desafío completo!' : `Terminado · ${n - done} pendiente${n - done > 1 ? 's' : ''}`)
      : done ? `En juego · ${done} de ${n}` : '¡Listo para jugar!';
    return `<button class="station ${open ? '' : 'locked'}" data-ch="${c.id}" style="--c:${c.color}" ${open ? '' : 'aria-disabled="true"'}>
      ${!open ? '<span class="st-lock">🔒</span>' : fin ? '<span class="st-trophy">🏅</span>' : ''}
      <div class="st-badge">${c.icon}</div><div class="st-num">DESAFÍO ${c.id}</div><h3>${esc(c.short)}</h3>
      <p class="st-goal">${esc(c.goal)}</p><div class="st-bar"><i style="width:${Math.round(done / n * 100)}%"></i></div>
      <div class="st-state">${state}</div></button>`;
  }).join('');
}
function openChallenge(id) {
  const c = CHALLENGES.find(x => x.id === id);
  if (!isUnlocked(c)) { toast('Primero terminá el desafío anterior. ¡Paso a paso!'); return; }
  ui.ch = id; sfx('whistle');
  const rules = c.rules ? `<div class="rules">${RULES.map(r => `<div class="rule" style="--c:${r.c}"><b>${r.t}:</b> ${r.d}</div>`).join('')}</div>` : '';
  overlay(`<div class="ov-host">${charSVG(c.host)}<b>${esc(c.hostName)}</b></div>
    <div><div class="st-num" style="--c:${c.color};color:${c.color}">DESAFÍO ${c.id}</div><h2>${esc(c.title)}</h2>
    <p>${c.intro}</p>${rules}
    <div class="ov-actions"><button class="btn btn-gold" data-ov="start">¡A la cancha! ⚽</button><button class="btn btn-soft" data-ov="map">Volver al mapa</button></div></div>`);
}
function startChallenge() {
  closeOverlay();
  const c = curCh(), st = chState(c.id);
  st.visited = true; saveLocal();
  ui.chStart = Date.now();
  const firstPending = c.activities.findIndex(a => !st.answers[a.id]);
  show('screen-activity');
  goAct(firstPending >= 0 ? firstPending : 0);
}

/* ACTIVIDAD */
function goAct(i) {
  ui.idx = i; ui.sel = null; ui.actStart = Date.now();
  const a = curAct(), d = chState().drafts[a.id];
  ui.draft = d !== undefined ? clone(d) : initDraft(a);
  renderActivity();
}
function renderActivity() {
  const c = curCh(), a = curAct(), st = chState(c.id);
  const tag = $('#act-ch'); tag.textContent = `${c.icon} Desafío ${c.id}: ${c.short}`; tag.style.setProperty('--c', c.color);
  $('#act-dots').innerHTML = c.activities.map((x, i) =>
    `<button class="dot ${st.answers[x.id] ? 'done' : (st.tries[x.id] || []).length ? 'tried' : ''} ${i === ui.idx ? 'cur' : ''}" data-dot="${i}" title="${esc(x.title)}">${st.answers[x.id] ? '★' : i + 1}</button>`).join('');
  $('#act-num').textContent = `Actividad ${a.n} de ${c.activities.length}`;
  $('#act-title').textContent = a.title;
  $('#act-prompt').textContent = a.prompt;
  const card = $('.act-card'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
  if (!$('#act-mascot').innerHTML) $('#act-mascot').innerHTML = charSVG('tildo');
  say(getAns(a.id) ? '¡Esta jugada ya quedó guardada! Podés seguir con la próxima.'
    : (st.tries[a.id] || []).length ? 'Revisá tu respuesta y probá otra vez. ¡Vos podés!' : pick(LINES_START));
  renderInteraction();
}
function renderInteraction() {
  const a = curAct(), saved = getAns(a.id), locked = !!saved, box = $('#act-body');
  box.classList.toggle('locked', locked);
  if (saved && saved.remote) box.innerHTML = `<div class="remote-lock">🔒 Ya respondiste esta actividad en otra computadora. ¡Seguí con la próxima!</div>`;
  else box.innerHTML = VIEWS[a.type](a, locked ? saved.v : ui.draft, locked) + (locked ? '<div class="locked-note">🔒 Respuesta guardada</div>' : '');
  const bar = box.querySelector('.timer-fill');
  if (bar) bar.addEventListener('animationend', () => { const m = box.querySelector('.timer-msg'); if (m) m.textContent = '⏱ ¡Tiempo extra! Seguí jugando tranquilo.'; });
  updateFooter();
}
function updateFooter() {
  const c = curCh(), a = curAct(), saved = getAns(a.id), last = ui.idx === c.activities.length - 1;
  $('#btn-prev').disabled = ui.idx === 0;
  const conf = $('#btn-confirm');
  conf.classList.toggle('hidden', !!saved);
  conf.disabled = !isComplete(a, ui.draft);
  conf.textContent = (chState().tries[a.id] || []).length ? 'Volver a confirmar ✔' : 'Confirmar ✔';
  const nx = $('#btn-next');
  nx.textContent = last ? 'Terminar desafío 🏁' : 'Siguiente ▶';
  nx.classList.toggle('btn-soft', !saved);
  nx.classList.toggle('btn-blue', !!saved);
  nx.classList.toggle('glow', !!saved && last);
}
function say(text, mood = 'happy') {
  const b = $('#act-bubble'); b.textContent = text;
  b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
  $('#act-mascot').innerHTML = charSVG('tildo', mood);
}
function confirmAnswer() {
  const c = curCh(), a = curAct();
  if (getAns(a.id) || !isComplete(a, ui.draft)) return;
  const st = chState(c.id), score = grade(a, ui.draft).score, now = Date.now();
  const sec = Math.round((now - ui.actStart) / 1000);
  if (score === 1) {
    st.answers[a.id] = { v: clone(ui.draft), at: now, sec };
    delete st.drafts[a.id];
    accumulateTime(); saveLocal(); sync();
    celebrate(PERFECTO);
    renderActivity(); say(PERFECTO + ' ¡Perfecto!', 'wow');
    if (!muted) speak(PERFECTO + ' ¡Perfecto!', 1, 1.2);
    const ch = ui.ch, idx = ui.idx;
    if (idx < c.activities.length - 1) setTimeout(() => { if (ui.ch === ch && ui.idx === idx && $('#screen-activity').classList.contains('active')) goAct(idx + 1); }, 2600);
  } else {
    (st.tries[a.id] = st.tries[a.id] || []).push({ v: clone(ui.draft), at: now, score, sec });
    saveDraft(); accumulateTime(); saveLocal(); sync();
    celebrate(CASI, true);
    renderActivity(); say(CASI + ' Revisá tu respuesta y probá otra vez.');
    if (!muted) speak(CASI, 1, 1.1);
  }
}
function nextAct() {
  const c = curCh(), a = curAct();
  if (!getAns(a.id)) { saveDraft(); sfx('skip'); toast('¡Podés continuar! Después podés volver para completarla.'); }
  if (ui.idx < c.activities.length - 1) goAct(ui.idx + 1); else finishChallenge();
}
function finishChallenge() {
  const c = curCh(), st = chState(c.id);
  accumulateTime(); st.finished = true; saveLocal(); sync();
  const n = c.activities.length, pend = n - answeredCount(c);
  const champion = c.id === 4 || CHALLENGES.every(x => S.ch[x.id] && S.ch[x.id].finished);
  confetti(220); sfx('win');
  const msg = pend
    ? `Te ${pend === 1 ? 'quedó 1 actividad pendiente' : `quedaron ${pend} actividades pendientes`}. ¡Podés volver cuando quieras para completarlas!`
    : '¡Completaste todas las actividades de este desafío!';
  const nextC = CHALLENGES.find(x => x.id === c.id + 1);
  overlay(`<div class="ov-host"><div class="trophy">${champion ? '🏆' : '🏅'}</div>${charSVG('tildo', 'wow')}</div>
    <div><div class="st-num" style="color:${c.color}">DESAFÍO ${c.id} TERMINADO</div><h2>${esc(c.cheer)}</h2>
    <p>${msg}</p>${nextC ? `<p>Se desbloqueó el <b>Desafío ${nextC.id}: ${esc(nextC.short)}</b>. ¡Golazo!</p>` : '<p>¡Llegaste a la gran final y la jugaste completa! Ya sos campeón o campeona de ¡Golazo de Tildes!. 🎉</p>'}
    <div class="ov-actions"><button class="btn btn-gold" data-ov="map">Ir al mapa 🗺️</button>${pend ? '<button class="btn btn-soft" data-ov="pending">Completar pendientes</button>' : ''}</div></div>`);
}
function goPending() {
  closeOverlay();
  const c = curCh(), st = chState(c.id);
  const i = c.activities.findIndex(a => !st.answers[a.id]);
  ui.chStart = Date.now(); show('screen-activity'); goAct(i >= 0 ? i : 0);
}
function toMap() {
  accumulateTime(); saveLocal(); ui.chStart = 0;
  closeOverlay(); renderMap(); show('screen-map');
}

/* EVENTOS DE LA ACTIVIDAD (tocar, arrastrar y soltar) */
function initActivityEvents() {
  const body = $('#act-body');
  body.addEventListener('click', e => {
    const t = e.target.closest('[data-k]'); if (!t) return;
    const d = t.dataset;
    if (d.k === 'speak') { speak(d.w); return; }
    const a = curAct(); if (getAns(a.id)) return;
    const v = ui.draft;
    switch (d.k) {
      case 'opt': ui.draft = +d.i; break;
      case 'm': v[+d.i] = +d.o; break;
      case 'cut': { const arr = v[+d.w], p = +d.p, j = arr.indexOf(p); j >= 0 ? arr.splice(j, 1) : arr.push(p); arr.sort((x, y) => x - y); break; }
      case 'ton': v[+d.i] = +d.s; break;
      case 'pick': ui.sel = ui.sel === d.w ? null : d.w; break;
      case 'bin': if (ui.sel) { v[ui.sel] = d.b; ui.sel = null; } else { toast('Primero tocá una palabra ⚽ y después su camiseta.', 2200); return; } break;
      case 'unplace': delete v[d.w]; break;
      case 'sp': v.push(d.b); break;
      case 'spreset': ui.draft = []; break;
      case 'tok': { const i = +d.t, j = v.indexOf(i); j >= 0 ? v.splice(j, 1) : v.push(i); break; }
      case 'til': v[+d.i] = (v[+d.i] === +d.l ? null : +d.l); break;
      default: return;
    }
    sfx('pop'); saveDraft(); renderInteraction();
  });
  body.addEventListener('dragstart', e => { const t = e.target.closest('[data-drag]'); if (t) { e.dataTransfer.setData('text/plain', t.dataset.drag); e.dataTransfer.effectAllowed = 'move'; } });
  body.addEventListener('dragover', e => { const b = e.target.closest('[data-k="bin"]'); if (b) { e.preventDefault(); b.classList.add('over'); } });
  body.addEventListener('dragleave', e => { const b = e.target.closest('[data-k="bin"]'); if (b && !b.contains(e.relatedTarget)) b.classList.remove('over'); });
  body.addEventListener('drop', e => {
    const b = e.target.closest('[data-k="bin"]'); if (!b) return;
    e.preventDefault();
    const w = e.dataTransfer.getData('text/plain'), a = curAct();
    if (w && !getAns(a.id) && a.words.some(([x]) => x === w)) { ui.draft[w] = b.dataset.b; ui.sel = null; sfx('pop'); saveDraft(); renderInteraction(); }
  });
  $('#act-dots').addEventListener('click', e => { const d = e.target.closest('[data-dot]'); if (d) { if (!getAns(curAct().id)) saveDraft(); goAct(+d.dataset.dot); } });
  $('#btn-prev').addEventListener('click', () => { if (ui.idx > 0) { if (!getAns(curAct().id)) saveDraft(); goAct(ui.idx - 1); } });
  $('#btn-next').addEventListener('click', nextAct);
  $('#btn-confirm').addEventListener('click', confirmAnswer);
  $('#btn-to-map').addEventListener('click', () => { if (ui.ch && !getAns(curAct().id)) saveDraft(); toMap(); });
  $('#btn-mute').addEventListener('click', toggleMute);
  $('#btn-mute-map').addEventListener('click', toggleMute);
  $('#map-path').addEventListener('click', e => { const s = e.target.closest('[data-ch]'); if (s) openChallenge(+s.dataset.ch); });
  $('#btn-logout').addEventListener('click', () => { accumulateTime(); saveLocal(); S = null; $('#in-name').value = ''; $('#in-div').value = ''; show('screen-login'); });
  $('#overlay').addEventListener('click', e => {
    const b = e.target.closest('[data-ov]'); if (!b) return;
    if (b.dataset.ov === 'start') startChallenge();
    if (b.dataset.ov === 'map') toMap();
    if (b.dataset.ov === 'pending') goPending();
  });
  window.addEventListener('beforeunload', () => { if (!S) return; accumulateTime(); saveLocal(); sync(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S) { accumulateTime(); saveLocal(); } });
}

/* ---------- REGISTRO PARA LA DOCENTE ---------- */
function buildRows(st) {
  const rows = [];
  CHALLENGES.forEach(c => {
    const cs = st.ch[c.id]; if (!cs) return;
    const n = c.activities.length;
    const tries = cs.tries || {};
    const answered = c.activities.filter(a => cs.answers[a.id]).length;
    // Logro = resultado del PRIMER intento de cada actividad
    const first = a => (tries[a.id] || []).length ? tries[a.id][0].score
      : cs.answers[a.id] && !cs.answers[a.id].remote ? 1 : null;
    const graded = c.activities.map(first).filter(x => x !== null);
    const logroDes = graded.length ? Math.round(graded.reduce((x, y) => x + y, 0) / graded.length * 100) : '';
    c.activities.forEach(a => {
      const an = cs.answers[a.id], tr = tries[a.id] || [];
      if (an && an.remote) return;            // ya registrada desde otra computadora
      const last = an ? an : tr[tr.length - 1];
      const g = last ? grade(a, last.v) : null, f = first(a);
      const intentos = tr.length + (an ? 1 : 0);
      rows.push({
        key: `${st.key}|${a.id}`, actId: a.id, estudiante: st.name, division: st.division,
        desafio: `${c.id}. ${c.title}`, nro: a.n, actividad: a.title, contenido: a.skill,
        estado: an ? 'Respondida' : tr.length ? 'Sin resolver' : 'Pendiente', fechaRespuesta: last ? fmtDate(last.at) : '',
        respuesta: g ? g.given : '', correcta: g ? g.correct : grade(a, initDraft(a)).correct,
        resultado: an ? (tr.length ? `Correcta en el intento ${intentos}` : 'Correcta al primer intento')
          : tr.length ? `Todavía incorrecta (${tr.length} intento${tr.length > 1 ? 's' : ''})` : 'Pendiente',
        logroAct: f === null ? '' : Math.round(f * 100), respondidas: answered, pendientes: n - answered,
        resolucion: Math.round(answered / n * 100), logroDesafio: logroDes, tiempoMin: Math.round((cs.time || 0) / 6) / 10,
        intentos: intentos || '', primeraRespuesta: tr.length ? grade(a, tr[0].v).given : g ? g.given : ''
      });
    });
  });
  return rows;
}
function sync(beacon = false) {
  if (!S) return;
  if (!CONFIG.SCRIPT_URL) return;
  const body = JSON.stringify({ action: 'save', division: S.division, rows: buildRows(S) });
  if (beacon && navigator.sendBeacon) {
    try { navigator.sendBeacon(CONFIG.SCRIPT_URL, new Blob([body], { type: 'text/plain;charset=utf-8' })); } catch (e) { }
    return;
  }
  fetch(CONFIG.SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body })
    .then(() => { if (S) { S.dirty = false; saveLocal(); } })
    .catch(() => { if (S) { S.dirty = true; saveLocal(); } });
}
async function fetchRemoteProgress() {
  if (!CONFIG.SCRIPT_URL || !S) return;
  try {
    const r = await fetch(CONFIG.SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'progreso', division: S.division, estudiante: S.key }) });
    const j = await r.json();
    if (!j.ok || !S) return;
    let changed = false;
    (j.respondidas || []).forEach(id => {
      const f = findAct(id); if (!f) return;
      const cs = S.ch[f.c.id] || (S.ch[f.c.id] = { answers: {}, finished: false, time: 0 });
      if (!cs.answers[id]) { cs.answers[id] = { remote: true, at: Date.now() }; changed = true; }
    });
    if (changed) { saveLocal(); if ($('#screen-map').classList.contains('active')) renderMap(); }
  } catch (e) { /* sin conexión: se sigue jugando igual */ }
}

/* ---------- PANEL DOCENTE ---------- */
function initTeacher() {
  $('#btn-teacher-back').addEventListener('click', () => show(S ? 'screen-map' : 'screen-login'));
  $('#teacher-form').addEventListener('submit', async e => {
    e.preventDefault();
    const key = $('#t-key').value.trim(), div = $('#t-div').value, msg = $('#t-msg');
    if (!CONFIG.SCRIPT_URL) { msg.textContent = 'Todavía no está conectada la planilla de Google (falta SCRIPT_URL en script.js). Podés usar el modo prueba.'; return; }
    if (!key) { msg.textContent = 'Escribí la clave docente.'; return; }
    msg.textContent = 'Buscando resultados…';
    try {
      const r = await fetch(CONFIG.SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'panel', clave: key, division: div }) });
      const j = await r.json();
      if (!j.ok) { msg.textContent = j.error || 'No se pudieron leer los resultados.'; return; }
      msg.textContent = `Datos actualizados: ${fmtDate(Date.now())}`;
      renderPanel(j.rows || []);
    } catch (err) { msg.textContent = 'No se pudo conectar con la planilla. Revisá la conexión y la URL de Apps Script.'; }
  });
  $('#btn-local').addEventListener('click', () => {
    const div = $('#t-div').value;
    const rows = store.keys().filter(k => k.startsWith(STORE_PREFIX)).map(k => store.get(k)).filter(Boolean)
      .filter(st => div === 'todas' || st.division === div).flatMap(buildRows);
    $('#t-msg').textContent = 'Modo prueba: solo se muestran las partidas jugadas en esta computadora.';
    renderPanel(rows);
  });
  $('#t-results').addEventListener('input', e => {
    if (e.target.id !== 't-search') return;
    const q = norm(e.target.value);
    document.querySelectorAll('#t-students tbody tr').forEach(tr => { tr.style.display = norm(tr.dataset.name).includes(q) ? '' : 'none'; });
  });
  $('#t-results').addEventListener('click', e => { const b = e.target.closest('[data-student]'); if (b) showStudent(b.dataset.student); });
}
let PANEL = null;
const pillClass = p => p === '' || p == null ? 'p-na' : p >= 70 ? 'p-hi' : p >= 40 ? 'p-mid' : 'p-lo';
const avg = arr => arr.length ? Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) : '';
function renderPanel(rows) {
  rows = rows.map(r => ({ ...r, actId: r.actId || String(r.key).split('|').pop(), logroAct: r.logroAct === '' ? '' : Number(r.logroAct) }));
  const students = {};
  rows.forEach(r => { const k = `${r.division}|${r.estudiante}`; (students[k] = students[k] || { name: r.estudiante, div: r.division, rows: {} }).rows[r.actId] = r; });
  PANEL = { students };
  const list = Object.entries(students).sort((a, b) => a[1].div.localeCompare(b[1].div) || a[1].name.localeCompare(b[1].name));
  const out = $('#t-results');
  if (!list.length) { out.innerHTML = '<p class="summary-text">Todavía no hay resultados registrados para esta selección.</p>'; return; }

  const answered = rows.filter(r => r.estado !== 'Pendiente' && r.logroAct !== '');
  const pendingRows = rows.filter(r => r.estado !== 'Respondida');
  const bySkill = {};
  answered.forEach(r => (bySkill[r.contenido] = bySkill[r.contenido] || []).push(r.logroAct));
  const skills = Object.entries(bySkill).map(([s, v]) => ({ s, p: avg(v), n: v.length })).sort((a, b) => a.p - b.p);
  const acts = CHALLENGES.flatMap(c => c.activities.map(a => {
    const rr = rows.filter(r => r.actId === a.id);
    const ans = rr.filter(r => r.estado !== 'Pendiente' && r.logroAct !== '').map(r => r.logroAct);
    return { c, a, p: avg(ans), n: ans.length, pend: rr.filter(r => r.estado !== 'Respondida').length };
  }));
  const hardest = acts.filter(x => x.n).sort((a, b) => a.p - b.p).slice(0, 5);
  const totalAvg = avg(answered.map(r => r.logroAct));
  const completeAll = list.filter(([, s]) => CHALLENGES.every(c => c.activities.every(a => s.rows[a.id] && s.rows[a.id].estado === 'Respondida'))).length;

  const summary = `Hay <b>${list.length}</b> estudiante${list.length > 1 ? 's' : ''} con registros; <b>${completeAll}</b> completaron los cuatro desafíos.
    El logro promedio al primer intento es <b>${totalAvg}%</b>. ${skills.length ? `El contenido más consolidado es <b>${esc(skills[skills.length - 1].s)}</b> (${skills[skills.length - 1].p}%)
    y el que necesita más refuerzo es <b>${esc(skills[0].s)}</b> (${skills[0].p}%).` : ''}
    ${hardest.length ? `La actividad con mayor dificultad fue «${esc(hardest[0].a.title)}» (Desafío ${hardest[0].c.id}).` : ''}
    Quedan <b>${pendingRows.length}</b> actividades sin resolver en total.`;

  const chCell = (s, c) => {
    const rr = c.activities.map(a => s.rows[a.id]).filter(Boolean);
    if (!rr.length) return '<span class="pill p-na">—</span>';
    const done = rr.filter(r => r.estado === 'Respondida');
    const p = avg(rr.filter(r => r.estado !== 'Pendiente' && r.logroAct !== '').map(r => r.logroAct));
    return `<span class="pill ${pillClass(p)}">${p === '' ? '—' : p + '%'}</span> <small>${done.length}/${c.activities.length}</small>`;
  };

  out.innerHTML = `
    <div class="t-grid">
      <div class="kpi"><b>${list.length}</b><span>Estudiantes</span></div>
      <div class="kpi"><b>${totalAvg}%</b><span>Logro al primer intento</span></div>
      <div class="kpi"><b>${completeAll}</b><span>Completaron todo</span></div>
      <div class="kpi"><b>${pendingRows.length}</b><span>Actividades sin resolver</span></div>
    </div>
    <div class="t-section"><h3>Resumen general de los aprendizajes</h3><p class="summary-text">${summary}</p></div>
    <div class="t-section"><h3>Logro al primer intento por contenido (de menor a mayor)</h3><div class="bars">${skills.map(k =>
      `<div class="bar-row"><span>${esc(k.s)}</span><div class="bar"><i style="width:${k.p}%;background:${k.p >= 70 ? '#22c55e' : k.p >= 40 ? '#facc15' : '#ef4444'}"></i></div><span>${k.p}%</span></div>`).join('')}</div></div>
    <div class="t-section"><h3>Actividades con mayor dificultad</h3><div class="bars">${hardest.map(x =>
      `<div class="bar-row"><span>D${x.c.id} · ${esc(x.a.title)}</span><div class="bar"><i style="width:${x.p}%;background:${x.p >= 70 ? '#22c55e' : x.p >= 40 ? '#facc15' : '#ef4444'}"></i></div><span>${x.p}%</span></div>`).join('')}</div></div>
    <div class="t-section"><h3>Desempeño por estudiante</h3>
      <input id="t-search" class="t-search" placeholder="🔎 Buscar por nombre y apellido">
      <div class="table-wrap"><table class="t-table" id="t-students"><thead><tr><th>Estudiante</th><th>División</th>
        ${CHALLENGES.map(c => `<th>D${c.id} · ${esc(c.short)}</th>`).join('')}<th>Sin resolver</th><th></th></tr></thead><tbody>
        ${list.map(([k, s]) => {
          const pend = Object.values(s.rows).filter(r => r.estado !== 'Respondida');
          return `<tr data-name="${esc(s.name)}"><td><b>${esc(s.name)}</b></td><td>${esc(s.div)}</td>${CHALLENGES.map(c => `<td>${chCell(s, c)}</td>`).join('')}
            <td>${pend.length ? `<span class="pill p-mid">${pend.length}</span>` : '<span class="pill p-hi">0</span>'}</td>
            <td><button class="mini-btn" data-student="${esc(k)}">Ver detalle</button></td></tr>`;
        }).join('')}</tbody></table></div>
      <p><small>% = logro al primer intento · x/y = actividades resueltas correctamente en el desafío.</small></p></div>
    <div class="t-section"><h3>Actividades sin resolver</h3>${pendingRows.length ? `<div class="table-wrap"><table class="t-table"><thead><tr><th>Estudiante</th><th>División</th><th>Desafío</th><th>Actividad</th><th>Estado</th></tr></thead><tbody>
      ${pendingRows.map(r => `<tr><td>${esc(r.estudiante)}</td><td>${esc(r.division)}</td><td>${esc(r.desafio)}</td><td>${esc(r.nro)}. ${esc(r.actividad)}</td><td><span class="pill ${r.estado === 'Pendiente' ? 'p-na' : 'p-mid'}">${esc(r.estado === 'Pendiente' ? 'Sin responder' : r.resultado)}</span></td></tr>`).join('')}</tbody></table></div>`
      : '<p class="summary-text">No hay actividades sin resolver. 🎉</p>'}</div>`;
}
function showStudent(k) {
  const s = PANEL && PANEL.students[k]; if (!s) return;
  const rows = CHALLENGES.flatMap(c => c.activities.map(a => s.rows[a.id]).filter(Boolean));
  overlay(`<div style="grid-column:1/-1"><h2>${esc(s.name)} · ${esc(s.div)}</h2>
    <div class="table-wrap" style="max-height:60vh;margin-top:12px"><table class="t-table"><thead><tr><th>Desafío</th><th>Actividad</th><th>Contenido</th><th>Primera respuesta</th><th>Última respuesta</th><th>Respuesta correcta</th><th>Intentos</th><th>Resultado</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(String(r.desafio).split('.')[0])}</td><td>${esc(r.nro)}. ${esc(r.actividad)}</td><td>${esc(r.contenido)}</td>
      <td>${esc(r.primeraRespuesta) || '<i>—</i>'}</td><td>${esc(r.respuesta) || '<i>Pendiente</i>'}</td><td>${esc(r.correcta)}</td><td>${esc(r.intentos) || 0}</td>
      <td><span class="pill ${r.estado === 'Pendiente' ? 'p-na' : pillClass(r.logroAct)}">${esc(r.resultado)}${r.logroAct !== '' ? ` (${r.logroAct}%)` : ''}</span></td></tr>`).join('')}
    </tbody></table></div><div class="ov-actions"><button class="btn btn-blue" data-close="1">Cerrar</button></div></div>`);
  $('#overlay-card [data-close]').addEventListener('click', closeOverlay);
}

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initLogin(); initActivityEvents(); initTeacher();
  try { speechSynthesis.getVoices(); } catch (e) { }
});

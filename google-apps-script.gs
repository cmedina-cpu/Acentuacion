/**
 * ¡GOLAZO DE TILDES! EL CAMPEONATO DE LAS PALABRAS
 * Registro de resultados en Google Sheets (hojas "4.º A" y "4.º B").
 *
 * La clave del panel docente NO se escribe acá: se guarda en
 * Configuración del proyecto ▸ Propiedades de la secuencia de comandos
 * con el nombre CLAVE_DOCENTE (ver README.md).
 */

const HOJAS = { '4A': '4.º A', '4B': '4.º B' };
const ZONA = 'America/Argentina/Mendoza';

const COLUMNAS = [
  ['key', 'Clave interna'],
  ['actualizado', 'Última actualización'],
  ['estudiante', 'Nombre y apellido'],
  ['division', 'División'],
  ['desafio', 'Desafío'],
  ['nro', 'N.º actividad'],
  ['actividad', 'Actividad'],
  ['contenido', 'Contenido'],
  ['estado', 'Estado'],
  ['fechaRespuesta', 'Fecha y hora de respuesta'],
  ['respuesta', 'Última respuesta'],
  ['correcta', 'Respuesta correcta'],
  ['resultado', 'Resultado'],
  ['logroAct', 'Logro al primer intento (%)'],
  ['respondidas', 'Respondidas del desafío'],
  ['pendientes', 'Pendientes del desafío'],
  ['resolucion', 'Resolución del desafío (%)'],
  ['logroDesafio', 'Logro del desafío (%)'],
  ['tiempoMin', 'Tiempo en el desafío (min)'],
  ['intentos', 'Intentos'],
  ['primeraRespuesta', 'Primera respuesta']
];
const CAMPOS = COLUMNAS.map(c => c[0]);
const C = {}; CAMPOS.forEach((k, i) => C[k] = i);
// Columnas que se pueden actualizar aunque la actividad ya esté respondida (resumen del desafío)
const RESUMEN = ['actualizado', 'respondidas', 'pendientes', 'resolucion', 'logroDesafio', 'tiempoMin'];

/** Ejecutar UNA vez desde el editor para crear las hojas y autorizar el script. */
function crearHojas() {
  Object.keys(HOJAS).forEach(hoja_);
  return 'Hojas listas';
}

function doGet() {
  return json_({ ok: true, mensaje: '¡Golazo de Tildes! — servicio activo' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'save') return json_(guardar_(data));
    if (data.action === 'progreso') return json_(progreso_(data));
    if (data.action === 'panel') return json_(panel_(data));
    return json_({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return json_({ ok: false, error: 'Error: ' + err });
  }
}

/* ---------- Guardar (sin duplicados) ---------- */
function guardar_(data) {
  const div = String(data.division || '').toUpperCase();
  if (!HOJAS[div]) return { ok: false, error: 'División inválida' };
  const filas = (Array.isArray(data.rows) ? data.rows : []).slice(0, 100)
    .filter(r => r && typeof r.key === 'string' && r.key.indexOf(div + '|') === 0);
  if (!filas.length) return { ok: true, guardadas: 0 };

  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const sh = hoja_(div);
    const ultima = sh.getLastRow();
    const datos = ultima > 1 ? sh.getRange(2, 1, ultima - 1, CAMPOS.length).getValues() : [];
    const indice = {};
    datos.forEach((fila, i) => { indice[String(fila[0])] = i; });
    const ahora = new Date();
    const nuevas = [];
    let cambios = false;

    filas.forEach(r => {
      const valores = CAMPOS.map(k => k === 'actualizado' ? ahora : limpiar_(r[k]));
      valores[C.division] = div;
      if (indice[r.key] === -1) return;            // repetida dentro del mismo envío
      if (indice.hasOwnProperty(r.key)) {
        const existente = datos[indice[r.key]];
        if (existente[C.estado] === 'Respondida') {
          // La respuesta queda bloqueada: solo se actualiza el resumen del desafío
          RESUMEN.forEach(k => { existente[C[k]] = valores[C[k]]; });
        } else {
          datos[indice[r.key]] = valores;
        }
        cambios = true;
      } else {
        indice[r.key] = -1;
        nuevas.push(valores);
      }
    });

    if (cambios && datos.length) sh.getRange(2, 1, datos.length, CAMPOS.length).setValues(datos);
    if (nuevas.length) sh.getRange(sh.getLastRow() + 1, 1, nuevas.length, CAMPOS.length).setValues(nuevas);
    return { ok: true, guardadas: filas.length };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Progreso del estudiante (para jugar desde otra computadora) ----------
   Devuelve solo QUÉ actividades ya respondió, nunca respuestas ni resultados. */
function progreso_(data) {
  const div = String(data.division || '').toUpperCase();
  if (!HOJAS[div]) return { ok: false, error: 'División inválida' };
  const prefijo = String(data.estudiante || '') + '|';
  if (prefijo.indexOf(div + '|') !== 0) return { ok: false, error: 'Datos inválidos' };
  const sh = hoja_(div);
  const ultima = sh.getLastRow();
  if (ultima < 2) return { ok: true, respondidas: [] };
  const datos = sh.getRange(2, 1, ultima - 1, CAMPOS.length).getValues();
  const respondidas = datos
    .filter(f => String(f[0]).indexOf(prefijo) === 0 && f[C.estado] === 'Respondida')
    .map(f => String(f[0]).split('|').pop());
  return { ok: true, respondidas: respondidas };
}

/* ---------- Panel docente (protegido con clave guardada en el servidor) ---------- */
function panel_(data) {
  const guardada = PropertiesService.getScriptProperties().getProperty('CLAVE_DOCENTE');
  if (!guardada) return { ok: false, error: 'Falta configurar CLAVE_DOCENTE en las propiedades del script.' };
  if (String(data.clave || '') !== guardada) {
    Utilities.sleep(1200);
    return { ok: false, error: 'Clave incorrecta.' };
  }
  const divs = data.division === '4A' || data.division === '4B' ? [data.division] : Object.keys(HOJAS);
  const rows = [];
  divs.forEach(div => {
    const sh = hoja_(div);
    const ultima = sh.getLastRow();
    if (ultima < 2) return;
    sh.getRange(2, 1, ultima - 1, CAMPOS.length).getValues().forEach(f => {
      const o = {};
      CAMPOS.forEach((k, i) => {
        o[k] = f[i] instanceof Date ? Utilities.formatDate(f[i], ZONA, 'dd/MM/yyyy HH:mm') : f[i];
      });
      o.actId = String(o.key).split('|').pop();
      rows.push(o);
    });
  });
  return { ok: true, rows: rows };
}

/* ---------- Auxiliares ---------- */
function hoja_(div) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nombre = HOJAS[div];
  let sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS.map(c => c[1])])
      .setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff').setWrap(true);
    sh.setFrozenRows(1);
    sh.hideColumns(1);
    sh.setColumnWidths(2, COLUMNAS.length - 1, 150);
    sh.setColumnWidths(11, 2, 320);
  }
  // Si la planilla se creó con una versión anterior, actualiza los encabezados
  const enc = sh.getRange(1, 1, 1, COLUMNAS.length).getValues()[0];
  if (COLUMNAS.some((c, i) => enc[i] !== c[1])) {
    sh.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS.map(c => c[1])])
      .setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff').setWrap(true);
  }
  return sh;
}

function limpiar_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  let s = String(v).slice(0, 600);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // evita fórmulas inyectadas
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

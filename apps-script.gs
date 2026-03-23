// ============================================================
//  ENQUETE SPFC — Google Apps Script
//  Cole este código em: Extensions > Apps Script > Code.gs
//  Depois publique como Web App (Execute as: Me, Anyone)
// ============================================================

const SHEET_VOTOS  = 'Votos';
const SHEET_RESULTADO = 'Resultado';

const CANDIDATES = [
  { id: 'ceni',     name: 'Rogério Ceni' },
  { id: 'dorival',  name: 'Dorival Júnior' },
  { id: 'gallardo', name: 'Marcelo Gallardo' },
  { id: 'vojvoda',  name: 'Vojvoda' },
  { id: 'roger',    name: 'Roger Machado' },
];

// ── GET: retorna contagem de votos ──
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'results') {
    return ContentService
      .createTextOutput(JSON.stringify(getResults()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── POST: registra voto ──
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'vote') {
      registerVote(data);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Salva voto na aba "Votos" ──
function registerVote(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_VOTOS);

  // Cria aba e cabeçalho se não existir
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_VOTOS);
    sheet.appendRow(['Timestamp', 'Nome', 'Email', 'CPF', 'Nascimento', 'Candidato ID', 'Candidato Nome']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.nome,
    data.email,
    data.cpf,
    data.nasc,
    data.candidateId,
    data.candidateName
  ]);
}

// ── Lê contagem de votos por candidato ──
function getResults() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_VOTOS);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { votes: {}, total: 0 };
  }

  const rows  = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  const counts = {};

  rows.forEach(row => {
    const id   = row[5]; // Candidato ID
    const name = row[6]; // Candidato Nome
    if (!id) return;
    if (!counts[id]) counts[id] = { name, count: 0 };
    counts[id].count++;
  });

  const total = Object.values(counts).reduce((a, c) => a + c.count, 0);
  return { votes: counts, total };
}

/**
 * NotaOTO LITE - Google Apps Script (Code.gs)
 *
 * Serverless API Gateway untuk verifikasi kode akses premium.
 *
 * Cara deploy:
 * 1. Buka script.google.com
 * 2. Buat project baru, tempel kode ini
 * 3. Simpan dan deploy -> New deployment -> Web app
 * 4. Set "Execute as: Me", "Who has access: Anyone"
 * 5. Copy URL web app dan paste di app.js (GAS_URL)
 *
 * Struktur Google Sheets:
 * - Sheet name: "Akses"
 * - Kolom A: Kode Akses (NK-XXXXXX)
 * - Kolom B: Nama UMKM
 * - Kolom C: Tanggal Expired (YYYY-MM-DD)
 * - Kolom D: Status (AKTIF / MATI)
 * - Kolom E: Nomor WA (opsional)
 */

// Konfigurasi Sheet
const SHEET_NAME = 'Akses';

/**
 * doGet - Handle GET request (JSONP)
 *
 * Query params:
 *   ?action=verify&code=NK-XXXXXX&callback=gas_cb_1234
 *
 * Response (JSONP):
 *   gas_cb_1234({...})
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action || '';
    const callback = params.callback || '';

    if (action === 'verify') {
      const result = handleVerify({ code: params.code || '' });
      const jsonStr = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + jsonStr + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService
        .createTextOutput(jsonStr)
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: test ping
    const msg = JSON.stringify({ status: 'ok', message: 'NotaOTO LITE API is running' });
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + msg + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
      .createTextOutput(msg)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return sendResponse(false, null, 'Terjadi kesalahan: ' + error.message);
  }
}

/**
 * doPost - Handle POST request
 *
 * Accepts both JSON and form-urlencoded bodies:
 *   { action: "verify", code: "NK-XXXXXX" }
 *   OR
 *   action=verify&code=NK-XXXXXX
 */
function doPost(e) {
  try {
    var params = {};

    // Coba parse sebagai JSON dulu
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Fallback: parse sebagai form-urlencoded
        var parts = e.postData.contents.split('&');
        for (var i = 0; i < parts.length; i++) {
          var kv = parts[i].split('=');
          if (kv.length === 2) {
            params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
          }
        }
      }
    }

    // Juga merge parameter dari query string (jika ada)
    if (e.parameter) {
      for (var key in e.parameter) {
        if (e.parameter.hasOwnProperty(key) && !params[key]) {
          params[key] = e.parameter[key];
        }
      }
    }

    const action = params.action || '';

    if (action === 'verify') {
      return handleVerify(params);
    }

    return sendResponse(false, null, 'Aksi tidak dikenal');

  } catch (error) {
    return sendResponse(false, null, 'Terjadi kesalahan: ' + error.message);
  }
}

/**
 * handleVerify - Memverifikasi kode akses
 */
function handleVerify(params) {
  const code = (params.code || '').toString().trim().toUpperCase();

  if (!code) {
    return sendResponse(false, null, 'Kode akses tidak boleh kosong');
  }

  // Format minimal: NK-XXXXXX (9+ karakter)
  if (code.length < 9) {
    return sendResponse(false, null, 'Format kode akses tidak valid');
  }

  // Buka sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    return sendResponse(false, null, 'Database tidak ditemukan');
  }

  const data = sheet.getDataRange().getValues();

  // Cari kode di kolom A (index 0)
  for (let i = 1; i < data.length; i++) { // Skip header row
    const row = data[i];
    const storedCode = (row[0] || '').toString().trim().toUpperCase();

    if (storedCode === code) {
      const name = row[1] || '';
      const expires = row[2] ? formatDate(row[2]) : '';
      const status = (row[3] || '').toString().trim().toUpperCase();
      const wa = row[4] || '';

      // Cek status
      if (status !== 'AKTIF') {
        return sendResponse(false, null, 'Kode akses sudah dinonaktifkan');
      }

      // Cek expired
      if (expires && isExpired(expires)) {
        // Auto-update status menjadi MATI
        sheet.getRange(i + 1, 4).setValue('MATI');
        return sendResponse(false, null, 'Masa berlaku kode akses sudah habis');
      }

      return sendResponse(true, { name, expires, status, wa, code }, null);
    }
  }

  return sendResponse(false, null, 'Kode akses tidak ditemukan');
}

/**
 * isExpired - Cek apakah tanggal sudah lewat
 */
function isExpired(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  return expiry < today;
}

/**
 * formatDate - Format date ke YYYY-MM-DD
 */
function formatDate(dateValue) {
  if (typeof dateValue === 'string') return dateValue;
  if (dateValue instanceof Date) {
    const y = dateValue.getFullYear();
    const m = String(dateValue.getMonth() + 1).padStart(2, '0');
    const d = String(dateValue.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(dateValue);
}

/**
 * sendResponse - Helper untuk response JSON
 */
function sendResponse(valid, data, message) {
  const response = {
    valid: valid,
  };

  if (valid && data) {
    response.name = data.name;
    response.expires = data.expires;
    response.status = data.status;
    response.wa = data.wa;
    response.code = data.code;
  } else {
    response.message = message || 'Kode akses tidak valid';
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

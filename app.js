/**
 * ============================================
 * NotaOTO LITE - App JavaScript
 * Single Page Application | Vanilla JS
 * ============================================
 */

// ============================================
// KONFIGURASI
// ============================================
const CONFIG = {
  // Ganti URL ini dengan URL Web App Google Apps Script setelah deploy
  // Format: https://script.google.com/macros/s/xxx/exec
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzBz7kIl90kKxoA3c5UCuc0yp9ttd9F31cAofk7hrXlLPij_IAODc0BcoGsrax6hyBz/exec',

  // Demo mode: jika true, verifikasi dilakukan secara lokal (tanpa backend)
  // Set ke false dan isi GAS_URL untuk mode production
  DEMO_MODE: false,

  // Akun & kode demo untuk testing (hanya berlaku jika DEMO_MODE = true)
  // Keduanya harus diisi bersamaan supaya lolos verifikasi demo.
  DEMO_ACCOUNT: 'AK-DEMO01',
  DEMO_CODE: 'NK-DEMO01',

  // Waktu expired demo (7 hari dari sekarang)
  get DEMO_EXPIRY() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  },

  // Prefix kode akses
  CODE_PREFIX: 'NK-',

  // Warna tema yang tersedia (disamakan dengan swatch di index.html)
  THEME_COLORS: [
    '#0e7a54', // Emerald (default)
    '#2563eb', // Royal Blue
    '#7c3aed', // Violet
    '#dc2626', // Ruby Red
    '#b45309', // Amber Gold
    '#e11d48', // Rose Pink
    '#0d9488', // Teal
    '#4338ca', // Indigo Navy
    '#ea580c', // Burnt Orange
    '#78350f', // Chocolate Brown
    '#d97706', // Tropical Sunrise (gabungan Merah-Kuning-Hijau)
    '#7f1d1d', // Crimson Noir (gabungan Merah-Hitam)
    '#c026d3', // Sunset Berry (gabungan Oranye-Pink-Ungu)
    '#0e6ba8', // Ocean Depth (gabungan Navy-Teal-Emerald)
    '#86198f', // Royal Velvet (gabungan Ungu Tua-Magenta)
    '#9a3412', // Golden Ember (gabungan Coklat-Emas-Oranye)
    '#3f6212', // Emerald Gold (gabungan Hijau Tua-Emas)
    '#9d174d'  // Rose Gold (gabungan Merah Marun-Emas)
  ],

  // Warna "gabungan" (gradient) — key = warna representatif di THEME_COLORS,
  // value = gradient CSS yang dipakai di header/teks toko saat warna ini aktif.
  THEME_GRADIENTS: {
    '#d97706': 'linear-gradient(135deg, #dc2626 0%, #f59e0b 55%, #16a34a 100%)',
    '#7f1d1d': 'linear-gradient(135deg, #0f0f0f 0%, #7f1d1d 55%, #b91c1c 100%)',
    '#c026d3': 'linear-gradient(135deg, #f97316 0%, #db2777 55%, #7c3aed 100%)',
    '#0e6ba8': 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 55%, #059669 100%)',
    '#86198f': 'linear-gradient(135deg, #4c1d95 0%, #86198f 50%, #be185d 100%)',
    '#9a3412': 'linear-gradient(135deg, #7c2d12 0%, #b45309 55%, #d97706 100%)',
    '#3f6212': 'linear-gradient(135deg, #14532d 0%, #ca8a04 100%)',
    '#9d174d': 'linear-gradient(135deg, #9f1239 0%, #d4af37 100%)'
  },

  // Layouts
  LAYOUTS: {
    MINIMALIS: 'minimalis',
    STRUK: 'struk',
    OLSHOP: 'olshop',
    ELEGAN: 'elegan',
    KLASIK: 'klasik',
    KARTU: 'kartu',
    BOHO: 'boho',
    KORPORAT: 'korporat'
  },

  // Default profile
  DEFAULT_PROFILE: {
    storeName: 'Toko Saya',
    storeWA: '',
    qrisData: null // base64 image data
  },

  // Storage keys
  STORAGE_KEYS: {
    ACCOUNT: 'notaoto_account',
    CODE: 'notaoto_code',
    EXPIRES: 'notaoto_expires',
    PROFILE: 'notaoto_profile',
    THEME: 'notaoto_theme',
    LAYOUT: 'notaoto_layout',
    ITEMS: 'notaoto_items',
    CUSTOMER: 'notaoto_customer'
  }
};

// ============================================
// STATE APLIKASI
// ============================================
const state = {
  isPremium: false,
  account: '',
  code: '',
  expires: '',
  profile: { ...CONFIG.DEFAULT_PROFILE },
  themeColor: CONFIG.THEME_COLORS[0],
  layout: CONFIG.LAYOUTS.MINIMALIS,
  customer: '',
  items: [],
  isGenerating: false
};

// ============================================
// DOM REFERENCES
// ============================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const dom = {};

function cacheDOM() {
  // Pages
  dom.landingPage = $('#landing-page');
  dom.dashboardPage = $('#dashboard-page');

  // Landing
  dom.activationForm = $('#activation-form');
  dom.accountInput = $('#account-input');
  dom.codeInput = $('#code-input');
  dom.verifyBtn = $('#verify-btn');
  dom.verifySpinner = $('#verify-spinner');
  dom.verifyText = $('#verify-text');
  dom.activationError = $('#activation-error');
  dom.buyBtn = $('#buy-btn');

  // Landing - Status / Go to Dashboard
  dom.activationStatus = $('#activation-status');
  dom.activationStatusName = $('#activation-status-name');
  dom.activationStatusExpiry = $('#activation-status-expiry');
  dom.goToDashboardBtn = $('#go-to-dashboard-btn');
  dom.goToDashboardSpinner = $('#go-to-dashboard-spinner');
  dom.goToDashboardText = $('#go-to-dashboard-text');
  dom.expiredInfo = $('#expired-info');
  dom.reactivateBtn = $('#reactivate-btn');

  // Dashboard
  dom.storeName = $('#store-name');
  dom.storeWA = $('#store-wa');
  dom.customerName = $('#customer-name');
  dom.itemsContainer = $('#items-container');
  dom.addItemBtn = $('#add-item-btn');
  dom.emptyItems = $('#empty-items');
  dom.totalItems = $('#total-items');
  dom.layoutOptions = $$('.layout-option');
  dom.colorCircles = $$('.color-circle');
  dom.qrisUpload = $('#qris-upload');
  dom.qrisPreview = $('#qris-preview');
  dom.qrisPlaceholder = $('#qris-placeholder');
  dom.qrisDelete = $('#qris-delete');
  dom.invoicePreview = $('#invoice-preview');
  dom.generateBtn = $('#generate-btn');
  dom.generateSpinner = $('#generate-spinner');
  dom.generateText = $('#generate-text');
  dom.storeNameDisplay = $('#store-name-display');
  dom.expiryBadge = $('#expiry-badge');
  dom.expiryDate = $('#expiry-date');
  dom.logoutBtn = $('#logout-btn');

  // Dashboard - WA Preview
  dom.waPreview = $('#wa-preview');
  dom.waPreviewPhone = $('#wa-preview-phone');
  dom.waPreviewMessage = $('#wa-preview-message');

  // Toast
  dom.toastContainer = $('#toast-container');

  // Modal
  dom.modalOverlay = $('#modal-overlay');
  dom.modalTitle = $('#modal-title');
  dom.modalMessage = $('#modal-message');
  dom.modalConfirm = $('#modal-confirm');
  dom.modalCancel = $('#modal-cancel');
}

// ============================================
// LUCIDE ICONS HELPER
// ============================================
function reIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    info: 'info'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconName = icons[type] || 'info';
  toast.innerHTML = `
    <span class="toast-icon"><i data-lucide="${iconName}" class="lucide" style="width:18px;height:18px"></i></span>
    <span>${message}</span>
  `;
  reIcons();

  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================
// MODAL
// ============================================
function showModal(title, message, confirmText = 'OK', cancelText = null) {
  dom.modalTitle.textContent = title;
  dom.modalMessage.textContent = message;
  dom.modalConfirm.textContent = confirmText;

  if (cancelText) {
    dom.modalCancel.style.display = 'inline-flex';
    dom.modalCancel.textContent = cancelText;
  } else {
    dom.modalCancel.style.display = 'none';
  }

  dom.modalOverlay.classList.add('active');

  return new Promise((resolve) => {
    dom.modalConfirm.onclick = () => {
      dom.modalOverlay.classList.remove('active');
      resolve(true);
    };
    dom.modalCancel.onclick = () => {
      dom.modalOverlay.classList.remove('active');
      resolve(false);
    };
    dom.modalOverlay.onclick = (e) => {
      if (e.target === dom.modalOverlay) {
        dom.modalOverlay.classList.remove('active');
        resolve(false);
      }
    };
  });
}

// ============================================
// FORMAT RUPIAH
// ============================================
function formatRupiah(num) {
  const n = parseFloat(num) || 0;
  return 'Rp ' + n.toLocaleString('id-ID');
}

function parseRupiah(str) {
  return parseInt((str || '0').replace(/[^\d]/g, '')) || 0;
}

// ============================================
// STORAGE (localStorage)
// ============================================
function saveToStorage() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.ACCOUNT, state.account);
    localStorage.setItem(CONFIG.STORAGE_KEYS.CODE, state.code);
    localStorage.setItem(CONFIG.STORAGE_KEYS.EXPIRES, state.expires);
    localStorage.setItem(CONFIG.STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, state.themeColor);
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAYOUT, state.layout);
    localStorage.setItem(CONFIG.STORAGE_KEYS.ITEMS, JSON.stringify(state.items));
    localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOMER, state.customer);
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const account = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCOUNT);
    const code = localStorage.getItem(CONFIG.STORAGE_KEYS.CODE);
    const expires = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPIRES);
    const profile = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.PROFILE) || 'null');
    const theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    const layout = localStorage.getItem(CONFIG.STORAGE_KEYS.LAYOUT);
    const items = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.ITEMS) || '[]');
    const customer = localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOMER) || '';

    if (account) state.account = account;
    if (code) state.code = code;
    if (expires) state.expires = expires;
    if (profile) state.profile = { ...CONFIG.DEFAULT_PROFILE, ...profile };
    if (theme && CONFIG.THEME_COLORS.includes(theme)) state.themeColor = theme;
    if (layout && Object.values(CONFIG.LAYOUTS).includes(layout)) state.layout = layout;
    if (items.length > 0) state.items = items;
    if (customer) state.customer = customer;

    // Cek expired — kalau expired jangan hapus data, biar pengguna bisa lihat status
    if (expires && isExpired(expires)) {
      state.isPremium = false;
      return 'expired';
    }

    return true;
  } catch (e) {
    console.warn('Gagal load dari localStorage:', e);
    return false;
  }
}

function isExpired(dateStr) {
  if (!dateStr) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  return expiry < today;
}

function clearSession() {
  state.isPremium = false;
  state.account = '';
  state.code = '';
  state.expires = '';
  Object.keys(CONFIG.STORAGE_KEYS).forEach(k => {
    localStorage.removeItem(CONFIG.STORAGE_KEYS[k]);
  });
  showActivationForm();
}

// ============================================
// ACTIVATION UI TOGGLE (Form ↔ Status)
// ============================================
function showActivationForm() {
  dom.activationForm.parentElement.style.display = 'block';
  dom.activationStatus.style.display = 'none';
}

function showActivationStatus() {
  dom.activationForm.parentElement.style.display = 'none';
  dom.activationStatus.style.display = 'block';

  if (state.code && state.expires) {
    dom.activationStatusName.textContent = state.profile.storeName || 'Toko Saya';
    dom.activationStatusExpiry.textContent = formatDateDisplay(state.expires);

    if (isExpired(state.expires)) {
      dom.expiredInfo.style.display = 'block';
      dom.goToDashboardBtn.style.display = 'none';
    } else {
      dom.expiredInfo.style.display = 'none';
      dom.goToDashboardBtn.style.display = 'flex';
    }
  }
}

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(pageId) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ============================================
// VERIFIKASI KODE AKSES
// ============================================
// Akun & kode SELALU diverifikasi berpasangan. Akun adalah kunci utama —
// kode tanpa akun yang benar (atau sebaliknya) tidak akan pernah dianggap valid.
async function verifyCode(account, code) {
  if (CONFIG.DEMO_MODE) {
    return verifyCodeDemo(account, code);
  }
  return verifyCodeGAS(account, code);
}

function verifyCodeDemo(account, code) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedAccount = (account || '').toUpperCase().trim();
      const normalizedCode = (code || '').toUpperCase().trim();

      if (normalizedAccount === CONFIG.DEMO_ACCOUNT && normalizedCode === CONFIG.DEMO_CODE) {
        resolve({
          valid: true,
          name: 'Toko Demo',
          expires: CONFIG.DEMO_EXPIRY,
          status: 'AKTIF',
          wa: '08123456789',
          account: normalizedAccount,
          code: normalizedCode
        });
      } else {
        resolve({
          valid: false,
          message: 'Akun/kode akses tidak valid. Coba: AK-DEMO01 / NK-DEMO01'
        });
      }
    }, 1200); // Simulasi delay network
  });
}

async function verifyCodeGAS(account, code) {
  if (!CONFIG.GAS_URL) {
    return { valid: false, message: 'URL Google Apps Script belum dikonfigurasi.' };
  }

  try {
    // Kirim JSON sebagai text/plain agar tidak kena CORS preflight
    // GAS Web App hanya support simple content types
    const response = await fetch(CONFIG.GAS_URL, {
      redirect: 'follow',
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        account: (account || '').toUpperCase().trim(),
        code: (code || '').toUpperCase().trim(),
        action: 'verify'
      })
    });

    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('GAS Error:', error);
    // networkError: true menandakan ini gagal KONEKSI (offline/server tak
    // terjangkau), beda dari kode yang memang invalid/expired secara sah
    // dari sisi server. Dipakai handleGenerate() untuk membedakan perlakuan.
    return { valid: false, networkError: true, message: 'Gagal terhubung ke server verifikasi. Periksa koneksi internet Anda.' };
  }
}

// ============================================
// ITEMS MANAGEMENT
// ============================================
function addItem(name = '', qty = 1, price = 0) {
  state.items.push({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    name: name || '',
    qty: Math.max(1, parseInt(qty) || 1),
    price: Math.max(0, parseInt(price) || 0)
  });
  renderItems();
  updatePreview();
  saveToStorage();
}

function removeItem(id) {
  state.items = state.items.filter(item => item.id !== id);
  renderItems();
  updatePreview();
  saveToStorage();
}

function updateItem(id, field, value) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  if (field === 'name') {
    item.name = value;
  } else if (field === 'qty') {
    item.qty = Math.max(1, parseInt(value) || 1);
  } else if (field === 'price') {
    item.price = Math.max(0, parseRupiah(value));
  }

  // UPDATE TANPA RE-RENDER: hanya update total + preview
  // renderItems() gak dipanggil karena akan merusak fokus input
  dom.totalItems.textContent = formatRupiah(calculateTotal());
  updatePreview();
  saveToStorage();
}

function calculateTotal() {
  return state.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
}

function renderItems() {
  dom.itemsContainer.innerHTML = '';

  if (state.items.length === 0) {
    dom.emptyItems.style.display = 'block';
    dom.totalItems.textContent = 'Rp 0';
    return;
  }

  dom.emptyItems.style.display = 'none';

  let index = 0;
  state.items.forEach(item => {
    index++;
    const div = document.createElement('div');
    div.className = 'item-entry';
    div.innerHTML = `
      <div class="item-row">
        <div>
          <label class="form-label">Nama Barang #${index}</label>
          <input type="text" class="form-input item-name" value="${escapeHtml(item.name)}" placeholder="Nama barang..." data-id="${item.id}">
        </div>
        <div>
          <label class="form-label">Qty</label>
          <input type="number" class="form-input item-qty" value="${item.qty}" min="1" data-id="${item.id}">
        </div>
        <div>
          <label class="form-label">Harga</label>
          <input type="text" class="form-input item-price" value="${item.price ? formatRupiah(item.price) : ''}" placeholder="Rp 0" data-id="${item.id}">
        </div>
        <div style="display:flex;align-items:end;padding-bottom:2px">
          <button class="btn-danger" data-id="${item.id}" title="Hapus barang"><i data-lucide="trash-2" class="lucide" style="width:14px;height:14px;pointer-events:none"></i></button>
        </div>
      </div>
    `;

    // Event listeners
    const nameInput = div.querySelector('.item-name');
    const qtyInput = div.querySelector('.item-qty');
    const priceInput = div.querySelector('.item-price');
    const deleteBtn = div.querySelector('.btn-danger');

    nameInput.addEventListener('input', (e) => updateItem(item.id, 'name', e.target.value));
    qtyInput.addEventListener('change', (e) => updateItem(item.id, 'qty', e.target.value));
    priceInput.addEventListener('input', (e) => {
      // Format rupiah saat mengetik
      const raw = e.target.value.replace(/[^\d]/g, '');
      if (raw) {
        e.target.value = formatRupiah(raw);
      }
      updateItem(item.id, 'price', raw || 0);
    });

    // Auto-update preview lebih responsif
    nameInput.addEventListener('input', updatePreview);
    qtyInput.addEventListener('input', updatePreview);
    priceInput.addEventListener('input', updatePreview);

    deleteBtn.addEventListener('click', () => removeItem(item.id));

    dom.itemsContainer.appendChild(div);
  });

  // Re-init Lucide icons for the new items
  reIcons();

  // Update total
  dom.totalItems.textContent = formatRupiah(calculateTotal());
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// INVOICE PREVIEW
// ============================================
function updatePreview() {
  // Tampilkan lagi live preview jika sebelumnya di-collapse oleh hasil generate
  document.querySelector('.preview-section').classList.remove('preview-collapsed');

  const storeName = state.profile.storeName || 'Toko Saya';
  const storeWA = state.profile.storeWA || '';
  const customer = state.customer || 'Pelanggan';
  const color = state.themeColor;
  const layout = state.layout;

  // Varian warna gelap & terang dihitung otomatis dari warna tema yang dipilih,
  // supaya semua style (termasuk gradient di Olshop/Kartu) selalu match dengan
  // warna yang dipilih user — bukan warna hijau default yang di-hardcode.
  const colorDark = adjustColor(color, -45);
  const colorLight = tintColor(color, 0.88);

  // Animasi transisi HANYA dijalankan kalau layout atau warna benar-benar
  // berubah dari render terakhir — bukan setiap kali user mengetik nama
  // barang/harga/dll. Ini juga mencegah hasil "Generate" (screenshot PNG)
  // tertangkap di tengah animasi (yang menyebabkan hasil buram/pucat).
  const styleSignature = layout + '|' + color;
  const isStyleChange = state._lastStyleSignature !== undefined && state._lastStyleSignature !== styleSignature;
  const isFirstRender = state._lastStyleSignature === undefined;
  state._lastStyleSignature = styleSignature;
  const animClass = (isStyleChange || isFirstRender) ? ' invoice-style-change' : '';

  let html = '';

  // Header
  html += `<div class="invoice-base layout-${layout}${animClass}" style="--primary:${color};--primary-dark:${colorDark};--primary-light:${colorLight}">`;

  switch (layout) {
    case CONFIG.LAYOUTS.MINIMALIS:
      html += renderMinimalis(storeName, storeWA, customer, color);
      break;
    case CONFIG.LAYOUTS.STRUK:
      html += renderStruk(storeName, storeWA, customer, color);
      break;
    case CONFIG.LAYOUTS.OLSHOP:
      html += renderOlshop(storeName, storeWA, customer, color);
      break;
    case CONFIG.LAYOUTS.ELEGAN:
      html += renderElegan(storeName, storeWA, customer, color);
      break;
    case CONFIG.LAYOUTS.KLASIK:
      html += renderKlasik(storeName, storeWA, customer, color);
      break;
    case CONFIG.LAYOUTS.KARTU:
      html += renderKartu(storeName, storeWA, customer, color);
      break;
    case CONFIG.LAYOUTS.BOHO:
      html += renderBoho(storeName, storeWA, customer, color);
      break;
    case CONFIG.LAYOUTS.KORPORAT:
      html += renderKorporat(storeName, storeWA, customer, color);
      break;
    default:
      html += renderMinimalis(storeName, storeWA, customer, color);
  }

  html += `</div>`;

  dom.invoicePreview.innerHTML = html;
  reIcons();
}

/**
 * Kalau warna tema yang dipilih adalah warna "gabungan" (gradient), kembalikan
 * style inline yang mem-blend gradient tsb ke teks (background-clip:text).
 * Kalau bukan gradient, kembalikan null supaya pemanggil pakai warna solid biasa.
 */
function getThemeGradient(color) {
  return CONFIG.THEME_GRADIENTS[color] || null;
}

function gradientTextStyle(gradient) {
  return `background:${gradient};-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;`;
}

function renderMinimalis(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();
  const gradient = getThemeGradient(color);
  const storeStyle = gradient ? gradientTextStyle(gradient) : `color:${color}`;

  return `
    <div style="border-left:3px solid ${color};padding-left:12px">
      <div class="inv-store" style="${storeStyle}">${escapeHtml(store)}</div>
      ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
    </div>
    <div class="inv-divider" style="background:${color}20"></div>
    <div class="inv-customer">
      <strong>Kepada Yth,</strong><br>
      ${escapeHtml(customer)}
    </div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      Terima kasih telah berbelanja <i data-lucide="heart" class="lucide" style="width:12px;height:12px;color:var(--rose-500);vertical-align:-0.1em"></i>
    </div>
  `;
}

function renderStruk(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();
  const gradient = getThemeGradient(color);
  const storeStyle = gradient ? gradientTextStyle(gradient) : `color:${color}`;

  return `
    <div class="inv-store" style="${storeStyle}">${escapeHtml(store)}</div>
    ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
    <div class="inv-divider"></div>
    <div class="inv-customer">
      ${escapeHtml(customer)}
    </div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      ~~ Terima Kasih ~~<br>
      Barang yang sudah dibeli<br>
      tidak dapat dikembalikan
    </div>
  `;
}

function renderOlshop(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();
  const gradient = getThemeGradient(color);
  const headerBg = gradient || `linear-gradient(135deg,${color},${adjustColor(color, -20)})`;

  return `
    <div class="inv-header-decor" style="background:${headerBg}">
      <div class="inv-store">${escapeHtml(store)}</div>
      ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
    </div>
    <div class="inv-customer">
      <i data-lucide="user" class="lucide" style="width:14px;height:14px;vertical-align:-0.15em;color:${color}"></i> <strong>Pelanggan:</strong> ${escapeHtml(customer)}
    </div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      <i data-lucide="sparkles" class="lucide" style="width:14px;height:14px;vertical-align:-0.15em;color:${color}"></i> Semoga harimu menyenangkan <i data-lucide="sparkles" class="lucide" style="width:14px;height:14px;vertical-align:-0.15em;color:${color}"></i>
    </div>
  `;
}

function renderElegan(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();
  const gradient = getThemeGradient(color);
  const storeStyle = gradient ? gradientTextStyle(gradient) : `color:${color}`;

  return `
    <div class="inv-frame-top"></div>
    <div class="inv-store" style="${storeStyle}">${escapeHtml(store)}</div>
    ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
    <div class="inv-divider"></div>
    <div class="inv-customer">Kepada Yth, <strong>${escapeHtml(customer)}</strong></div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      <i data-lucide="gem" class="lucide" style="width:13px;height:13px;vertical-align:-0.15em"></i> Terima kasih atas kepercayaan Anda
    </div>
    <div class="inv-frame-bottom"></div>
  `;
}

function renderKlasik(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();

  return `
    <div class="inv-stamp" style="border-color:${color};color:${color}">LUNAS</div>
    <div class="inv-store">${escapeHtml(store)}</div>
    ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
    <div class="inv-divider"></div>
    <div class="inv-customer">
      <span>Kepada: <strong>${escapeHtml(customer)}</strong></span>
      <span>${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
    </div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      Barang yang sudah dibeli tidak dapat dikembalikan
    </div>
  `;
}

function renderKartu(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();
  const gradient = getThemeGradient(color);
  const topbarBg = gradient || color;

  return `
    <div class="inv-topbar" style="background:${topbarBg}"></div>
    <div class="inv-store">${escapeHtml(store)}</div>
    ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
    <div class="inv-customer" style="margin-top:12px"><i data-lucide="user" class="lucide" style="width:13px;height:13px;vertical-align:-0.15em;color:${color}"></i> ${escapeHtml(customer)}</div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      Makasih udah belanja disini! <i data-lucide="heart" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i>
    </div>
  `;
}

function renderBoho(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();
  const gradient = getThemeGradient(color);
  const storeAttr = gradient ? ` style="${gradientTextStyle(gradient)}"` : '';

  return `
    <div class="inv-store"${storeAttr}>${escapeHtml(store)}</div>
    ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
    <div class="inv-divider"></div>
    <div class="inv-customer"><i data-lucide="flower-2" class="lucide" style="width:13px;height:13px;vertical-align:-0.15em;color:${color}"></i> ${escapeHtml(customer)}</div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      <i data-lucide="sparkles" class="lucide" style="width:13px;height:13px;vertical-align:-0.15em"></i> Semoga harimu menyenangkan <i data-lucide="sparkles" class="lucide" style="width:13px;height:13px;vertical-align:-0.15em"></i>
    </div>
  `;
}

function renderKorporat(store, wa, customer, color) {
  const itemsHtml = renderInvoiceItems(color);
  const qrisHtml = renderQRISPreview();
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNo = 'INV-' + Date.now().toString().slice(-6);

  return `
    <div class="inv-corp-header">
      <div>
        <div class="inv-store">${escapeHtml(store)}</div>
        ${wa ? `<div class="inv-wa"><i data-lucide="phone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> ${escapeHtml(wa)}</div>` : ''}
      </div>
      <div class="inv-corp-label">Invoice<br><span style="font-size:0.68rem;font-weight:600;color:var(--slate-400);letter-spacing:0.02em">${invoiceNo}</span></div>
    </div>
    <div class="inv-customer">
      <span>Kepada: <strong>${escapeHtml(customer)}</strong></span>
      <span>${today}</span>
    </div>
    ${itemsHtml}
    ${qrisHtml}
    <div class="inv-footer">
      Dokumen ini adalah bukti pembayaran yang sah
    </div>
  `;
}

function renderInvoiceItems(color) {
  if (state.items.length === 0) {
    return `<div class="no-items-message">— Belum ada item —</div>`;
  }

  let rows = '';
  let index = 0;
  state.items.forEach(item => {
    if (!item.name) return;
    index++;
    rows += `
      <tr>
        <td>${index}. ${escapeHtml(item.name)}</td>
        <td>${item.qty}x</td>
        <td>${formatRupiah(item.price)}</td>
        <td>${formatRupiah(item.qty * item.price)}</td>
      </tr>
    `;
  });

  // Filter items that have no name (empty rows) from the total
  const validItems = state.items.filter(i => i.name);
  if (validItems.length === 0) {
    return `<div class="no-items-message">— Belum ada item —</div>`;
  }

  const gradient = getThemeGradient(color);
  // Layout "Kartu Modern" menaruh angka TOTAL di atas kotak ber-background
  // gradient warna tema sendiri (lihat .layout-kartu .inv-total di CSS).
  // Kalau angkanya ikut diwarnai warna tema juga, teks jadi menyatu dengan
  // background-nya (pudar/tidak kelihatan) — apalagi untuk warna gabungan
  // (gradient). Jadi khusus layout ini, angka TOTAL selalu putih agar kontras.
  const isKartuLayout = state.layout === CONFIG.LAYOUTS.KARTU;
  const totalStyle = isKartuLayout
    ? 'color:#ffffff'
    : (gradient ? gradientTextStyle(gradient) : `color:${color}`);

  return `
    <table class="inv-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Harga</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="inv-total" style="border-top-color:${color}">
      <span class="inv-total-label">Total</span>
      <span style="${totalStyle}">${formatRupiah(calculateTotal())}</span>
    </div>
  `;
}

function renderQRISPreview() {
  if (!state.profile.qrisData) return '';

  return `
    <div class="inv-qris-section">
      <img src="${state.profile.qrisData}" alt="QRIS Pembayaran" class="qris-img">
      <div class="qris-label"><i data-lucide="smartphone" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em"></i> Scan QRIS untuk Bayar</div>
    </div>
  `;
}

/**
 * Adjust color brightness (tambah/kurang tiap channel RGB)
 */
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

/**
 * Campur warna dengan putih untuk menghasilkan versi pastel/lembut —
 * dipakai untuk background lembut (mis. Boho Pastel, kotak total Elegan).
 * weight 0..1, makin besar makin dekat ke putih.
 */
function tintColor(hex, weight) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;
  const mix = (c) => Math.round(c + (255 - c) * weight);
  return `#${(1 << 24 | mix(r) << 16 | mix(g) << 8 | mix(b)).toString(16).slice(1)}`;
}

// ============================================
// QRIS UPLOAD
// ============================================
function handleQRISUpload(file) {
  if (!file) return;

  // Validasi tipe
  if (!file.type.startsWith('image/')) {
    showToast('File harus berupa gambar (PNG/JPG)', 'error');
    return;
  }

  // Validasi ukuran (max 500KB)
  if (file.size > 500 * 1024) {
    showToast('Ukuran gambar maksimal 500KB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    state.profile.qrisData = dataUrl;

    // Update preview
    dom.qrisPreview.src = dataUrl;
    dom.qrisPreview.style.display = 'block';
    dom.qrisPlaceholder.style.display = 'none';
    dom.qrisDelete.style.display = 'inline-block';

    updatePreview();
    saveToStorage();
    showToast('QRIS berhasil diupload!', 'success');
  };
  reader.onerror = () => {
    showToast('Gagal membaca file QRIS', 'error');
  };
  reader.readAsDataURL(file);
}

// ============================================
// GENERATE NOTA (GAMBAR PNG) & KIRIM WHATSAPP
// ============================================

/**
 * Generate invoice sebagai gambar PNG via html-to-image
 *
 * Kenapa ganti dari html2canvas? html2canvas menggambar ulang CSS dengan
 * rendering engine buatannya sendiri, yang dukungannya lemah untuk: SVG icon
 * Lucide, gradient, custom font (Fraunces/JetBrains Mono), border-dotted/dashed,
 * dan box-shadow — makanya hasil generate sering meleset jauh dari Live Preview
 * (icon jadi bentuk aneh, border berantakan, dll).
 *
 * html-to-image membungkus DOM asli ke dalam <foreignObject> SVG lalu meminta
 * BROWSER SENDIRI yang merender & merasterisasi ke <canvas>. Karena itu semua
 * CSS modern (termasuk gradient warna gabungan yang baru) tampil identik
 * dengan apa yang terlihat di Live Preview.
 */
async function generateInvoiceImage() {
  updatePreview();

  const previewEl = document.getElementById('invoice-preview');
  if (!previewEl) throw new Error('Preview element tidak ditemukan');

  if (typeof htmlToImage === 'undefined') {
    throw new Error('Library gambar belum siap dimuat, coba refresh halaman.');
  }

  // Pastikan semua font custom (Fraunces, JetBrains Mono, dll) sudah selesai
  // dimuat sebelum di-screenshot. Kalau tidak, hasil capture bisa menangkap
  // font fallback sesaat sebelum font asli siap → teks terlihat kabur/beda.
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* abaikan */ }
  }

  // Matikan sementara animasi elemen nota & tunggu 2 frame supaya browser
  // benar-benar selesai melukis (paint) sebelum di-capture. Ini mencegah
  // hasil capture menangkap kondisi transisi (opacity/transform belum 100%)
  // yang menyebabkan hasil PNG terlihat pucat/buram.
  const invoiceEl = previewEl.querySelector('.invoice-base');
  if (invoiceEl) {
    invoiceEl.style.animation = 'none';
    invoiceEl.classList.remove('invoice-style-change');
  }
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);

  const originalPadding = previewEl.style.padding;
  const originalBg = previewEl.style.background;
  previewEl.style.padding = '24px';
  previewEl.style.background = 'white';

  try {
    const canvas = await htmlToImage.toCanvas(previewEl, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: false
    });
    return canvas;
  } finally {
    previewEl.style.padding = originalPadding;
    previewEl.style.background = originalBg;
  }
}

/**
 * Handle tombol Generate — generate gambar, tampilkan, siap kirim
 */
async function handleGenerate() {
  if (state.isGenerating) return;

  // Validasi
  if (!state.profile.storeName || state.profile.storeName === 'Toko Saya') {
    const result = await showModal(
      'Nama Toko belum diisi',
      'Silakan isi nama toko Anda terlebih dahulu agar nota terlihat profesional.',
      'Isi Sekarang',
      'Nanti Saja'
    );
    if (result) {
      dom.storeName.focus();
      dom.storeName.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  if (state.items.length === 0 || !state.items.some(i => i.name)) {
    showToast('Tambahkan minimal 1 barang ke daftar belanja', 'error');
    return;
  }

  if (!state.customer) {
    showToast('Silakan isi nama pelanggan', 'error');
    return;
  }

  state.isGenerating = true;
  dom.generateSpinner.style.display = 'inline-block';
  dom.generateText.textContent = 'Memverifikasi akses...';
  dom.generateBtn.disabled = true;

  // Helper kecil biar tombol/spinner selalu balik normal, termasuk kalau
  // proses berhenti lebih awal di gate verifikasi online di bawah.
  const resetTombolGenerate = () => {
    state.isGenerating = false;
    dom.generateSpinner.style.display = 'none';
    dom.generateText.textContent = '📤 Generate & Kirim ke WhatsApp';
    dom.generateBtn.disabled = false;
  };

  // ============================================
  // GATE WAJIB ONLINE — hanya untuk aksi GENERATE NOTA
  // ============================================
  // User boleh tetap masuk dashboard & edit-edit ringan (nama toko, barang,
  // pelanggan, dll) walau lagi offline. TAPI begitu mau benar-benar
  // menghasilkan nota (aksi yang paling berharga), kode akses WAJIB
  // divalidasi ulang ke server. Ini nutup celah user yang sengaja aktivasi
  // dulu pas online, lalu diam-diam offline-kan device buat pakai kode
  // tanpa batas tanpa pernah dicek server lagi.
  try {
    const cekOnline = await verifyCode(state.account, state.code);

    if (!cekOnline || !cekOnline.valid) {
      if (cekOnline && cekOnline.networkError) {
        // Bukan invalid, tapi memang gagal konek — jangan logout, cukup
        // blokir aksi generate-nya saja. Editan lain tetap aman tersimpan.
        showToast('❌ Butuh koneksi internet untuk membuat nota. Sambungkan internet lalu coba lagi.', 'error');
      } else {
        // Server dengan tegas bilang kode ini sudah tidak sah (expired/dicabut).
        showToast(cekOnline?.message || 'Kode akses Anda sudah tidak valid.', 'error');
        state.isPremium = false;
        clearSession();
        // Reload paksa biar semua hack di console/source hilang total
        location.reload();
      }
      resetTombolGenerate();
      return;
    }

    // Valid — sinkronkan data terbaru dari server (jaga-jaga ada perubahan)
    if (cekOnline.expires) state.expires = cekOnline.expires;
    if (cekOnline.name) state.profile.storeName = cekOnline.name;
    saveToStorage();
  } catch (error) {
    console.warn('Gagal verifikasi online sebelum generate:', error);
    showToast('❌ Butuh koneksi internet untuk membuat nota. Sambungkan internet lalu coba lagi.', 'error');
    resetTombolGenerate();
    return;
  }

  dom.generateText.textContent = 'Membuat gambar...';

  try {
    updatePreview();
    const canvas = await generateInvoiceImage();
    const imageDataUrl = canvas.toDataURL('image/png');

    // Tampilkan hasil di bawah tombol generate
    dom.waPreview.innerHTML = `
      <div class="glass-card" style="overflow:hidden;margin-top:8px">
        <div style="padding:12px 16px;background:var(--slate-50);border-bottom:1px solid var(--slate-100);display:flex;align-items:center;justify-content:space-between">
          <span style="font-weight:600;font-size:0.85rem;color:var(--slate-700)"><i data-lucide="camera" class="lucide" style="width:16px;height:16px;vertical-align:-0.15em;"></i> Nota Siap</span>
          <span style="font-size:0.7rem;color:var(--slate-400)">${new Date().toLocaleTimeString('id-ID')}</span>
        </div>
        <div style="padding:16px">
          <div style="background:white;border-radius:8px;overflow:hidden;border:1px solid var(--slate-100);margin-bottom:16px;max-height:420px;overflow-y:auto">
            <img src="${imageDataUrl}" alt="Nota" style="width:100%;display:block">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button id="download-png-btn" class="btn-primary" style="flex:1;padding:14px 16px;font-size:0.9rem">
              <i data-lucide="image" class="lucide" style="width:16px;height:16px"></i> Download PNG
            </button>
            <button id="share-wa-btn" class="btn-primary" style="flex:1;padding:14px 16px;font-size:0.9rem;background:linear-gradient(135deg,#25D366,#128C7E);box-shadow:0 4px 15px rgba(37,211,102,0.3)">
              <i data-lucide="send" class="lucide" style="width:16px;height:16px"></i> Kirim ke WhatsApp
            </button>
          </div>
          <div style="font-size:0.72rem;color:var(--slate-400);text-align:center;margin-top:10px">
            <i data-lucide="lightbulb" class="lucide" style="width:12px;height:12px;vertical-align:-0.1em;color:#d97706"></i> Download PNG lalu kirim file ke pelanggan via WhatsApp
          </div>
        </div>
      </div>
    `;
    dom.waPreview.classList.add('show');
    reIcons();

    // Di mobile (1 kolom), sembunyikan live preview biar nggak menghalangi hasil generate
    document.querySelector('.preview-section').classList.add('preview-collapsed');

    // Scroll ke hasil generate
    setTimeout(() => {
      dom.waPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);

    window._notaPngData = imageDataUrl;

    document.getElementById('download-png-btn').addEventListener('click', () => downloadPNG(imageDataUrl));
    document.getElementById('share-wa-btn').addEventListener('click', () => shareToWA(imageDataUrl));

    showToast('✅ Nota siap! Download PNG atau kirim ke WhatsApp.', 'success');
  } catch (error) {
    console.error('Generate error:', error);
    showToast('Terjadi kesalahan: ' + error.message, 'error');
  } finally {
    state.isGenerating = false;
    dom.generateSpinner.style.display = 'none';
    dom.generateText.textContent = '📤 Generate & Kirim ke WhatsApp';
    dom.generateBtn.disabled = false;
  }
}

/**
 * Download PNG
 */
function downloadPNG(dataUrl) {
  const store = state.profile.storeName.replace(/[^a-zA-Z0-9]/g, '_') || 'Nota';
  const customer = state.customer.replace(/[^a-zA-Z0-9]/g, '_') || 'Pelanggan';
  const link = document.createElement('a');
  link.download = `Nota_${store}_${customer}.png`;
  link.href = dataUrl;
  link.click();
  showToast('✅ Gambar berhasil didownload!', 'success');
}

/**
 * Buka WhatsApp dengan caption
 */
async function shareToWA(imageDataUrl) {
  // Coba Web Share API (mobile — bisa share file langsung)
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], 'Nota.png', { type: 'image/png' });
      const shareData = { title: 'Nota Pembelian', text: `Nota dari ${state.profile.storeName}`, files: [file] };
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback: buka WA dengan teks
  let phone = (state.profile.storeWA || '').replace(/[^0-9]/g, '');
  if (!phone || phone.length < 10) phone = '628386806386';

  const message = `Halo ${state.customer},\n\nNota dari *${state.profile.storeName}*\nTotal: ${formatRupiah(calculateTotal())}\n\nTerima kasih\n\n--\nNotaOTO LITE`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  showToast('WhatsApp terbuka — kirim file PNG yang sudah didownload!', 'info');
}

// Helper hex to RGB
function hexToR(h) { return parseInt(h.slice(1, 3), 16); }
function hexToG(h) { return parseInt(h.slice(3, 5), 16); }
function hexToB(h) { return parseInt(h.slice(5, 7), 16); }

// ============================================
// EVENT LISTENERS
// ============================================
function bindEvents() {
  // ---- Activation ----
  dom.activationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleActivation();
  });

  // ---- Dashboard Profile ----
  dom.storeName.addEventListener('input', (e) => {
    state.profile.storeName = e.target.value || 'Toko Saya';
    dom.storeNameDisplay.textContent = state.profile.storeName;
    updatePreview();
    saveToStorage();
  });

  dom.storeWA.addEventListener('input', (e) => {
    state.profile.storeWA = e.target.value;
    updatePreview();
    saveToStorage();
  });

  dom.customerName.addEventListener('input', (e) => {
    state.customer = e.target.value;
    updatePreview();
    saveToStorage();
  });

  // ---- Items ----
  dom.addItemBtn.addEventListener('click', () => {
    addItem('', 1, 0);
    // Scroll ke item terbaru
    setTimeout(() => {
      const lastItem = dom.itemsContainer.lastElementChild;
      if (lastItem) lastItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });

  // ---- Layout ----
  dom.layoutOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      dom.layoutOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.layout = opt.dataset.layout;
      updatePreview();
      saveToStorage();
    });
  });

  // ---- Color Picker ----
  dom.colorCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      dom.colorCircles.forEach(c => c.classList.remove('active'));
      circle.classList.add('active');
      state.themeColor = circle.dataset.color;
      updatePreview();
      saveToStorage();
    });
  });

  // ---- QRIS Upload & Delete ----
  dom.qrisUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleQRISUpload(e.target.files[0]);
    }
  });

  dom.qrisDelete.addEventListener('click', () => {
    // Reset file input
    dom.qrisUpload.value = '';
    // Clear state
    state.profile.qrisData = null;
    // Update UI
    dom.qrisPreview.src = '';
    dom.qrisPreview.style.display = 'none';
    dom.qrisPlaceholder.style.display = 'flex';
    dom.qrisDelete.style.display = 'none';
    // Re-render preview & save
    updatePreview();
    saveToStorage();
    showToast('QRIS berhasil dihapus', 'success');
  });

  // ---- Generate ----
  dom.generateBtn.addEventListener('click', handleGenerate);

  // ---- Logout ----
  dom.logoutBtn.addEventListener('click', async () => {
    const result = await showModal(
      'Logout?',
      'Anda akan keluar dari sesi premium. Data toko akan tetap tersimpan.',
      'Ya, Logout',
      'Batal'
    );
    if (result) {
      clearSession();
      // Reload paksa biar semua hack di console/source hilang total
      location.reload();
    }
  });

  // ---- Buy Button ----
  dom.buyBtn.addEventListener('click', () => {
    const waNumber = '628386806386';
    const message = encodeURIComponent('Halo, saya ingin membeli Kode Akses NotaOTO LITE');
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  });

  // ---- Enter key on account & code input ----
  dom.accountInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dom.verifyBtn.click();
    }
  });
  dom.codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dom.verifyBtn.click();
    }
  });

  // ---- Go to Dashboard button ----
  dom.goToDashboardBtn.addEventListener('click', () => {
    if (!isExpired(state.expires)) {
      enterDashboard();
    } else {
      showToast('Sesi premium sudah expired. Silakan aktifkan ulang.', 'error');
      showActivationForm();
    }
  });

  // ---- Reactivate button (when expired) ----
  dom.reactivateBtn.addEventListener('click', () => {
    showActivationForm();
  });
}

// ============================================
// HANDLE ACTIVATION
// ============================================
async function handleActivation() {
  const account = dom.accountInput.value.trim();
  const code = dom.codeInput.value.trim();

  if (!account || !code) {
    dom.activationError.textContent = 'Silakan masukkan akun dan kode akses premium';
    dom.activationError.style.display = 'block';
    return;
  }

  // UI Loading
  dom.verifyBtn.disabled = true;
  dom.verifySpinner.style.display = 'inline-block';
  dom.verifyText.textContent = 'Memverifikasi...';
  dom.activationError.style.display = 'none';

  try {
    const result = await verifyCode(account, code);

    if (result.valid) {
      // Sukses! Akun & kode cocok dan lolos verifikasi ketat server.
      state.isPremium = true;
      state.account = result.account || account.toUpperCase();
      state.code = result.code || code.toUpperCase();
      state.expires = result.expires;

      // Update profile if name from GAS
      if (result.name) {
        state.profile.storeName = result.name;
      }

      saveToStorage();
      showToast('✅ Selamat! Akun premium Anda aktif.', 'success');

      // Tampilkan status + tombol "Pergi ke Dashboard"
      showActivationStatus();
    } else {
      // Gagal
      dom.activationError.textContent = result.message || 'Akun/kode akses tidak valid';
      dom.activationError.style.display = 'block';
      showToast(result.message || 'Akun/kode akses tidak valid', 'error');
    }
  } catch (error) {
    console.error('Activation error:', error);
    dom.activationError.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
    dom.activationError.style.display = 'block';
    showToast('Gagal memverifikasi akun & kode', 'error');
  } finally {
    dom.verifyBtn.disabled = false;
    dom.verifySpinner.style.display = 'none';
    dom.verifyText.textContent = '🔓 Aktifasi Akun & Kode';
  }
}

// ============================================
// ENTER DASHBOARD
// ============================================
function enterDashboard() {
  // Load state
  dom.storeName.value = state.profile.storeName || '';
  dom.storeWA.value = state.profile.storeWA || '';
  dom.storeNameDisplay.textContent = state.profile.storeName || 'Toko Saya';
  dom.customerName.value = state.customer || '';

  // QRIS
  if (state.profile.qrisData) {
    dom.qrisPreview.src = state.profile.qrisData;
    dom.qrisPreview.style.display = 'block';
    dom.qrisPlaceholder.style.display = 'none';
    dom.qrisDelete.style.display = 'inline-block';
  }

  // Layout
  dom.layoutOptions.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.layout === state.layout);
  });

  // Theme color
  dom.colorCircles.forEach(circle => {
    circle.classList.toggle('active', circle.dataset.color === state.themeColor);
  });

  // Expiry badge
  dom.expiryDate.textContent = formatDateDisplay(state.expires);
  if (isExpired(state.expires)) {
    dom.expiryBadge.classList.add('expired');
    dom.expiryBadge.innerHTML = '<i data-lucide="alert-triangle" class="lucide" style="width:12px;height:12px;color:#fca5a5"></i> Telah Kedaluwarsa';
    reIcons();
  }

  // Items
  renderItems();

  // Preview
  updatePreview();

  // Re-init icons
  reIcons();

  // Navigate
  showPage('dashboard-page');
  showToast('Selamat datang di NotaOTO LITE!', 'success');
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

/**
 * Cek ulang status kode ke server (Google Apps Script) — tanpa database baru,
 * cuma manfaatkan ulang endpoint verifikasi yang sama seperti saat aktivasi.
 *
 * Kenapa ini penting: sebelumnya status premium/expired cuma dicek dari
 * tanggal yang tersimpan di localStorage, yang bisa diedit manual lewat
 * DevTools (F12) untuk memperpanjang masa aktif tanpa kode asli. Dengan cek
 * ulang ke server, data dari Google Sheet (lewat GAS) jadi SATU-SATUNYA
 * sumber kebenaran — kalau localStorage dioprek manual, begitu online lagi
 * data yang benar dari server akan menimpanya balik.
 *
 * Kalau server tidak terjangkau (offline), sesi lokal tetap dipercaya
 * sementara supaya toko tetap bisa jualan tanpa internet — begitu online
 * lagi, pengecekan berikutnya otomatis meluruskan status yang sebenarnya.
 */
async function revalidateSession() {
  if (!state.account || !state.code) return;

  try {
    const result = await verifyCode(state.account, state.code);

    if (result && result.valid) {
      // Server jadi sumber kebenaran: timpa expires lokal dengan punya server,
      // supaya localStorage yang diutak-atik manual otomatis diluruskan lagi.
      state.isPremium = true;
      if (result.expires) state.expires = result.expires;
      saveToStorage();
    } else {
      // Server bilang kode ini sudah tidak valid (expired/dicabut/salah) —
      // paksa keluar walau localStorage lokal masih bilang "aktif".
      state.isPremium = false;
      clearSession();
      showToast(result?.message || 'Masa aktif Anda telah berakhir. Silakan aktivasi ulang.', 'info');
      // Reload biar bersih total
      location.reload();
    }
  } catch (e) {
    // Kemungkinan besar offline — jangan kunci akses, cukup catat di console.
    console.warn('Revalidasi sesi gagal (mungkin sedang offline):', e);
  }
}

// ============================================
// ANTI-TAMPER WATCHDOG + INTEGRITY CHECK
// ============================================
// Melindungi dari 2 jenis hacking lewat F12:
//   1. Console: ubah state premium → restore tiap 2 detik
//   2. Sources: edit fungsi kritis (verifyCode, handleGenerate) → auto-reload
// Dua-duanya bikin hacking sia-sia karena cuma bertahan beberapa detik.
(function initWatchdog() {
  // --- Sidik jari fungsi kritis (untuk deteksi edit di tab Sources) ---
  // Simpan 200 karakter pertama dari source code asli fungsi-fungsi ini.
  // Kalau user edit di Sources tab, toString() otomatis beda → ketahuan.
  const _origVerify = (verifyCode || '').toString().substring(0, 200);
  const _origHandle = (handleGenerate || '').toString().substring(0, 200);

  function restorePremium() {
    const acc = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCOUNT) || '';
    const cod = localStorage.getItem(CONFIG.STORAGE_KEYS.CODE) || '';
    const exp = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPIRES) || '';
    const valid = !!(acc && cod && exp && !isExpired(exp));
    if (state.account !== acc || state.code !== cod || state.expires !== exp || state.isPremium !== valid) {
      state.account = acc;
      state.code = cod;
      state.expires = exp;
      state.isPremium = valid;
    }
  }

  function checkIntegrity() {
    // Cek apakah fungsi kritis masih asli (gak diedit lewat Sources/console)
    const vNow = (verifyCode || '').toString().substring(0, 200);
    const hNow = (handleGenerate || '').toString().substring(0, 200);
    return vNow === _origVerify && hNow === _origHandle;
  }

  setInterval(() => {
    if (document.visibilityState !== 'visible') return;

    // Cek integrity dulu — kalau fungsi diedit, reload paksa
    if (!checkIntegrity()) {
      location.reload();
      return;
    }

    // Restore state premium
    restorePremium();
  }, 2000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (!checkIntegrity()) location.reload();
      else restorePremium();
    }
  });

  // Proteksi tambahan: disable context menu di console (bikin repot user iseng)
  // Hanya jalan di landing page, bukan dashboard
  document.addEventListener('contextmenu', (e) => {
    // Biarkan context menu normal — terlalu agresif kalau diblokir total
  });
})();

// ============================================
// INITIALIZATION
// ============================================
function init() {
  cacheDOM();

  // Load jsPDF dari CDN jika belum ada
  if (typeof jspdf === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => console.log('jsPDF loaded');
    script.onerror = () => console.warn('jsPDF gagal dimuat');
    document.head.appendChild(script);
  }

  // Cek session tersimpan
  const saved = loadFromStorage();

  if (saved === true && state.account && state.code && state.expires && !isExpired(state.expires)) {
    // Session masih valid (secara lokal) — langsung masuk dashboard dulu biar
    // UX cepat & tetap bisa dipakai offline buat edit-edit ringan (nama toko,
    // barang, dll), LALU cek ulang ke server di belakang layar. Verifikasi
    // KETAT yang wajib online cuma dipasang di tombol "Generate Nota" —
    // lihat handleGenerate() — supaya kode tetap bisa dipakai sekadar edit
    // offline, tapi TIDAK bisa dipakai menghasilkan nota tanpa koneksi.
    state.isPremium = true;
    enterDashboard();
    revalidateSession();
  } else if (saved === 'expired' && state.code) {
    // Session expired — tampilkan status expired di landing
    state.isPremium = false;
    showPage('landing-page');
    showActivationStatus();
    showToast('Masa premium Anda telah berakhir. Silakan perpanjang.', 'info');
  } else {
    // Tidak ada session — tampilkan landing biasa
    showPage('landing-page');
    showActivationForm();
  }

  // Bind events
  bindEvents();

  // Init Lucide icons
  reIcons();

  // Set demo hint
  if (CONFIG.DEMO_MODE) {
    dom.accountInput.placeholder = 'Masukkan akun (demo: AK-DEMO01)';
    dom.codeInput.placeholder = 'Masukkan kode akses (demo: NK-DEMO01)';
  }

  console.log('📝 NotaOTO LITE siap digunakan!');
  console.log(`🔧 Mode: ${CONFIG.DEMO_MODE ? 'DEMO' : 'Production'}`);
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init);

// Cek ulang ke server setiap 1 jam selama tab dibuka, dan setiap kali user
// balik ke tab ini (misal habis buka WhatsApp lalu balik lagi). Interval
// dijaga tidak terlalu sering supaya tidak boros kuota Google Apps Script.
setInterval(() => {
  if (state.isPremium && state.account && state.code) revalidateSession();
}, 60 * 60 * 1000);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.isPremium && state.account && state.code) {
    revalidateSession();
  }
});

// ============================================
// SCROLL REVEAL (landing page)
// Animasi elemen ".reveal" muncul saat masuk viewport.
// Ditambahkan terpisah agar tidak mengubah logic init() yang sudah ada.
// ============================================
(function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      revealEls.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  });
})();

// ============================================
// PWA: REGISTER SERVICE WORKER + TOMBOL INSTALL
// ============================================
// Ini yang bikin web NotaOTO LITE bisa di-"Install" jadi app di HP
// (muncul ikon di homescreen kayak app biasa, buka tanpa address bar
// browser). Bukan file .apk asli, tapi hasil & pengalamannya di HP
// user mirip banget — cara paling ringan & tanpa perlu upload ke Play
// Store. Kalau nanti butuh .apk sungguhan buat di-submit ke Play Store,
// itu langkah terpisah (pakai TWA/Bubblewrap) di atas fondasi PWA ini.
(function initPWA() {
  // Daftarkan service worker (syarat wajib PWA supaya "installable")
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch((err) => {
        console.warn('Service worker gagal didaftarkan:', err);
      });
    });
  }

  let installPromptEvent = null;
  let installBtn = null;
  let pwaDismissed = false; // flag memory — hilang kalau refresh/buka tab baru

  function buatTombolInstall() {
    if (installBtn) return installBtn;
    installBtn = document.createElement('div');
    installBtn.id = 'pwa-install-btn';
    installBtn.className = 'pwa-install-btn';
    installBtn.innerHTML =
      '<div class="pwa-install-inner">' +
        '<div class="pwa-install-icon-wrap">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>' +
            '<line x1="12" y1="18" x2="12.01" y2="18"/>' +
          '</svg>' +
        '</div>' +
        '<div class="pwa-install-info">' +
          '<strong class="pwa-install-title">Install NotaOTO LITE</strong>' +
          '<span class="pwa-install-desc">Akses cepat dari layar utama HP</span>' +
        '</div>' +
        '<button class="pwa-install-action">Install</button>' +
        '<button class="pwa-install-close" aria-label="Tutup">&times;</button>' +
      '</div>';
    document.body.appendChild(installBtn);

    // Install action
    installBtn.querySelector('.pwa-install-action').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!installPromptEvent) return;
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      installPromptEvent = null;
      sembunyikanBannerInstall();
      if (outcome === 'accepted' && typeof showToast === 'function') {
        showToast('✅ NotaOTO LITE berhasil di-install!', 'success');
      }
    });

    // Close / dismiss — flag memory aja, begitu refresh/buka tab baru muncul lagi
    installBtn.querySelector('.pwa-install-close').addEventListener('click', (e) => {
      e.stopPropagation();
      pwaDismissed = true;
      sembunyikanBannerInstall();
    });
    return installBtn;
  }

  function sembunyikanBannerInstall() {
    if (installBtn) installBtn.classList.remove('show');
    document.body.classList.remove('pwa-banner-visible');
  }

  // Chrome/Android akan fire event ini kalau web-nya memenuhi syarat PWA
  // (ada manifest + service worker + HTTPS). Safari/iOS tidak fire event
  // ini — di iOS, install tetap bisa manual lewat Share > Add to Home Screen.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    // Skip kalau sudah di-dismiss di sesi ini
    if (pwaDismissed || state.isPremium) return;
    installPromptEvent = e;
    buatTombolInstall().classList.add('show');
    document.body.classList.add('pwa-banner-visible');
  });

  // Kalau sudah ke-install, sembunyikan tombolnya.
  window.addEventListener('appinstalled', () => {
    installPromptEvent = null;
    pwaDismissed = true;
    sembunyikanBannerInstall();
  });
})();
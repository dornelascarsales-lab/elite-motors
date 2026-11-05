// Junta o estoque da Velocce Auto Sales (velocceauto.com, DealerCenter atrás de Cloudflare) ao inventory.json,
// que o sync-inventory.js acabou de gravar com a Summit. Um site só, o da Elite (pedido do Eder, 04/11/2026,
// com autorização da Velocce). Cada carro guarda a loja em "loja" (summit | velocce), só para uso interno.
// Rede de segurança: se a Velocce falhar, mantém os carros dela da última vez; carro sem foto usa a última foto boa.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const BASE = 'https://www.velocceauto.com';
const OUT_PATH = path.join(__dirname, '..', 'inventory.json');
const CACHE_PATH = path.join(__dirname, '..', 'fotos-cache.json');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

const UPPER = new Set(['BMW', 'GMC', 'RAM', 'ESV', 'SUV', 'AWD', 'FWD', 'RWD', '4WD', '2WD', 'XL', 'XLT', 'SLT', 'SLE', 'LT',
  'LTZ', 'LS', 'RS', 'SS', 'GT', 'SR5', 'TRD', 'RST', 'AMG', 'SE', 'SEL', 'XLE', 'LE', 'EX', 'LX', 'SV', 'SL', 'S', 'EV',
  'LXI', 'F150', 'F250', 'F350', 'X3', 'X5', 'X7', '4D', '2D']);
const titleCase = s => (s || '').toLowerCase().split(/(\s+)/)
  .map(w => UPPER.has(w.toUpperCase()) ? w.toUpperCase() : w.replace(/^([a-z])/, c => c.toUpperCase())).join('')
  .replace(/\bFt\b/g, 'ft');

async function listar(page) {
  await page.goto(`${BASE}/inventory/?pagesize=96`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  return page.evaluate(() => {
    const vistos = new Map();
    for (const a of document.querySelectorAll('a[href*="/inventory/"]')) {
      const m = a.getAttribute('href').match(/\/inventory\/([^/]+)\/([^/]+)\/([^/]+)\/?$/);
      if (!m) continue;
      let card = a;
      for (let i = 0; i < 6 && card.parentElement; i++) {
        card = card.parentElement;
        if (/\$\d/.test(card.innerText) && /\b(19|20)\d\d\b/.test(card.innerText)) break;
      }
      const txt = card.innerText;
      const nome = (txt.match(/\b(19|20)\d\d [A-Z0-9][^\n$]+/) || [''])[0].trim();
      const precos = [...txt.matchAll(/\$[\d,]+/g)].map(x => x[0]);
      if (nome && !vistos.has(m[3])) vistos.set(m[3], { stock: m[3], url: new URL(a.getAttribute('href'), location.origin).href, name: nome, priceText: precos[precos.length - 1] || '' });
    }
    return [...vistos.values()];
  });
}

async function detalhe(page, v) {
  await page.goto(v.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3500);
  const html = await page.content();
  const txt = await page.evaluate(() => document.body.innerText);
  if (/been blocked/i.test(txt)) throw new Error('bloqueado pela Cloudflare');
  const campo = rot => ((txt.match(new RegExp('\\n' + rot + '\\n([^\\n]+)', 'i')) || [])[1] || '').trim();
  // Só as fotos da galeria do carro: ficam antes de "Vehicle Specifications"; depois vêm os "carros parecidos".
  const fimGaleria = html.indexOf('Vehicle Specifications');
  const ids = [];
  for (const m of html.matchAll(/imagescf\.dealercenter\.net\/\d+\/\d+\/([0-9a-f]{6}-[0-9a-f]{32}\.jpg)/g)) {
    if (fimGaleria > 0 && m.index > fimGaleria) break;
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  // Nome e preço lidos na página do próprio carro (na lista, o cartão às vezes pega o nome/preço do vizinho)
  const h1 = await page.evaluate(() => (document.querySelector('h1') || {}).innerText || '');
  if (/^(19|20)\d\d /.test(h1.trim())) v = { ...v, name: h1.trim().replace(/\s+/g, ' ') };
  const antesSpec = txt.slice(0, Math.max(0, txt.indexOf('Vehicle Specifications')));
  const precoPag = (antesSpec.match(/\$\s?[\d,]{4,}/g) || []).pop();
  if (precoPag) v = { ...v, priceText: precoPag.replace(/\s/g, '') };
  const [year, ...rest] = v.name.split(' ');
  const trim = campo('Trim');
  return {
    vin: campo('VIN'), stock: campo('Stock No.') || v.stock, url: v.url, imageCount: ids.length,
    name: v.name, price: null, totalPrice: null, priceText: v.priceText, wasPrice: null, dealerFee: null,
    mileage: parseInt(campo('Mileage').replace(/\D/g, '') || '0', 10) || null,
    transmission: campo('Transmission'), drivetrain: campo('Drivetrain'),
    year: parseInt(year, 10) || null, make: titleCase(rest[0] || ''), model: titleCase(rest.slice(1).join(' ')),
    title: titleCase(`${v.name} ${trim}`.trim()), body: /PICKUP/i.test(trim) ? 'PICKUP' : '',
    fuel: /DIESEL/i.test(campo('Engine')) ? 'Diesel' : 'Gasoline', engine: campo('Engine'),
    color: titleCase(campo('Exterior Color')), interior: titleCase(campo('Interior Color')), mpg: '',
    priceValue: parseInt(v.priceText.replace(/\D/g, '') || '0', 10) || null,
    photos: ids.map(id => `https://imagescf.dealercenter.net/640/480/${id}`),
    loja: 'velocce',
  };
}

async function main() {
  const inv = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8'));
  const antigosVelocce = [];
  try {
    // os carros da Velocce da última versão publicada (o sync da Summit regrava o arquivo só com a Summit)
    const ultimo = JSON.parse(require('child_process').execSync('git show HEAD:inventory.json', { cwd: path.join(__dirname, '..') }).toString());
    for (const v of ultimo.vehicles || []) if (v.loja === 'velocce') antigosVelocce.push(v);
  } catch {}
  const summit = (inv.vehicles || []).filter(v => v.loja !== 'velocce').map(v => ({ ...v, loja: 'summit' }));

  let velocce = [];
  try {
    const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true, args: ['--disable-blink-features=AutomationControlled'] });
    const page = await browser.newPage({ userAgent: UA, locale: 'en-US', viewport: { width: 1400, height: 1000 } });
    const lista = await listar(page);
    console.log(`Velocce: ${lista.length} carros na lista`);
    for (const v of lista) {
      try { velocce.push(await detalhe(page, v)); }
      catch (e) { console.warn(`  falhou ${v.name}: ${e.message}`); velocce.push({ ...v, title: titleCase(v.name), photos: [], loja: 'velocce', priceValue: parseInt(v.priceText.replace(/\D/g, '') || '0', 10) || null }); }
    }
    await browser.close();
  } catch (e) {
    console.warn(`Velocce falhou (${e.message}): mantenho os ${antigosVelocce.length} carros da última vez`);
  }
  if (antigosVelocce.length >= 5 && velocce.length < antigosVelocce.length * 0.6) {
    console.warn(`Velocce veio com ${velocce.length} carros contra ${antigosVelocce.length}: mantenho a lista anterior`);
    velocce = antigosVelocce;
  }

  // carro sem foto ou sem VIN: usa a última versão boa (por VIN ou estoque)
  let cache = {};
  try { cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')); } catch {}
  const porEstoque = Object.fromEntries(Object.values(cache).filter(c => c.loja === 'velocce').map(c => [c.stock, c]));
  velocce = velocce.map(v => {
    const antigo = (v.vin && cache[v.vin]) || porEstoque[v.stock];
    if ((!v.photos || !v.photos.length) && antigo) return { ...antigo, priceText: v.priceText || antigo.priceText, priceValue: v.priceValue || antigo.priceValue, loja: 'velocce' };
    return v;
  });
  for (const v of velocce) if (v.vin && v.photos && v.photos.length) cache[v.vin] = v;
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));

  // Carro sem nenhuma foto na Velocce ("imagem não disponível") fica fora do site até a Velocce subir as fotos
  const foraDoSite = velocce.filter(v => !v.photos || !v.photos.length);
  velocce = velocce.filter(v => v.photos && v.photos.length);
  if (foraDoSite.length) console.log(`  fora do site por enquanto (sem foto na Velocce): ${foraDoSite.map(v => v.name).join(', ')}`);
  const vehicles = [...summit, ...velocce].sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
  fs.writeFileSync(OUT_PATH, JSON.stringify({ ...inv, updatedAt: new Date().toISOString(), count: vehicles.length, vehicles }, null, 2));
  console.log(`inventory.json: ${summit.length} da Summit + ${velocce.length} da Velocce = ${vehicles.length} carros`);
}

main().catch(err => { console.error('Sync da Velocce falhou:', err); process.exit(0); });   // nunca derruba o sync da Summit

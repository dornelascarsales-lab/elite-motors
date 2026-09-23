// Puxa o estoque do site da Summit Motorsports e grava inventory.json.
// O site é DealerCenter atrás de Cloudflare: requisição simples leva 403,
// por isso usamos o Chrome de verdade via playwright-core.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const BASE = 'https://www.thesummitmotorsports.com';
const OUT_PATH = path.join(__dirname, '..', 'inventory.json');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

const UPPER = new Set(['BMW', 'GMC', 'RAM', 'ESV', 'SUV', 'AWD', 'FWD', 'RWD', '4WD', '2WD', 'XL', 'XLT', 'SLT', 'SLE',
  'LT', 'LTZ', 'LS', 'RS', 'SS', 'GT', 'SR5', 'TRD', 'RST', 'AMG', 'SE', 'SEL', 'XLE', 'LE', 'EX', 'LX', 'SV', 'SL',
  'S', 'EV', 'LXI', 'LWB', 'RWB', 'F150', 'F250', 'F350', 'E250', 'E350', 'X5', 'X7', 'EX-L', '4D', '3D', '2D']);
const titleCase = s => (s || '').toLowerCase().split(/(\s+)/)
  .map(w => UPPER.has(w.toUpperCase()) ? w.toUpperCase() : w.replace(/^([a-z])/, c => c.toUpperCase()))
  .join('')
  .replace(/\bXdrive/g, 'xDrive').replace(/\bSdrive/g, 'sDrive').replace(/\b4motion/g, '4MOTION')
  .replace(/\bFt\b/g, 'ft').replace(/\bW\//g, 'w/');

async function scrapeListingPage(page, n) {
  await page.goto(`${BASE}/inventory/?page_no=${n}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.vehicle-container', { timeout: 30000 }).catch(() => {});
  return page.$$eval('.vehicle-container', els => els.map(el => {
    const q = s => el.querySelector(s);
    const txt = s => (q(s)?.textContent || '').trim();
    const slider = q('.dws-vlp-media-slider');
    const fee = q('.dws-price-fee-label');
    return {
      vin: (el.dataset.vehicleId || '').replace('vehicle-id-', ''),
      stock: slider?.dataset.stockNumber || '',
      url: slider?.dataset.vdpUrl || q('a.vehicle-title')?.href || '',
      imageCount: parseInt(slider?.dataset.imageCount || '0', 10),
      name: txt('a.vehicle-title'),
      price: parseInt(fee?.dataset.vehiclePrice || '0', 10) || null,
      totalPrice: parseInt(fee?.dataset.totalPrice || '0', 10) || null,
      // Preço promocional: o valor cheio vem riscado (.text-line-through) e o válido em .vehicle-price-sale-container
      priceText: txt('.vehicle-price-sale-container .vehicle-price-value, .vehicle-price-col:not(.text-line-through) .vehicle-price-value')
        .replace(/\*.*$/s, '').trim(),
      wasPrice: parseInt(txt('.text-line-through .vehicle-price-value').replace(/\D/g, '') || '0', 10) || null,
      dealerFee: (JSON.parse(fee?.dataset.dealerFees || '[]')).reduce((sum, f) => sum + (parseInt(f.Amount, 10) || 0), 0) || null,
      mileage: parseInt(txt('.vehicle-field-odometer .vehicle-info-value').replace(/\D/g, '') || '0', 10) || null,
      transmission: txt('.vehicle-field-transmission .vehicle-info-value'),
      drivetrain: txt('.vehicle-field-drivetrain .vehicle-info-value'),
    };
  }));
}

async function scrapeDetail(page, v) {
  await page.goto(v.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const html = await page.content();

  let car = {};
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      if (j.makesOffer?.itemOffered) car = j.makesOffer.itemOffered;
    } catch {}
  }
  const fullTitle = (html.match(/<title>([^<]*?)\s*-\s*Summit Motorsports/i) || [])[1] || v.name;

  // Fotos: ids na ordem em que aparecem; a galeria do carro vem antes dos "similares".
  const ids = [];
  for (const m of html.matchAll(/imagescf\.dealercenter\.net\/\d+\/\d+\/([0-9a-f]{6}-[0-9a-f]{32}\.jpg)/g)) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  const count = v.imageCount || ids.length;
  const photos = ids.slice(0, count).map(id => `https://imagescf.dealercenter.net/640/480/${id}`);

  const spec = label => {
    const re = new RegExp(label + '\\s*</[^>]+>\\s*<[^>]+>\\s*([^<]+)<', 'i');
    return ((html.match(re) || [])[1] || '').trim();
  };

  const [year, ...rest] = v.name.split(' ');
  return {
    ...v,
    year: parseInt(year, 10) || car.modelDate || null,
    make: titleCase(rest[0] || ''),
    model: titleCase(rest.slice(1).join(' ')),
    title: titleCase(fullTitle.replace(/&amp;/g, '&')),
    body: car.bodyType || '',
    fuel: titleCase(car.fuelType || spec('Fuel Type')),
    engine: car.vehicleEngine || '',
    color: titleCase(car.color || spec('Exterior Color')),
    interior: titleCase(car.vehicleInteriorColor || ''),
    drivetrain: v.drivetrain || spec('Drivetrain'),
    mpg: spec('MPG\\(city/highway\\)'),
    priceValue: v.totalPrice || parseInt(v.priceText.replace(/\D/g, '') || '0', 10) || null,
    photos,
  };
}

async function main() {
  const browser = await chromium.launch({
    channel: process.env.CHROME_CHANNEL || 'chrome',
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage({ userAgent: UA, locale: 'en-US' });

  await page.goto(`${BASE}/inventory/?page_no=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const totalPages = parseInt(await page.$eval('[data-total-pages]', el => el.dataset.totalPages).catch(() => '1'), 10);
  console.log(`Summit: ${totalPages} páginas de estoque`);

  const listed = [];
  for (let n = 1; n <= totalPages; n++) {
    const items = await scrapeListingPage(page, n);
    console.log(`  página ${n}: ${items.length} carros`);
    listed.push(...items);
  }

  const unique = [...new Map(listed.filter(v => v.vin && v.url).map(v => [v.vin, v])).values()];
  if (unique.length === 0) throw new Error('Nenhum carro encontrado — layout da Summit mudou ou Cloudflare bloqueou');

  const vehicles = [];
  for (const v of unique) {
    try {
      vehicles.push(await scrapeDetail(page, v));
    } catch (err) {
      console.warn(`  falhou ${v.name}: ${err.message}`);
      vehicles.push({ ...v, title: titleCase(v.name), photos: [] });
    }
  }
  await browser.close();

  vehicles.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));

  fs.writeFileSync(OUT_PATH, JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: `${BASE}/inventory/`,
    count: vehicles.length,
    vehicles,
  }, null, 2));
  console.log(`inventory.json atualizado com ${vehicles.length} carros`);
}

main().catch(err => {
  console.error('Sync falhou:', err);
  process.exit(1);
});

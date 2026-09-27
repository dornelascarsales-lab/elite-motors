// Gera uma página por carro em /carro/<código>/index.html só com as tags de prévia (Open Graph)
// daquele carro: foto, nome e preço. É isso que o WhatsApp lê pra montar a prévia do link.
// Quem abre no navegador é mandado na hora pra ficha do carro no site (/?carro=<código>).
// Roda todo dia no robô do estoque (.github/workflows/sync-inventory.yml): recria tudo, então
// carro vendido some.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://elitemotorsorlandofl.com';
const OUT = path.join(ROOT, 'carro');
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'inventory.json'), 'utf8'));

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const grande = url => (url || '').replace('/640/480/', '/1024/768/');

fs.rmSync(OUT, { recursive: true, force: true });
let n = 0;
for (const v of inv.vehicles || []) {
  const cod = v.stock || v.vin;
  if (!cod || !(v.photos || []).length) continue;
  const nome = `${v.year} ${v.make} ${v.model}`.replace(/\s+/g, ' ').trim();
  const preco = v.priceText || (v.priceValue ? '$' + Number(v.priceValue).toLocaleString('en-US') : '');
  const titulo = preco ? `${nome} · ${preco}` : nome;
  const milhas = v.mileage ? `${Math.round(v.mileage).toLocaleString('en-US')} milhas` : '';
  const desc = [milhas, v.drivetrain, v.color && `cor ${v.color}`, 'Entregamos na porta · Elite Motors, Orlando FL']
    .filter(Boolean).join(' · ');
  const destino = `${SITE}/?carro=${encodeURIComponent(cod)}`;
  const url = `${SITE}/carro/${encodeURIComponent(cod)}/`;
  const foto = grande(v.photos[0]);
  const html = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Elite Motors · Orlando, FL">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(foto)}">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="768">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(destino)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>location.replace(${JSON.stringify(destino)});</script>
</head><body style="background:#0b0b0b;color:#eee;font-family:system-ui;text-align:center;padding:40px">
<img src="${esc(foto)}" alt="${esc(nome)}" style="max-width:100%;border-radius:8px">
<h1 style="font-size:20px">${esc(titulo)}</h1>
<p><a href="${esc(destino)}" style="color:#d4a843">Ver fotos e detalhes</a></p>
</body></html>
`;
  const dir = path.join(OUT, cod);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  n++;
}
console.log(`carro/: ${n} páginas de prévia`);

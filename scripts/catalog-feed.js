// Gera catalogo-whatsapp.csv (feed de produtos da Meta) a partir do inventory.json.
// A Meta lê esse arquivo todo dia e atualiza o Catálogo do WhatsApp Business do Eder.
// Roda no mesmo robô diário do estoque (.github/workflows/sync-inventory.yml).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://elitemotorsorlandofl.com';
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'inventory.json'), 'utf8'));

// Fotos da DealerCenter vêm em 640x480; a Meta pede pelo menos 500px nos dois lados.
const grande = url => (url || '').replace('/640/480/', '/1024/768/');
const milhas = n => (n ? Math.round(n).toLocaleString('en-US') + ' milhas' : null);
const csv = v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const colunas = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link',
  'image_link', 'additional_image_link', 'brand', 'google_product_category'];

const linhas = (inv.vehicles || [])
  .filter(v => (v.stock || v.vin) && v.priceValue && (v.photos || []).length)
  .map(v => {
    const cod = v.stock || v.vin;
    const titulo = `${v.year} ${v.make} ${v.model}`.replace(/\s+/g, ' ').trim().slice(0, 150);
    const detalhes = [milhas(v.mileage), v.engine, v.drivetrain, v.transmission, v.color && `cor ${v.color}`]
      .filter(Boolean).join(' · ');
    const descricao = `${v.title || titulo}. ${detalhes}. Revisado, com garantia de motor e transmissão. ` +
      'Entregamos na porta. Financiamento disponível, sujeito a aprovação de crédito. ' +
      `Estoque ${cod}. Fale com o Eder no WhatsApp.`;
    return {
      id: cod,
      title: titulo,
      description: descricao.slice(0, 5000),
      availability: 'in stock',
      condition: 'used',
      price: `${Number(v.priceValue).toFixed(2)} USD`,
      link: `${SITE}/?carro=${encodeURIComponent(cod)}`,
      image_link: grande(v.photos[0]),
      additional_image_link: v.photos.slice(1, 10).map(grande).join(','),
      brand: v.make,
      google_product_category: 'Vehicles & Parts > Vehicles > Motor Vehicles > Cars, Trucks & Vans',
    };
  });

const out = [colunas.join(','), ...linhas.map(l => colunas.map(c => csv(l[c])).join(','))].join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'catalogo-whatsapp.csv'), out);
console.log(`catalogo-whatsapp.csv: ${linhas.length} carros`);

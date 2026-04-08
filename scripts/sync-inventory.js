const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV_URL = 'https://app.captae.com.br/v1/public/inventory/xtM7tn6DiqqDRt2QDDp3e-r6-Dy3hAHS.csv';
const INDEX_PATH = path.join(__dirname, '..', 'index.html');
const WHATSAPP_NUMBER = '16892446424';
const PLACEHOLDER_IMG = 'https://via.placeholder.com/600x400/1a1a1a/d4a843?text=Em+Breve';

async function fetchCSV() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  return res.text();
}

function formatPrice(price) {
  if (!price) return 'Consulte';
  const num = parseInt(price, 10);
  if (isNaN(num)) return 'Consulte';
  return '$' + num.toLocaleString('en-US');
}

function formatMileage(mileage) {
  if (!mileage) return 'N/A';
  const num = parseInt(mileage, 10);
  if (isNaN(num)) return 'N/A';
  return num.toLocaleString('en-US') + ' Mi';
}

function getFirstPhoto(photos) {
  if (!photos || !photos.trim()) return PLACEHOLDER_IMG;
  const first = photos.split(',')[0].trim();
  return first || PLACEHOLDER_IMG;
}

function buildCardHTML(vehicle) {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim();
  const photo = getFirstPhoto(vehicle.photos);
  const price = formatPrice(vehicle.price);
  const mileage = formatMileage(vehicle.mileage);
  const transmission = vehicle.transmission || 'N/A';
  const stockNumber = vehicle.stock_number || '';
  const vin = vehicle.vin || '';
  const whatsappMsg = encodeURIComponent(`Olá, quero garantir essa Truck! ${title}`);

  return `
                    <div class="truck-card" data-year="${vehicle.year}" data-make="${(vehicle.make || '').toLowerCase()}" data-body="${(vehicle.body_type || '').toLowerCase()}" data-drivetrain="${(vehicle.drivetrain || '').toLowerCase()}" data-transmission="${(vehicle.transmission || '').toLowerCase()}" data-price="${vehicle.price || 0}" data-mileage="${vehicle.mileage || 0}" data-vin="${vin}">
                        <div class="truck-card-img">
                            <img src="${photo}" alt="${title}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
                        </div>
                        <div class="truck-card-body">
                            <h3>${title.toUpperCase()}</h3>
                            <div class="truck-price">
                                <span class="label">PRICE: </span>
                                <span class="value">${price}</span>
                            </div>
                            <div class="truck-specs">
                                <span>${mileage}</span>
                                <span>${transmission}</span>
                                <span>${stockNumber}</span>
                                <span>${vin}</span>
                            </div>
                            <div class="truck-actions">
                                <a onclick="fbq('track','Lead')" href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}" class="btn-whatsapp" target="_blank"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="vertical-align:middle;margin-right:6px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp</a>
                            </div>
                        </div>
                    </div>`;
}

function buildFilterOptions(vehicles) {
  const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))].sort((a, b) => b - a);
  const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))].sort();
  const models = [...new Set(vehicles.map(v => v.model).filter(Boolean))].sort();
  const bodyTypes = [...new Set(vehicles.map(v => v.body_type).filter(Boolean))].sort();
  const drivetrains = [...new Set(vehicles.map(v => v.drivetrain).filter(Boolean))].sort();
  const transmissions = [...new Set(vehicles.map(v => {
    const t = v.transmission || '';
    if (t.toLowerCase().includes('automatic')) return 'Automatic';
    if (t.toLowerCase().includes('manual')) return 'Manual';
    return t;
  }).filter(Boolean))].sort();

  function checkboxes(values, prefix) {
    return values.map(v => `                        <label><input type="checkbox" value="${v.toLowerCase()}"> ${v}</label>`).join('\n');
  }

  return { years, makes, models, bodyTypes, drivetrains, transmissions, checkboxes };
}

function buildSidebarHTML(vehicles) {
  const f = buildFilterOptions(vehicles);

  const yearOpts = f.years.map(y => `                        <label><input type="checkbox" value="${y}"> ${y}</label>`).join('\n');
  const makeOpts = f.makes.map(m => `                        <label><input type="checkbox" value="${m.toLowerCase()}"> ${m}</label>`).join('\n');
  const modelOpts = f.models.map(m => `                        <label><input type="checkbox" value="${m.toLowerCase()}"> ${m}</label>`).join('\n');
  const bodyOpts = f.bodyTypes.map(b => `                        <label><input type="checkbox" value="${b.toLowerCase()}"> ${b}</label>`).join('\n');
  const driveOpts = f.drivetrains.map(d => `                        <label><input type="checkbox" value="${d.toLowerCase()}"> ${d}</label>`).join('\n');
  const transOpts = f.transmissions.map(t => `                        <label><input type="checkbox" value="${t.toLowerCase()}"> ${t}</label>`).join('\n');

  return `            <aside class="filter-sidebar">
                <div class="filter-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/></svg>
                    Filter
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            Year
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
${yearOpts}
                    </div>
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
                            Make
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
${makeOpts}
                    </div>
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14M5 12h14M5 7h14"/></svg>
                            Model
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
${modelOpts}
                    </div>
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
                            Body Type
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
${bodyOpts}
                    </div>
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                            Price
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
                        <select>
                            <option value="">Min Price</option>
                            <option value="5000">$5,000</option>
                            <option value="10000">$10,000</option>
                            <option value="15000">$15,000</option>
                            <option value="20000">$20,000</option>
                            <option value="25000">$25,000</option>
                            <option value="30000">$30,000</option>
                        </select>
                        <br>
                        <select>
                            <option value="">Max Price</option>
                            <option value="15000">$15,000</option>
                            <option value="20000">$20,000</option>
                            <option value="25000">$25,000</option>
                            <option value="30000">$30,000</option>
                            <option value="40000">$40,000</option>
                            <option value="50000">$50,000+</option>
                        </select>
                    </div>
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                            Drivetrain
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
${driveOpts}
                    </div>
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="10" y1="10" x2="10" y2="14"/><line x1="14" y1="10" x2="14" y2="14"/></svg>
                            Transmission
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
${transOpts}
                    </div>
                </div>

                <div class="filter-group">
                    <button class="filter-group-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="filter-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                            Mileage
                        </span>
                        <span class="chevron">&#8250;</span>
                    </button>
                    <div class="filter-options">
                        <select>
                            <option value="">Max Mileage</option>
                            <option value="50000">50,000 Mi</option>
                            <option value="75000">75,000 Mi</option>
                            <option value="100000">100,000 Mi</option>
                            <option value="150000">150,000 Mi</option>
                            <option value="200000">200,000 Mi</option>
                        </select>
                    </div>
                </div>
            </aside>`;
}

async function main() {
  console.log('Fetching CSV from Captae...');
  const csvText = await fetchCSV();

  console.log('Parsing CSV...');
  const vehicles = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${vehicles.length} vehicles`);

  // Build cards HTML
  const cardsHTML = vehicles.map(v => buildCardHTML(v)).join('\n');

  // Build sidebar HTML
  const sidebarHTML = buildSidebarHTML(vehicles);

  // Build full inventory section
  const inventoryHTML = `    <!-- INVENTORY -->
    <section class="inventory" id="inventory">
        <h2 class="section-title" data-pt="Nosso Estoque" data-es="Nuestro Inventario">Nosso Estoque</h2>

        <div style="max-width:1200px;margin:0 auto;">
            <button class="filter-toggle-mobile" onclick="document.querySelector('.filter-sidebar').classList.toggle('show')" data-pt="Filtrar" data-es="Filtrar">Filtrar</button>
        </div>

        <div class="inventory-layout">
            <!-- FILTER SIDEBAR -->
${sidebarHTML}

            <!-- TRUCK CARDS -->
            <div class="inventory-main">
                <div class="inventory-top">
                    <h2 data-pt="Trucks Disponíveis" data-es="Trucks Disponibles">Trucks Disponíveis</h2>
                    <div class="sort-select">
                        <span>Sort by:</span>
                        <select>
                            <option>Default</option>
                            <option data-pt="Menor Preço" data-es="Menor Precio">Menor Preço</option>
                            <option data-pt="Maior Preço" data-es="Mayor Precio">Maior Preço</option>
                            <option data-pt="Mais Recente" data-es="Más Reciente">Mais Recente</option>
                        </select>
                    </div>
                </div>

                <div class="inventory-grid">
${cardsHTML}
                </div>
            </div>
        </div>
    </section>`;

  // Read index.html
  console.log('Updating index.html...');
  let html = fs.readFileSync(INDEX_PATH, 'utf-8');

  // Replace inventory section
  const startMarker = '    <!-- INVENTORY -->';
  const endMarker = '    <!-- TESTIMONIALS -->';

  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Could not find INVENTORY or TESTIMONIALS markers in index.html');
  }

  html = html.substring(0, startIdx) + inventoryHTML + '\n\n' + html.substring(endIdx);

  fs.writeFileSync(INDEX_PATH, html, 'utf-8');
  console.log(`Successfully updated inventory with ${vehicles.length} vehicles!`);
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});

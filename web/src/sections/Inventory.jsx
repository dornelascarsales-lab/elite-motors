import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useReveal } from '../hooks/useReveal';
import SectionHeader from '../components/SectionHeader';
import Toggle from '../components/Toggle';
import CarCard from '../components/CarCard';
import { useLang } from '../i18n';
import { category, money, waLink } from '../lib/inventory';

const CATS = ['all', 'pickup', 'suv', 'van', 'car'];
const BANDS = { low: [0, 15000], mid: [15000, 30000], high: [30000, Infinity] };
export const inBand = (car, band) => {
  if (!band) return true;
  const [lo, hi] = BANDS[band];
  return car.priceValue && car.priceValue >= lo && car.priceValue < hi;
};

function ago(iso, lang) {
  if (!iso) return '';
  const h = Math.max(0, Math.round((Date.now() - new Date(iso)) / 36e5));
  if (h < 1) return lang === 'es' ? 'hace minutos' : 'há minutos';
  if (h < 48) return lang === 'es' ? `hace ${h} h` : `há ${h} h`;
  return new Date(iso).toLocaleDateString(lang === 'es' ? 'es' : 'pt-BR');
}

export default function Inventory({ inv, filters, setFilters, onOpen }) {
  const { t, lang } = useLang();
  const tableRef = useReveal({ threshold: 0.1 });
  const [limit, setLimit] = useState(12);
  const { vehicles, loading, error, updatedAt } = inv;
  const { cat, q, onlySale, sort, band } = filters;
  const set = patch => { setFilters(f => ({ ...f, ...patch })); setLimit(12); };

  const stats = useMemo(() => CATS.slice(1).map(c => {
    const list = vehicles.filter(v => category(v) === c);
    const prices = list.map(v => v.priceValue).filter(Boolean);
    return { c, count: list.length, from: prices.length ? Math.min(...prices) : null };
  }).filter(s => s.count), [vehicles]);
  const maxCount = Math.max(1, ...stats.map(s => s.count));

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = vehicles.filter(v =>
      (cat === 'all' || category(v) === cat) &&
      (!onlySale || v.wasPrice) &&
      inBand(v, band) &&
      (!needle || `${v.title} ${v.color}`.toLowerCase().includes(needle)));
    const by = {
      priceDesc: (a, b) => (b.priceValue || 0) - (a.priceValue || 0),
      priceAsc: (a, b) => (a.priceValue || Infinity) - (b.priceValue || Infinity),
      miles: (a, b) => (a.mileage || Infinity) - (b.mileage || Infinity),
      year: (a, b) => b.year - a.year || (a.mileage || 0) - (b.mileage || 0),
    }[sort];
    return [...out].sort(by);
  }, [vehicles, cat, q, onlySale, sort, band]);

  const dirty = cat !== 'all' || q || onlySale || band;

  return (
    <section id="estoque" className="w-full max-w-7xl py-32 px-6 relative border-b border-white/[0.05] scroll-mt-16">
      <SectionHeader number="03" kicker={t('inv.kicker')} title={t('inv.title')} />

      {/* Resumo por categoria (estilo "Proof of reserves") */}
      <div ref={tableRef} className="max-w-4xl mx-auto border border-white/10 rounded-sm skeuo-card overflow-hidden mb-16">
        <div className="clip-slide delay-100 flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 py-5 border-b border-white/10 bg-white/[0.02] gap-4">
          <Toggle checked={onlySale} onChange={v => set({ onlySale: v })} label={t('inv.onlySale')} />
          <div className="flex items-center space-x-2 text-[0.65rem] text-white/40 tracking-widest uppercase">
            <span className="text-accent animate-pulse">● {ago(updatedAt, lang)}</span>
            <span>· {vehicles.length} {t('inv.units')}</span>
          </div>
        </div>
        <div className="flex flex-col">
          {stats.map((s, i) => (
            <button
              key={s.c}
              onClick={() => { set({ cat: cat === s.c ? 'all' : s.c }); document.getElementById('grade')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              className={clsx(`clip-slide delay-${(i + 2) * 100} text-left flex items-center justify-between px-8 py-5 border-b border-white/5 hover:bg-white/[0.03] transition-colors group gap-4`, cat === s.c && 'bg-accent/[0.06]')}
            >
              <div className="flex items-center space-x-6">
                <div className={clsx('flex items-end space-x-1 h-8 transition-all duration-300', i === 0 ? 'opacity-90' : 'opacity-40 group-hover:opacity-80')}>
                  {[0.35, 0.6, 1, 0.5, 0.75].map((h, j) => (
                    <div key={j} className={clsx('w-1.5 rounded-t-sm transition-all duration-500', i === 0 ? 'bg-accent' : 'bg-white')} style={{ height: `${Math.max(12, h * (s.count / maxCount) * 100)}%` }}></div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <iconify-icon icon="solar:alt-arrow-right-linear" class={clsx('text-sm transition-transform group-hover:translate-x-0.5', cat === s.c ? 'text-accent' : 'text-white/30')}></iconify-icon>
                    <span className="text-sm font-medium tracking-wide">{t(`inv.cat.${s.c}`)}</span>
                  </div>
                  <span className="text-[0.65rem] text-white/40 uppercase tracking-wider">{t('inv.from')} {money(s.from) || '—'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono tracking-tight text-white/90">{String(s.count).padStart(2, '0')}</div>
                <div className="text-[0.6rem] text-white/40 tracking-wider uppercase">{t('inv.units')}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div id="grade" className="scroll-mt-24 sticky top-[64px] z-30 -mx-6 px-6 py-4 mb-8 bg-[#030303]/85 backdrop-blur-md border-y border-white/[0.06]">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => set({ cat: c })}
                className={clsx('shrink-0 px-3 py-1.5 border rounded-sm text-[0.65rem] tracking-widest uppercase transition-all',
                  cat === c ? 'border-accent/60 text-accent bg-accent/10' : 'border-white/10 text-white/50 hover:text-white hover:border-white/30')}
              >
                {t(`inv.cat.${c}`)}
              </button>
            ))}
            {band && (
              <button onClick={() => set({ band: null })} className="shrink-0 px-3 py-1.5 border border-accent/60 text-accent bg-accent/10 rounded-sm text-[0.65rem] tracking-widest uppercase flex items-center gap-1">
                {t(`band.${band}`)} <iconify-icon icon="solar:close-circle-linear"></iconify-icon>
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <label className="flex-1 lg:w-64 flex items-center gap-2 px-3 py-2 border border-white/10 rounded-sm focus-within:border-accent/50 transition-colors">
              <iconify-icon icon="solar:magnifer-linear" class="text-white/40"></iconify-icon>
              <input value={q} onChange={e => set({ q: e.target.value })} placeholder={t('inv.search')} className="bg-transparent outline-none text-sm w-full placeholder:text-white/30" />
            </label>
            <select value={sort} onChange={e => set({ sort: e.target.value })} aria-label={t('inv.sort')} className="bg-[#0b0d12] border border-white/10 rounded-sm px-3 text-xs text-white/80 outline-none focus:border-accent/50">
              {['priceDesc', 'priceAsc', 'miles', 'year'].map(s => <option key={s} value={s}>{t(`inv.sort.${s}`)}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 text-[0.65rem] tracking-widest uppercase text-white/40">
        <span>{t('inv.showing')} <span className="text-white font-mono">{Math.min(limit, list.length)}</span> {t('inv.of')} <span className="font-mono">{list.length}</span></span>
        {dirty && <button onClick={() => set({ cat: 'all', q: '', onlySale: false, band: null })} className="hover:text-accent transition-colors">{t('inv.clear')}</button>}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-sm border border-white/5 skeuo-card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-white/[0.03]"></div>
              <div className="p-6 space-y-3"><div className="h-3 w-1/3 bg-white/5"></div><div className="h-5 w-2/3 bg-white/5"></div><div className="h-8 w-1/2 bg-white/5 mt-6"></div></div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="max-w-xl mx-auto text-center border border-white/10 skeuo-card rounded-sm p-10">
          <p className="text-white/60 mb-6">{t('inv.error')}</p>
          <a href={waLink(t('final.msg'))} target="_blank" rel="noopener" className="px-6 py-2 border border-accent/50 text-accent text-[0.65rem] tracking-widest uppercase rounded-sm hover:bg-accent hover:text-black transition-all">WhatsApp</a>
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="text-center py-20 text-white/50">
          <p className="mb-4">{t('inv.empty')}</p>
          <button onClick={() => set({ cat: 'all', q: '', onlySale: false, band: null })} className="text-[0.65rem] tracking-widest uppercase text-accent border-b border-accent pb-1">{t('inv.clear')}</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.slice(0, limit).map(car => <CarCard key={car.vin} car={car} onOpen={onOpen} />)}
      </div>

      {list.length > limit && (
        <div className="flex justify-center mt-12">
          <button onClick={() => setLimit(l => l + 12)} className="px-8 py-3 border border-white/20 rounded-sm text-white text-[0.65rem] tracking-widest uppercase hover:bg-white hover:text-black transition-all">
            + {Math.min(12, list.length - limit)} {t('inv.units')}
          </button>
        </div>
      )}

      <p className="max-w-3xl mx-auto text-center text-[0.65rem] text-white/35 leading-relaxed mt-14">{t('inv.disclaimer')}</p>
    </section>
  );
}

import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import MaskedText from '../components/MaskedText';
import WhatsIcon from '../components/WhatsIcon';
import { useLang } from '../i18n';
import { waLink } from '../lib/inventory';
import { trackWhatsApp } from '../lib/track';

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2016];
const BUDGETS = [15000, 20000, 25000, 30000, 40000, 50000, 70000];

export default function CustomOrder() {
  const { t } = useLang();
  const ref = useReveal({ threshold: 0.15 });
  const [f, setF] = useState({ make: '', year: '', budget: '', color: '', state: '' });
  const [err, setErr] = useState(false);
  const set = k => e => { setF(v => ({ ...v, [k]: e.target.value })); setErr(false); };

  const lines = [
    t('order.msg'),
    `${t('order.make')}: ${f.make.trim()}`,
    `${t('order.year')}: ${f.year || t('order.any')}`,
    `${t('order.budget')}: ${f.budget ? '$' + Number(f.budget).toLocaleString('en-US') : t('order.any')}`,
    f.color.trim() && `${t('order.color')}: ${f.color.trim()}`,
    f.state.trim() && `${t('order.state')}: ${f.state.trim()}`,
  ].filter(Boolean);

  const submit = e => {
    if (!f.make.trim()) { e.preventDefault(); setErr(true); return; }
    trackWhatsApp({ vin: '', title: `ENCOMENDA: ${f.make.trim()}`, priceValue: Number(f.budget) || null });
  };

  const field = 'w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/60 transition-colors';
  const label = 'block text-[0.6rem] tracking-widest uppercase text-white/40 mb-2';

  return (
    <section id="encomenda" ref={ref} className="w-full max-w-7xl py-32 px-6 relative border-b border-white/[0.05] scroll-mt-16">
      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/[0.03] -z-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <div className="flex items-center space-x-4 mb-4 text-[0.65rem] tracking-widest uppercase text-accent font-medium clip-slide delay-100">
            <span>02</span>
            <div className="w-12 h-px bg-accent/50"></div>
            <span>{t('order.kicker')}</span>
          </div>
          <h2 className="text-4xl md:text-6xl text-white font-medium tracking-tight leading-[1.05] mb-6">
            <MaskedText key={t('order.title')} text={t('order.title')} delayStart={200} stagger={80} />
          </h2>
          <p className="text-white/55 font-light leading-relaxed max-w-lg mb-10 clip-slide delay-400">{t('order.sub')}</p>

          <ol className="space-y-5">
            {['order.s1', 'order.s2', 'order.s3'].map((k, i) => (
              <li key={k} className={`flex items-center gap-5 clip-slide delay-${(i + 5) * 100}`}>
                <span className="w-10 h-10 shrink-0 flex items-center justify-center border border-accent/40 bg-accent/10 rounded-sm font-mono text-sm text-accent">0{i + 1}</span>
                <span className="text-white/80">{t(k)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-6 clip-slide delay-300">
          <form onSubmit={e => e.preventDefault()} className="relative skeuo-card-active rounded-sm p-8 md:p-10">
            <div className="absolute -top-3 left-8 px-3 py-1 bg-[#141820] border border-accent/30 text-[0.6rem] text-accent tracking-widest uppercase rounded-sm">{t('order.form')}</div>
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-accent/50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-accent/50"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="o-make">{t('order.make')} *</label>
                <input id="o-make" value={f.make} onChange={set('make')} placeholder={t('order.makePh')} className={`${field} ${err ? 'border-accent' : ''}`} aria-invalid={err} />
                {err && <p className="text-xs text-accent mt-2">{t('order.need')}</p>}
              </div>
              <div>
                <label className={label} htmlFor="o-year">{t('order.year')}</label>
                <select id="o-year" value={f.year} onChange={set('year')} className={`${field} bg-[#0b0d12]`}>
                  <option value="">{t('order.any')}</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="o-budget">{t('order.budget')}</label>
                <select id="o-budget" value={f.budget} onChange={set('budget')} className={`${field} bg-[#0b0d12]`}>
                  <option value="">{t('order.any')}</option>
                  {BUDGETS.map(b => <option key={b} value={b}>${b.toLocaleString('en-US')}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="o-color">{t('order.color')}</label>
                <input id="o-color" value={f.color} onChange={set('color')} placeholder={t('order.colorPh')} className={field} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="o-state">{t('order.state')}</label>
                <input id="o-state" value={f.state} onChange={set('state')} placeholder={t('order.statePh')} className={field} />
              </div>
            </div>

            <a
              href={waLink(lines.join('\n'))}
              target="_blank"
              rel="noopener"
              onClick={submit}
              className="mt-8 w-full py-4 rounded-sm bg-accent text-black text-[0.7rem] tracking-widest uppercase font-semibold flex items-center justify-center gap-2 hover:bg-accent-soft active:scale-[0.98] transition-all"
            >
              <WhatsIcon className="text-base" /> {t('order.cta')}
            </a>
          </form>
        </div>
      </div>
    </section>
  );
}

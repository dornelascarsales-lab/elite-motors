import { useReveal } from '../hooks/useReveal';
import SectionHeader from '../components/SectionHeader';
import { useLang } from '../i18n';
import { money } from '../lib/inventory';
import { inBand } from './Inventory';

export default function PriceBands({ vehicles, onPick }) {
  const { t } = useLang();
  const gridRef = useReveal({ threshold: 0.2 });
  const bands = ['low', 'mid', 'high'];
  const holodex = i => (i === 0 ? 'holodex-left' : i === 1 ? 'holodex-center' : 'holodex-right');

  return (
    <section className="w-full max-w-7xl py-32 px-6 relative border-b border-white/[0.05]">
      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/[0.03] -z-10"></div>
      <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white/[0.03] -z-10"></div>

      <SectionHeader number="05" kicker={t('band.kicker')} title={t('band.title')} />

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto holodex-container">
        {bands.map((b, i) => {
          const list = vehicles.filter(v => inBand(v, b));
          const active = b === 'mid';
          const models = [...new Set(list.map(v => `${v.make} ${v.model.split(' ')[0]}`))].slice(0, 4);
          const prices = list.map(v => v.priceValue);
          return (
            <div key={b} className={`${holodex(i)} clip-slide delay-${(i + 1) * 200} h-full`}>
              <div className={`holodex-item p-8 rounded-sm flex flex-col relative group h-full ${active ? 'skeuo-card-active z-10' : 'border border-white/5 skeuo-card'}`}>
                {active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#141820] border border-accent/30 text-[0.6rem] text-accent tracking-widest uppercase rounded-sm z-20">{t('band.popular')}</div>
                )}
                <div className="mb-8">
                  <h3 className={`font-medium tracking-tight mb-2 ${active ? 'text-2xl text-accent' : 'text-xl'}`}>{t(`band.${b}`)}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light min-h-[40px]">{t(`band.${b}.text`)}</p>
                </div>
                <div className="mb-8 pb-8 border-b border-white/10">
                  <span className="text-5xl font-medium tracking-tight font-mono">{String(list.length).padStart(2, '0')}</span>
                  <span className="text-[0.65rem] text-white/40 tracking-widest uppercase mt-2 block">
                    {t('inv.units')}{prices.length ? ` · ${t('inv.from')} ${money(Math.min(...prices))}` : ''}
                  </span>
                </div>
                <ul className="flex-grow space-y-4 mb-8">
                  {models.map(m => (
                    <li key={m} className="flex items-start space-x-3 text-sm text-white/70">
                      <iconify-icon icon="solar:check-circle-linear" class={`text-lg mt-0.5 ${active ? 'text-accent' : 'text-white/30'}`}></iconify-icon>
                      <span className="font-light">{m}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onPick(b)}
                  className={`w-full py-3 rounded-sm text-[0.65rem] tracking-widest uppercase transition-all duration-300 font-medium ${active ? 'bg-accent/10 text-accent border border-accent/50 hover:bg-accent hover:text-black' : 'border border-white/20 text-white/70 hover:bg-white hover:text-black'}`}
                >
                  {t('band.cta')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { useReveal } from '../hooks/useReveal';
import SectionHeader from '../components/SectionHeader';
import WhatsIcon from '../components/WhatsIcon';
import { useLang } from '../i18n';
import { waLink } from '../lib/inventory';
import { trackWhatsApp } from '../lib/track';

// Taxas informadas pelo Eder em 23/09/2026. Mudou? Troque aqui e rode o build.
export const RATES = { best: 6.9, newcomer: 9.99 };
export const rateText = (n, lang) => n.toLocaleString(lang === 'es' ? 'en-US' : 'pt-BR', { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 2 });

export default function Financing() {
  const { t, lang } = useLang();
  const gridRef = useReveal({ threshold: 0.2 });
  const cards = [
    { k: 'best', rate: RATES.best, icon: 'solar:graph-down-linear', active: true },
    { k: 'new', rate: RATES.newcomer, icon: 'solar:plain-linear', active: false },
  ];

  return (
    <section id="financiamento" className="w-full max-w-7xl py-32 px-6 relative border-b border-white/[0.05] scroll-mt-16">
      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/[0.03] -z-10"></div>
      <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white/[0.03] -z-10"></div>

      <SectionHeader number="04" kicker={t('fin.kicker')} title={t('fin.title')}>
        <p className="text-white/50 font-light max-w-xl mt-6">{t('fin.sub')}</p>
      </SectionHeader>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {cards.map((c, i) => (
          <div key={c.k} className={`clip-slide delay-${(i + 2) * 100}`}>
            <div className={`p-10 rounded-sm relative group h-full flex flex-col hover:-translate-y-1 transition-transform duration-300 ${c.active ? 'skeuo-card-active' : 'border border-white/10 skeuo-card hover:border-accent/30'}`}>
              <div className={`absolute -top-3 left-10 px-3 py-1 border text-[0.6rem] tracking-widest uppercase rounded-sm ${c.active ? 'bg-[#141820] text-accent border-accent/30' : 'bg-[#0b0d12] text-white border-white/10'}`}>
                {t(`fin.${c.k}`)}
              </div>
              <iconify-icon icon={c.icon} class={`text-4xl mb-8 ${c.active ? 'text-accent' : 'text-white/60'}`}></iconify-icon>
              <div className="text-[0.65rem] tracking-widest uppercase text-white/40 mb-2">{t('fin.from')}</div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className={`text-7xl md:text-8xl font-medium tracking-tighter text-white`}>{rateText(c.rate, lang)}<span className="text-accent">%</span></span>
              </div>
              <div className="text-[0.65rem] tracking-widest uppercase text-white/50 mb-8">{t('fin.apr')}*</div>
              <p className="text-sm text-white/55 font-light leading-relaxed pt-6 border-t border-white/10 mt-auto">{t(`fin.${c.k}.text`)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center mt-14 gap-8">
        <a
          href={waLink(t('fin.msg'))}
          target="_blank"
          rel="noopener"
          onClick={() => trackWhatsApp(null)}
          className="px-8 py-4 rounded-sm bg-accent/10 text-accent border border-accent/50 hover:bg-accent hover:text-black text-[0.7rem] tracking-widest uppercase font-semibold flex items-center gap-2 active:scale-[0.98] transition-all"
        >
          <WhatsIcon className="text-base" /> {t('fin.cta')}
        </a>
        <p className="max-w-3xl text-center text-[0.65rem] text-white/35 leading-relaxed">*{t('fin.disclaimer')}</p>
      </div>
    </section>
  );
}

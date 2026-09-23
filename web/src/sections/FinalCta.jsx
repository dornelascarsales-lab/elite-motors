import { useReveal } from '../hooks/useReveal';
import MaskedText from '../components/MaskedText';
import WhatsIcon from '../components/WhatsIcon';
import { useLang } from '../i18n';
import { waLink } from '../lib/inventory';
import { trackWhatsApp } from '../lib/track';

export default function FinalCta() {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <section ref={ref} className="w-full max-w-7xl px-6">
      <div className="relative overflow-hidden rounded-sm border border-accent/20 skeuo-card-active px-8 py-20 text-center flex flex-col items-center">
        <div className="absolute inset-0 opacity-[0.07] bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('./ram-hero.png')" }}></div>
        <h2 className="relative text-4xl md:text-6xl text-white font-medium tracking-tight mb-4">
          <MaskedText key={t('final.title')} text={t('final.title')} stagger={100} />
        </h2>
        <p className="relative text-white/55 font-light mb-10 clip-slide delay-300">{t('final.text')}</p>
        <a
          href={waLink(t('final.msg'))}
          target="_blank"
          rel="noopener"
          onClick={() => trackWhatsApp(null)}
          className="relative clip-slide delay-500 px-8 py-4 rounded-sm bg-accent text-black text-[0.7rem] tracking-widest uppercase font-semibold flex items-center gap-2 hover:bg-accent-soft active:scale-[0.98] transition-all"
        >
          <WhatsIcon className="text-base" /> {t('final.cta')}
        </a>
      </div>
    </section>
  );
}

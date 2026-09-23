import { useReveal } from '../hooks/useReveal';
import SectionHeader from '../components/SectionHeader';
import WhatsIcon from '../components/WhatsIcon';
import { useLang } from '../i18n';
import { waLink } from '../lib/inventory';
import { trackWhatsApp } from '../lib/track';

export default function HowItWorks() {
  const { t } = useLang();
  const gridRef = useReveal({ threshold: 0.2 });

  const steps = [
    { id: 1, icon: 'solar:magnifer-linear', iconColor: 'text-white/70 group-hover:text-white', active: false },
    { id: 2, icon: 'solar:chat-round-dots-linear', iconColor: 'text-accent drop-shadow-[0_0_15px_rgba(212,168,67,0.5)]', active: true },
    { id: 3, icon: 'solar:key-minimalistic-square-linear', iconColor: 'text-accent-soft/70 group-hover:text-accent-soft', active: false },
  ];
  const holodex = i => (i === 0 ? 'holodex-left' : i === 1 ? 'holodex-center' : 'holodex-right');

  return (
    <section id="como-funciona" className="w-full max-w-7xl py-32 px-6 relative border-b border-white/[0.05] scroll-mt-20">
      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/[0.03] -z-10"></div>
      <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white/[0.03] -z-10"></div>

      <SectionHeader number="05" kicker={t('how.kicker')} title={t('how.title')} />

      <div ref={gridRef} className="relative max-w-5xl mx-auto holodex-container">
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-white/20 clip-slide delay-200"></div>
        <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-white/20 clip-slide delay-300"></div>
        <div className="hidden md:block absolute top-12 left-[16.66%] w-px h-12 bg-white/20 clip-slide delay-400"></div>
        <div className="hidden md:block absolute top-12 left-1/2 w-px h-12 bg-white/20 -translate-x-1/2 clip-slide delay-400"></div>
        <div className="hidden md:block absolute top-12 right-[16.66%] w-px h-12 bg-white/20 clip-slide delay-400"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 md:pt-24">
          {steps.map((s, i) => (
            <div key={s.id} className={`${holodex(i)} clip-slide delay-${(i + 3) * 100} h-full`}>
              <div className={`holodex-item p-8 rounded-sm flex flex-col items-center text-center relative group h-full ${s.active ? 'skeuo-card-active px-10' : 'border border-white/5 skeuo-card'}`}>
                <div className={`absolute -top-3 px-2 border text-[0.6rem] tracking-widest uppercase rounded-sm z-20 ${s.active ? 'bg-[#141820] text-accent border-accent/30' : 'bg-[#0b0d12] text-white border-white/10'}`}>
                  {t(`how.${s.id}.badge`)}
                </div>
                <iconify-icon icon={s.icon} class={`mb-6 transition-colors ${s.iconColor} ${s.active ? 'text-6xl' : 'text-5xl'}`}></iconify-icon>
                <h3 className={`font-medium text-white tracking-tight mb-3 ${s.active ? 'text-2xl mb-4' : 'text-xl'}`}>{t(`how.${s.id}.title`)}</h3>
                <p className={`text-xs leading-relaxed font-light ${s.active ? 'text-white/60 mb-8' : 'text-white/50'}`}>{t(`how.${s.id}.text`)}</p>
                {s.active && (
                  <a
                    href={waLink(t('final.msg'))}
                    target="_blank"
                    rel="noopener"
                    onClick={() => trackWhatsApp(null)}
                    className="px-6 py-2 mt-auto border border-white/20 rounded-sm text-white text-[0.65rem] tracking-widest uppercase hover:bg-white hover:text-black transition-all relative z-20 flex items-center gap-2"
                  >
                    <WhatsIcon className="text-sm" /> {t('how.2.cta')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

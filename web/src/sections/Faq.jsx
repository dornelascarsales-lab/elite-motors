import { useState } from 'react';
import { useLang } from '../i18n';

export default function Faq() {
  const { t } = useLang();
  const [open, setOpen] = useState(0);
  const ids = [1, 2, 3, 4, 5];

  return (
    <div id="duvidas" className="w-full max-w-3xl px-6 py-24 flex flex-col relative z-10 mt-10 scroll-mt-20">
      <div className="mb-12 w-full text-center flex flex-col items-center">
        <div className="flex items-center space-x-4 mb-4 text-[0.65rem] tracking-widest uppercase text-accent font-medium">
          <span>07</span>
          <div className="w-12 h-px bg-accent/50"></div>
          <span>{t('faq.kicker')}</span>
        </div>
        <h2 className="text-3xl text-white font-medium tracking-tight">{t('faq.title')}</h2>
      </div>

      <div className="flex flex-col space-y-4 w-full">
        {ids.map((id, idx) => (
          <div key={id} className={`rounded-sm transition-all duration-300 overflow-hidden ${open === idx ? 'skeuo-card-active transform scale-[1.02] z-10' : 'border border-white/10 skeuo-card hover:border-white/20'}`}>
            <button onClick={() => setOpen(open === idx ? -1 : idx)} aria-expanded={open === idx} className="w-full px-6 py-5 flex items-center justify-between text-left gap-4">
              <span className={`font-medium tracking-wide transition-colors ${open === idx ? 'text-accent' : 'text-white/90'}`}>{t(`faq.${id}.q`)}</span>
              <iconify-icon icon="solar:alt-arrow-down-linear" class={`text-lg shrink-0 transition-transform duration-300 ${open === idx ? 'rotate-180 text-accent' : 'text-white/50'}`}></iconify-icon>
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${open === idx ? 'max-h-60 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-sm text-white/55 font-light leading-relaxed">{t(`faq.${id}.a`)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

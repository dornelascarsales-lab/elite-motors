import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useLang } from '../i18n';
import { waLink } from '../lib/inventory';
import { trackWhatsApp } from '../lib/track';
import WhatsIcon from './WhatsIcon';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: t('nav.inventory'), href: '#estoque' },
    { name: t('nav.order'), href: '#encomenda' },
    { name: t('fin.kicker'), href: '#financiamento' },
    { name: t('nav.clients'), href: '#clientes' },
    { name: t('nav.faq'), href: '#duvidas' },
  ];

  return (
    <nav className={clsx(
      'sticky top-0 w-full max-w-7xl px-6 flex items-center justify-between z-50 transition-all duration-300',
      scrolled
        ? 'py-4 bg-[#030303]/80 backdrop-blur-md border-b border-white/[0.1] shadow-lg'
        : 'py-6 bg-transparent border-b border-white/[0.05]'
    )}>
      <div className={clsx('absolute top-0 left-0 w-2 h-2 border-l border-t transition-colors duration-300', scrolled ? 'border-white/40' : 'border-white/20')}></div>
      <div className={clsx('absolute top-0 right-0 w-2 h-2 border-r border-t transition-colors duration-300', scrolled ? 'border-white/40' : 'border-white/20')}></div>

      <a href="#top" className="flex items-center space-x-3 group">
        <div className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-sm group-hover:border-accent/50 transition-colors">
          <iconify-icon icon="solar:wheel-angle-linear" class="text-xl text-white" width="20" height="20"></iconify-icon>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium tracking-wide uppercase leading-none group-hover:text-accent transition-colors">Elite Motors</span>
          <span className="text-[0.65rem] text-white/40 tracking-widest uppercase mt-0.5">{t('nav.tagline')}</span>
        </div>
      </a>

      <div className="hidden md:flex space-x-8 text-xs font-medium tracking-widest uppercase text-white/60">
        {links.map(l => (
          <a key={l.href} href={l.href} className="transition-colors hover:text-white">{l.name}</a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex border border-white/10 rounded-sm overflow-hidden text-[0.65rem] tracking-widest">
          {['pt', 'es'].map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={clsx('px-2.5 py-1.5 uppercase transition-colors', lang === l ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white')}
            >
              {l}
            </button>
          ))}
        </div>
        <a
          href={waLink(t('final.msg'))}
          target="_blank"
          rel="noopener"
          onClick={() => trackWhatsApp(null)}
          className="hidden sm:flex items-center gap-2 px-4 py-1.5 border border-accent/50 text-accent text-[0.65rem] tracking-widest uppercase rounded-sm hover:bg-accent hover:text-black transition-all"
        >
          <WhatsIcon className="text-sm" /> {t('cta.whatsapp')}
        </a>
      </div>
    </nav>
  );
}

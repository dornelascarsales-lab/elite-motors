import { useLang } from '../i18n';
import { waLink } from '../lib/inventory';
import { trackWhatsApp } from '../lib/track';
import WhatsIcon from './WhatsIcon';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="w-full max-w-7xl border-t border-white/[0.05] mt-20 relative bg-[#06080a] skeuo-card z-10">
      <div className="px-8 py-12 flex flex-col md:flex-row justify-between items-center border-b border-white/[0.02] gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-sm">
            <iconify-icon icon="solar:wheel-angle-linear" class="text-xl text-white"></iconify-icon>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium tracking-wide uppercase leading-none">Elite Motors</span>
            <span className="text-[0.65rem] text-white/40 tracking-widest uppercase mt-0.5">{t('nav.tagline')}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium tracking-wide text-white/60">
          <a href="#estoque" className="hover:text-white transition-colors">{t('nav.inventory')}</a>
          <a href="#como-funciona" className="hover:text-white transition-colors">{t('nav.how')}</a>
          <a href="#clientes" className="hover:text-white transition-colors">{t('nav.clients')}</a>
          <a href="#duvidas" className="hover:text-white transition-colors">{t('nav.faq')}</a>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.65rem] text-white/40 tracking-widest uppercase">
        <a
          href={waLink(t('final.msg'))}
          target="_blank"
          rel="noopener"
          onClick={() => trackWhatsApp(null)}
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          <WhatsIcon className="text-lg" /> +1 (689) 244-6424
        </a>
        <span className="text-center normal-case tracking-wide">{t('footer.note')}</span>
        <span>&copy; {new Date().getFullYear()} Elite Motors. {t('footer.rights')}</span>
      </div>
    </footer>
  );
}

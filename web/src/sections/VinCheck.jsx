import { useLang } from '../i18n';

// 04/10/2026: relatório de histórico pelo VIN (VinCheckup, link de afiliado do Eder no ClickBank).
// 04/10: o Eder pediu pra tirar o aviso de afiliado debaixo do botão (avisado do risco FTC/ClickBank).
// O botão passa pelo link curto /relatorio/?origem=site, que guarda o rastreio "site" no ClickBank.
export const VIN_LINK = './relatorio/?origem=site';

export default function VinCheck() {
  const { t } = useLang();
  return (
    <section id="relatorio-vin" className="w-full max-w-7xl px-6 py-20 relative border-b border-white/[0.05] scroll-mt-16">
      <div className="max-w-4xl mx-auto skeuo-card border border-white/10 rounded-sm p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8">
        <iconify-icon icon="solar:document-text-linear" class="text-5xl text-accent shrink-0"></iconify-icon>
        <div className="flex-1">
          <div className="text-[0.65rem] tracking-widest uppercase text-accent mb-3">{t('vin.kicker')}</div>
          <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-3">{t('vin.title')}</h3>
          <p className="text-white/55 font-light leading-relaxed">{t('vin.sub')}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
          <a
            href={VIN_LINK}
            target="_blank"
            rel="noopener sponsored"
            className="px-8 py-4 rounded-sm bg-accent text-black text-[0.7rem] tracking-widest uppercase font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all"
          >
            {t('vin.cta')}
          </a>
        </div>
      </div>
    </section>
  );
}

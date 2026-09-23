import { useReveal } from '../hooks/useReveal';
import SectionHeader from '../components/SectionHeader';
import { useLang } from '../i18n';

export default function WhyUs({ vehicles }) {
  const { t } = useLang();
  const gridRef = useReveal({ threshold: 0.1 });
  const van = vehicles.find(v => /transit|promaster/i.test(v.model) && v.photos?.length);

  const items = [
    { id: 1, icon: 'solar:chat-square-like-linear', span: 'md:col-span-2', image: './cliente5.jpg' },
    { id: 2, icon: 'solar:refresh-circle-linear', span: 'md:col-span-1' },
    { id: 3, icon: 'solar:box-linear', span: 'md:col-span-1' },
    { id: 4, icon: 'solar:map-arrow-right-linear', span: 'md:col-span-2', image: van?.photos[0] || './cliente7.jpg' },
  ];

  return (
    <section className="w-full max-w-7xl py-32 px-6 relative border-b border-white/[0.05]">
      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/[0.03] -z-10"></div>
      <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white/[0.03] -z-10"></div>

      <SectionHeader number="06" kicker={t('why.kicker')} title={t('why.title')} />

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {items.map((f, idx) => (
          <div key={f.id} className={`clip-slide delay-${(idx + 1) * 100} ${f.span}`}>
            <div className="group relative overflow-hidden p-8 rounded-sm border border-white/5 skeuo-card hover:-translate-y-2 transition-all duration-300 h-full min-h-[240px]">
              {f.image && (
                <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none">
                  <img src={f.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
              )}
              <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
                <div>
                  <div className="w-12 h-12 rounded-sm border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6 group-hover:border-accent/30 group-hover:bg-accent/10 transition-colors">
                    <iconify-icon icon={f.icon} class="text-2xl text-white/70 group-hover:text-accent transition-colors"></iconify-icon>
                  </div>
                  <h3 className="text-2xl text-white font-medium tracking-tight mb-3 group-hover:text-accent transition-colors">{t(`why.${f.id}.title`)}</h3>
                  <p className="text-sm text-white/55 leading-relaxed font-light max-w-md">{t(`why.${f.id}.text`)}</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

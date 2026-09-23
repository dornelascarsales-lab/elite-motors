import { useReveal } from '../hooks/useReveal';
import MaskedText from '../components/MaskedText';
import { useLang } from '../i18n';
import { money } from '../lib/inventory';
import { RATES, rateText } from './Financing';

export default function Hero({ vehicles }) {
  const { t, lang } = useLang();
  const revealRef = useReveal();
  const prices = vehicles.map(v => v.priceValue).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;

  return (
    <section
      id="top"
      ref={revealRef}
      className="w-full max-w-7xl min-h-[90vh] relative flex items-center border-b border-white/[0.05] overflow-hidden py-16 md:py-0"
    >
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/20 z-20"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20 z-20"></div>

      <div className="relative md:absolute md:inset-0 grid grid-cols-12 gap-6 px-6 h-full items-center w-full">

        {/* Visual */}
        <div className="col-span-12 md:col-span-7 order-2 md:order-1 flex h-full relative items-center justify-center clip-slide delay-200">
          <div className="relative w-[370px] h-[370px] sm:w-[540px] sm:h-[540px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-accent opacity-[0.06] blur-3xl animate-pulse"></div>

            <div
              className="absolute w-[330px] h-[330px] sm:w-[470px] sm:h-[470px] rounded-full border border-white/[0.05] bg-gradient-to-br from-white/[0.02] to-transparent"
              style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 20px 50px rgba(0,0,0,0.5)' }}
            ></div>

            <div className="absolute w-[270px] h-[270px] sm:w-[390px] sm:h-[390px] rounded-full border border-white/10 skeuo-card overflow-hidden group">
              <img
                src="./ram-hero.png"
                className="absolute inset-0 w-full h-full object-cover object-[46%_55%] scale-[1.08] grayscale-[35%] contrast-110 group-hover:scale-[1.15] transition-transform duration-1000"
                alt="RAM 1500 preta"
              />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 50px 12px rgba(3,3,3,0.8)' }}></div>
            </div>

            <div className="absolute right-[4%] sm:right-[8%] top-1/2 -translate-y-1/2 flex -space-x-2 z-10 animate-bounce">
              <iconify-icon icon="solar:double-alt-arrow-right-linear" class="text-5xl sm:text-6xl text-accent opacity-80"></iconify-icon>
              <iconify-icon icon="solar:double-alt-arrow-right-linear" class="text-5xl sm:text-6xl text-white"></iconify-icon>
            </div>

            <a href="#encomenda" className="absolute top-6 sm:top-10 right-0 sm:right-4 flex items-center gap-2 px-3 py-1.5 border border-accent/40 bg-[#141820]/80 backdrop-blur rounded-sm text-[0.6rem] tracking-widest uppercase text-accent hover:bg-accent hover:text-black transition-colors z-10">
              <iconify-icon icon="solar:magnifer-linear"></iconify-icon> {t('order.heroTag')}
            </a>

            <a href="#estoque" className="absolute bottom-4 sm:bottom-10 left-2 sm:left-10 flex items-center space-x-3 text-xs tracking-wider uppercase group">
              <div className="w-6 h-6 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              </div>
              <span className="text-white/60 group-hover:text-white transition-colors whitespace-pre-line">
                <span className="text-white font-mono">{vehicles.length || '—'}</span> {t('hero.label')}
              </span>
            </a>
          </div>
        </div>

        {/* Texto */}
        <div className="col-span-12 md:col-span-5 order-1 md:order-2 flex flex-col justify-center relative z-10">
          <div className="flex items-center space-x-4 mb-4 clip-slide delay-100">
            <span className="text-2xl font-light text-accent">01</span>
            <div className="w-8 h-px bg-white/20"></div>
            <span className="text-[0.65rem] tracking-widest uppercase text-white/50">{t('hero.kicker')}</span>
          </div>

          <h1 className="leading-[1.1] md:text-6xl text-5xl font-medium text-white tracking-tight mb-6">
            <MaskedText key={t('hero.title')} text={t('hero.title')} delayStart={300} stagger={90} />
          </h1>

          <p className="text-white/55 font-light leading-relaxed max-w-md mb-10 clip-slide delay-500">{t('hero.sub')}</p>

          <div className="flex flex-wrap items-center gap-6 clip-slide delay-700">
            <a href="#estoque" className="text-xs font-semibold tracking-widest uppercase text-white hover:text-accent transition-colors border-b border-accent pb-1 flex items-center gap-2 group">
              {t('hero.primary')}
              <iconify-icon icon="solar:arrow-right-linear" class="transform group-hover:translate-x-1 transition-transform"></iconify-icon>
            </a>
            <a
              href="#encomenda"
              className="px-5 py-2.5 border border-white/20 rounded-sm text-white text-[0.65rem] tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center gap-2"
            >
              <iconify-icon icon="solar:magnifer-linear" class="text-sm"></iconify-icon> {t('order.heroCta')}
            </a>
          </div>

          {minPrice && (
            <div className="mt-12 flex gap-10 clip-slide delay-800">
              <div>
                <div className="text-[0.6rem] tracking-widest uppercase text-white/40 mb-1">{t('hero.from')}</div>
                <div className="font-mono text-xl text-white">{money(minPrice)}<span className="text-accent">*</span></div>
              </div>
              <a href="#financiamento" className="group">
                <div className="text-[0.6rem] tracking-widest uppercase text-white/40 mb-1">{t('hero.rate')}</div>
                <div className="font-mono text-xl text-white flex items-center gap-2 group-hover:text-accent transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> {rateText(RATES.best, lang)}% APR<span className="text-accent">*</span>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-white/10 flex clip-slide delay-800">
        <div className="w-1/3 h-full bg-accent-deep"></div>
        <div className="w-1/4 h-full bg-accent"></div>
      </div>
    </section>
  );
}

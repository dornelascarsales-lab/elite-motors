import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';
import { miles, money, trimOf, waLink } from '../lib/inventory';
import { trackCardView, trackPhotoClick, trackWhatsApp } from '../lib/track';
import WhatsIcon from './WhatsIcon';

export function carMessage(t, car) {
  return t('car.msg', { title: car.title, price: money(car.priceValue) || t('car.call'), stock: car.stock });
}

export default function CarCard({ car, onOpen }) {
  const { t } = useLang();
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const photos = car.photos || [];

  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { trackCardView(car); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [car]);

  const go = dir => {
    const el = trackRef.current;
    const next = (idx + dir + photos.length) % photos.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    trackPhotoClick(car);
  };
  const onScroll = e => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth));

  return (
    <article ref={ref} className="group rounded-sm border border-white/5 skeuo-card overflow-hidden flex flex-col hover:border-accent/30 hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[4/3] bg-black/40">
        {photos.length ? (
          <div ref={trackRef} onScroll={onScroll} className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {photos.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${car.title} — foto ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover shrink-0 snap-start cursor-pointer"
                onClick={() => onOpen(car)}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[0.65rem] tracking-widest uppercase text-white/30">Coming soon</div>
        )}

        {car.wasPrice && (
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#141820] border border-accent/40 text-accent text-[0.6rem] tracking-widest uppercase rounded-sm">{t('car.sale')}</span>
        )}
        {photos.length > 1 && (
          <>
            <button aria-label="Foto anterior" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-sm bg-black/50 backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              <iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon>
            </button>
            <button aria-label="Próxima foto" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-sm bg-black/50 backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon>
            </button>
            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 font-mono text-[0.6rem] text-white/80 rounded-sm">{idx + 1}/{photos.length}</span>
          </>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-[0.6rem] tracking-widest uppercase text-white/40 mb-2 font-mono">
          <span className="text-accent">{car.year}</span>
          <span className="w-4 h-px bg-white/20"></span>
          <span>{miles(car.mileage)}</span>
          {car.drivetrain && <><span className="w-4 h-px bg-white/20"></span><span>{car.drivetrain}</span></>}
        </div>
        <h3 className="text-xl text-white font-medium tracking-tight leading-snug group-hover:text-accent transition-colors">{car.make} {car.model}</h3>
        <p className="text-xs text-white/45 font-light mt-1 line-clamp-1">{trimOf(car) || ' '}</p>

        <div className="mt-5 pt-5 border-t border-white/10 flex items-end justify-between gap-3 mt-auto">
          <div>
            {car.wasPrice && <div className="font-mono text-xs text-white/35 line-through">{money(car.wasPrice)}</div>}
            <div className="font-mono text-2xl text-white tracking-tight">
              {money(car.priceValue) ? <>{money(car.priceValue)}<span className="text-accent text-base">*</span></> : <span className="text-lg text-white/70">{t('car.call')}</span>}
            </div>
          </div>
          <button onClick={() => onOpen(car)} className="text-[0.6rem] tracking-widest uppercase text-white/60 hover:text-white border-b border-white/20 hover:border-accent pb-0.5 transition-colors">
            {t('car.details')}
          </button>
        </div>

        <a
          href={waLink(carMessage(t, car))}
          target="_blank"
          rel="noopener"
          onClick={() => trackWhatsApp(car)}
          className="mt-5 w-full py-3 rounded-sm text-[0.65rem] tracking-widest uppercase font-medium flex items-center justify-center gap-2 bg-accent/10 text-accent border border-accent/50 hover:bg-accent hover:text-black active:scale-[0.98] transition-all duration-300"
        >
          <WhatsIcon className="text-sm" /> {t('car.want')}
        </a>
      </div>
    </article>
  );
}

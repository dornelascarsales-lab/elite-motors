import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';
import { miles, money, trimOf, waLink } from '../lib/inventory';
import { trackPhotoClick, trackWhatsApp } from '../lib/track';
import { carMessage } from './CarCard';
import WhatsIcon from './WhatsIcon';

export default function CarDialog({ car, onClose }) {
  const { t } = useLang();
  const dlg = useRef(null);
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    setPhoto(0);
    if (car) dlg.current?.showModal();
    else dlg.current?.close();
  }, [car]);

  if (!car) return <dialog ref={dlg} />;

  const photos = car.photos || [];
  const specs = [
    ['car.year', car.year],
    ['car.miles', miles(car.mileage)],
    ['car.engine', car.engine],
    ['car.drive', car.drivetrain],
    ['car.trans', car.transmission],
    ['car.fuel', car.fuel],
    ['car.mpg', car.mpg],
    ['car.color', car.color],
    ['car.interior', car.interior],
    ['car.stock', car.stock],
    ['car.vin', car.vin],
  ].filter(([, v]) => v);

  return (
    <dialog
      ref={dlg}
      onClose={onClose}
      onClick={e => e.target === dlg.current && onClose()}
      className="bg-transparent p-0 m-auto w-[min(1100px,96vw)] max-h-[94dvh] backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="skeuo-card border border-white/10 rounded-sm text-white grid md:grid-cols-5 max-h-[94dvh] overflow-y-auto">
        <div className="md:col-span-3 bg-black/50 flex flex-col">
          <div className="relative aspect-[4/3] md:aspect-auto md:flex-1 md:min-h-[440px]">
            {photos[photo] && <img src={photos[photo]} alt={`${car.title} — foto ${photo + 1}`} className="absolute inset-0 w-full h-full object-cover" />}
            {photos.length > 1 && (
              <>
                <button aria-label="Foto anterior" onClick={() => { setPhoto((photo - 1 + photos.length) % photos.length); trackPhotoClick(car); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-sm bg-black/60 border border-white/10 hover:border-accent/50">
                  <iconify-icon icon="solar:alt-arrow-left-linear" class="text-xl"></iconify-icon>
                </button>
                <button aria-label="Próxima foto" onClick={() => { setPhoto((photo + 1) % photos.length); trackPhotoClick(car); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-sm bg-black/60 border border-white/10 hover:border-accent/50">
                  <iconify-icon icon="solar:alt-arrow-right-linear" class="text-xl"></iconify-icon>
                </button>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 font-mono text-xs rounded-sm">{photo + 1}/{photos.length}</span>
              </>
            )}
          </div>
          <div className="flex gap-1.5 p-2 overflow-x-auto no-scrollbar">
            {photos.map((src, i) => (
              <button key={src} onClick={() => setPhoto(i)} className={`shrink-0 w-16 h-12 rounded-sm overflow-hidden border ${i === photo ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 p-8 flex flex-col relative">
          <button onClick={onClose} aria-label={t('car.close')} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-white/10 rounded-sm text-white/60 hover:text-white hover:border-white/30">
            <iconify-icon icon="solar:close-square-linear" class="text-lg"></iconify-icon>
          </button>
          <div className="text-[0.65rem] tracking-widest uppercase text-accent font-mono mb-2">{car.year} · {car.body}</div>
          <h3 className="text-3xl font-medium tracking-tight pr-10">{car.make} {car.model}</h3>
          <p className="text-sm text-white/50 font-light mt-1">{trimOf(car)}</p>

          <div className="my-6 pb-6 border-b border-white/10">
            {car.wasPrice && <div className="font-mono text-sm text-white/35 line-through">{t('car.was')} {money(car.wasPrice)}</div>}
            <div className="font-mono text-4xl tracking-tight">
              {money(car.priceValue) ? <>{money(car.priceValue)}<span className="text-accent text-xl">*</span></> : <span className="text-2xl text-white/70">{t('car.call')}</span>}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-8">
            {specs.map(([k, v]) => (
              <div key={k} className={k === 'car.vin' || k === 'car.engine' ? 'col-span-2' : ''}>
                <dt className="text-[0.6rem] tracking-widest uppercase text-white/35">{t(k)}</dt>
                <dd className="text-white/85 font-light break-all">{v}</dd>
              </div>
            ))}
          </dl>

          <a
            href={waLink(carMessage(t, car))}
            target="_blank"
            rel="noopener"
            onClick={() => trackWhatsApp(car)}
            className="mt-auto w-full py-3.5 rounded-sm text-[0.7rem] tracking-widest uppercase font-medium flex items-center justify-center gap-2 bg-accent text-black hover:bg-accent-soft active:scale-[0.98] transition-all"
          >
            <WhatsIcon className="text-base" /> {t('car.want')}
          </a>
          <p className="text-[0.65rem] text-white/35 leading-relaxed mt-4">{t('inv.disclaimer')}</p>
        </div>
      </div>
    </dialog>
  );
}

import { useReveal } from '../hooks/useReveal';
import { useLang } from '../i18n';

// Depoimentos do site antigo (fotos cliente1..9.jpg na raiz do repo)
const REVIEWS = [
  { img: 'cliente1.jpg', name: 'Carlos M.', pt: 'Comprei no conforto da minha casa. O Eder cuidou de tudo, desde a escolha até a entrega.', es: 'Compré desde la comodidad de mi casa. Eder se encargó de todo, desde la elección hasta la entrega.' },
  { img: 'cliente7.jpg', name: 'Marcos A.', pt: 'O Eder mandou entregar minha F-250 aqui em Nova York, na porta da minha casa. Não precisei sair de casa pra nada.', es: 'Eder mandó entregar mi F-250 aquí en Nueva York, en la puerta de mi casa. No tuve que salir para nada.' },
  { img: 'cliente2.jpg', name: 'Rafael S.', pt: 'Pode confiar. O Eder entregou a truck na porta da minha casa, exatamente como combinado.', es: 'Pueden confiar. Eder entregó la troca en la puerta de mi casa, exactamente como lo acordado.' },
  { img: 'cliente3.jpg', name: 'Diego L.', pt: 'O Eder é muito honesto, me entregou o carro conforme combinado. Sem surpresas.', es: 'Eder es muy honesto, me entregó el carro como lo acordado. Sin sorpresas.' },
  { img: 'cliente4.jpg', name: 'Thiago R.', pt: 'Me ajudou a encontrar a truck perfeita e entregou rapidinho. Nota 10.', es: 'Me ayudó a encontrar la troca perfecta y la entregó rapidísimo. Nota 10.' },
  { img: 'cliente5.jpg', name: 'Anderson P.', pt: 'Minha RAM ficou incrível. Transparente e cumpre o que promete. Já indiquei pra vários amigos.', es: 'Mi RAM quedó increíble. Transparente y cumple lo que promete. Ya lo recomendé a varios amigos.' },
  { img: 'cliente6.jpg', name: 'Lucas F.', pt: 'Comprei minha RAM Rebel com o Eder e foi tudo perfeito. Atendimento em português faz toda a diferença.', es: 'Compré mi RAM Rebel con Eder y todo fue perfecto. La atención en tu idioma hace toda la diferencia.' },
  { img: 'cliente8.jpg', name: 'Bruno G.', pt: 'Mais uma entrega pro Colorado. O Eder resolve tudo, não importa a distância.', es: 'Otra entrega a Colorado. Eder resuelve todo, sin importar la distancia.' },
  { img: 'cliente9.jpg', name: 'José Guilherme', pt: 'Comprei meu Mitsubishi com o Eder e foi a melhor decisão. Honesto, rápido e entregou impecável.', es: 'Compré mi Mitsubishi con Eder y fue la mejor decisión. Honesto, rápido y entregó impecable.' },
];

export default function Clients() {
  const { t, lang } = useLang();
  const headerRef = useReveal();
  const gridRef = useReveal({ threshold: 0.1 });
  const wallRef = useReveal({ threshold: 0.05 });
  const [a, b, ...rest] = REVIEWS;

  return (
    <section id="clientes" className="w-full max-w-7xl py-32 px-6 relative border-b border-white/[0.05] scroll-mt-20">
      <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 reveal-up gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-4 text-[0.65rem] tracking-widest uppercase text-accent font-medium">
            <span>08</span>
            <div className="w-12 h-px bg-accent/50"></div>
            <span>{t('clients.kicker')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white font-medium tracking-tight">
            {t('clients.title')}<br /><span className="text-accent">{t('clients.titleAccent')}</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 text-white/50 border-b border-white/10 pb-2 w-full md:w-1/3 justify-end text-[0.65rem] tracking-widest uppercase">
          <span className="text-accent">★★★★★</span> NY · CO · FL
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-up">
        <article className="md:col-span-8 flex flex-col h-full">
          <div className="w-full aspect-[16/9] overflow-hidden rounded-sm border border-white/10 mb-6 relative bg-black">
            <video src="./video-eder.mp4" controls playsInline preload="metadata" poster="./cliente5.jpg" className="w-full h-full object-contain"></video>
          </div>
          <div className="text-[0.65rem] text-accent tracking-widest uppercase mb-3">Eder Dornelas</div>
          <h3 className="text-2xl text-white font-medium tracking-tight mb-3">{t('clients.video')}</h3>
          <p className="text-sm text-white/50 font-light leading-relaxed max-w-2xl">{t('clients.videoText')}</p>
        </article>

        <div className="md:col-span-4 flex flex-col gap-8">
          {[a, b].map(r => (
            <article key={r.img} className="group">
              <div className="w-full aspect-video overflow-hidden rounded-sm border border-white/10 mb-4">
                <img src={`./${r.img}`} alt={`${r.name}, cliente da Elite Motors`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
              </div>
              <div className="text-[0.65rem] text-white/40 tracking-widest uppercase mb-2">{r.name}</div>
              <p className="text-base text-white/85 font-light leading-snug">“{r[lang]}”</p>
            </article>
          ))}
        </div>
      </div>

      <div ref={wallRef} className="columns-1 sm:columns-2 lg:columns-4 gap-6 mt-16 reveal-up">
        {rest.map(r => (
          <figure key={r.img} className="break-inside-avoid mb-6 rounded-sm border border-white/5 skeuo-card overflow-hidden group">
            <img src={`./${r.img}`} alt={`${r.name}, cliente da Elite Motors`} loading="lazy" className="w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            <figcaption className="p-5">
              <div className="text-accent text-xs mb-2">★★★★★</div>
              <p className="text-sm text-white/70 font-light leading-relaxed mb-3">“{r[lang]}”</p>
              <span className="text-[0.6rem] tracking-widest uppercase text-white/40">{r.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

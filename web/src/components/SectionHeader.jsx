import { useReveal } from '../hooks/useReveal';
import MaskedText from './MaskedText';

export default function SectionHeader({ number, kicker, title, align = 'center', children }) {
  const ref = useReveal();
  const centered = align === 'center';
  return (
    <div ref={ref} className={centered ? 'text-center mb-16 flex flex-col items-center' : 'mb-12'}>
      <div className={`flex items-center space-x-4 mb-4 text-[0.65rem] tracking-widest uppercase text-accent font-medium clip-slide delay-100 ${centered ? 'justify-center' : ''}`}>
        <span>{number}</span>
        <div className="w-12 h-px bg-accent/50"></div>
        <span>{kicker}</span>
      </div>
      <h2 className="text-4xl md:text-5xl text-white font-medium tracking-tight">
        <MaskedText key={title} text={title} delayStart={200} stagger={90} />
      </h2>
      {children}
    </div>
  );
}

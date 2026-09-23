import { useMemo } from 'react';

export default function MaskedText({ text, className = "", delayStart = 0, stagger = 100 }) {
  // Split by newline to preserve explicit line breaks
  const lines = useMemo(() => text.split('\n'), [text]);
  
  let wordIndex = 0;

  return (
    <span className={`block ${className}`}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.split(' ').map((word, i) => {
            if (!word) return null;
            const currentIdx = wordIndex++;
            return (
              <span key={`${lineIdx}-${i}`} className="word-mask mr-[0.3em] inline-block">
                <span 
                  className="word-inner inline-block"
                  style={{ transitionDelay: `${delayStart + currentIdx * stagger}ms` }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
import { useState, useEffect, useRef } from 'react';

interface Props {
  text: string;
  speed?: number;
  className?: string;
}

export function StreamingText({ text, speed = 18, className = '' }: Props) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    if (textRef.current !== text) {
      textRef.current = text;
      indexRef.current = 0;
      setDisplayed('');
    }

    if (indexRef.current >= text.length) return;

    const timer = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  const done = displayed.length >= text.length;

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span className="animate-blink" aria-hidden>▍</span>
      )}
    </span>
  );
}

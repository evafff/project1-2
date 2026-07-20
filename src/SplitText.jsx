import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function SplitText({
  text = '',
  className = '',
  delay = 50,
  duration = 0.6,
  ease = 'easeOut',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'left',
  tag: Component = 'span',
  onLetterAnimationComplete,
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const segments = useMemo(() => {
    if (splitType === 'words') return text.split(' ');
    return text.split('');
  }, [splitType, text]);

  useEffect(() => {
    if (!ref.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Component
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        textAlign,
        whiteSpace: 'normal',
      }}
    >
      {segments.map((segment, index) => (
        <motion.span
          className="split-char"
          key={`${segment}-${index}`}
          initial={from}
          animate={inView ? to : from}
          transition={{
            delay: (index * delay) / 1000,
            duration,
            ease,
          }}
          onAnimationComplete={
            index === segments.length - 1 ? onLetterAnimationComplete : undefined
          }
        >
          {segment === ' ' ? '\u00A0' : segment}
          {splitType === 'words' && index < segments.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </Component>
  );
}

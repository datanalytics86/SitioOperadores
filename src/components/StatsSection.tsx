'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

const STATS: Stat[] = [
  { label: 'Operadores registrados', value: 1800, prefix: '+' },
  { label: 'Vacantes activas', value: 420 },
  { label: 'Satisfacción', value: 96, suffix: '%' },
  { label: 'Horas promedio para match', value: 48, suffix: 'h' },
];

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);

  return count;
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active);
  return (
    <div className="text-center">
      <p className="text-5xl sm:text-6xl font-display text-faena mb-2">
        {stat.prefix}{count.toLocaleString('es-CL')}{stat.suffix}
      </p>
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-ink-700 border-y border-ink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Números que hablan</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">La plataforma más grande del rubro</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}

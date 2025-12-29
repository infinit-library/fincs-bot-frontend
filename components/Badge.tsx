import type { ReactNode } from 'react';

type Props = {
  label: string;
  tone?: 'accent' | 'warn' | 'muted' | 'neutral';
  leading?: ReactNode;
};

export default function Badge({ label, tone = 'neutral', leading }: Props) {
  const toneClass = tone === 'neutral' ? '' : tone;
  return <span className={`badge ${toneClass}`}>{leading}{label}</span>;
}

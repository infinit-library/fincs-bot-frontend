import type { ReactNode } from 'react';
import Badge from './Badge';

type Tone = 'accent' | 'warn' | 'muted' | 'neutral';

type Props = {
  title: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
  meta?: ReactNode;
};

export default function StatusCard({ title, value, hint, tone = 'neutral', meta }: Props) {
  const badgeTone = tone === 'neutral' ? undefined : tone;
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {hint && <div className="hint">{hint}</div>}
      {meta && <div className="tag">{meta}</div>}
      {tone !== 'neutral' && !meta && (
        <div className="tag">
          <Badge label={tone === 'accent' ? 'Healthy' : tone === 'warn' ? 'Attention' : 'Info'} tone={badgeTone as any} />
        </div>
      )}
    </div>
  );
}

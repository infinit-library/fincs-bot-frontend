import Badge from '@/components/Badge';
import DataTable, { Column } from '@/components/DataTable';
import { getSignals } from '@/lib/api';
import type { Signal } from '@/lib/types';

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

const fallbackSignals: Signal[] = [
  {
    detected_at: new Date().toISOString(),
    pair: 'USDJPY',
    action: 'ENTRY',
    side: 'LONG',
    size_ratio: 0.2,
    is_additional: false,
    source_text: 'USDJPY LONG 0.2 add on pullback',
  },
];

export default async function SignalsPage() {
  const signals = await getSignals().catch(() => fallbackSignals);

  const columns: Column<Signal>[] = [
    { header: 'Detected', render: (item) => formatTime(item.detected_at) },
    { header: 'Pair', render: (item) => <span className="mono">{item.pair}</span> },
    { header: 'Action', render: (item) => <Badge label={item.action} tone={item.action === 'ENTRY' ? 'accent' : 'muted'} /> },
    { header: 'Side', render: (item) => <Badge label={item.side} tone={item.side === 'LONG' ? 'accent' : 'warn'} /> },
    { header: 'Size', render: (item) => `${(item.size_ratio * 100).toFixed(1)}%${item.is_additional ? ' add' : ''}` },
    {
      header: 'Source',
      render: (item) => (
        <details>
          <summary>view</summary>
          <div className="note">{item.source_text}</div>
        </details>
      ),
    },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Signals</h1>
          <p className="lede">Parsed trading instructions for human verification.</p>
        </div>
        <Badge label={`Count: ${signals.length}`} tone="muted" />
      </div>

      <DataTable columns={columns} items={signals} emptyMessage="No signals yet" />
    </main>
  );
}

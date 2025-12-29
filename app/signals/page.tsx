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
    source_text: 'USDJPY ロング 0.2 追随',
  },
];

export default async function SignalsPage() {
  const signals = await getSignals().catch(() => fallbackSignals);

  const columns: Column<Signal>[] = [
    { header: '検出時刻', render: (item) => formatTime(item.detected_at) },
    { header: '通貨ペア', render: (item) => <span className="mono">{item.pair}</span> },
    { header: '区分', render: (item) => <Badge label={item.action} tone={item.action === 'ENTRY' ? 'accent' : 'muted'} /> },
    { header: '方向', render: (item) => <Badge label={item.side} tone={item.side === 'LONG' ? 'accent' : 'warn'} /> },
    { header: 'ロット比率', render: (item) => `${(item.size_ratio * 100).toFixed(1)}%${item.is_additional ? ' 追加' : ''}` },
    {
      header: '元テキスト',
      render: (item) => (
        <details>
          <summary>表示</summary>
          <div className="note">{item.source_text}</div>
        </details>
      ),
    },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>シグナル一覧</h1>
          <p className="lede">解析済みトレード指示の確認。</p>
        </div>
        <Badge label={`件数: ${signals.length}`} tone="muted" />
      </div>

      <DataTable columns={columns} items={signals} emptyMessage="シグナルはまだありません" />
    </main>
  );
}

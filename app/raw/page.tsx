import Badge from '@/components/Badge';
import DataTable, { Column } from '@/components/DataTable';
import { getRaw } from '@/lib/api';
import type { RawCapture } from '@/lib/types';

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

const fallbackRaw: RawCapture[] = [
  {
    captured_at: new Date().toISOString(),
    channel_name: 'fincs-alpha',
    raw_text: 'Sample raw channel capture for audit trail.',
    hash: 'demo-hash',
    processed: true,
  },
];

export default async function RawPage() {
  const raw = await getRaw().catch(() => fallbackRaw);

  const columns: Column<RawCapture>[] = [
    { header: '取得時刻', render: (item) => formatTime(item.captured_at) },
    { header: 'チャンネル', render: (item) => <span className="mono">{item.channel_name}</span> },
    { header: 'ハッシュ', render: (item) => <span className="mono">{item.hash}</span> },
    { header: '解析済み', render: (item) => <Badge label={item.processed ? '済' : '未'} tone={item.processed ? 'accent' : 'warn'} /> },
    {
      header: '取得テキスト',
      render: (item) => (
        <details>
          <summary>表示</summary>
          <div className="note">{item.raw_text}</div>
        </details>
      ),
    },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>RAWフィード</h1>
          <p className="lede">チャンネル本文の監査用キャプチャ。</p>
        </div>
        <Badge label={`件数: ${raw.length}`} tone="muted" />
      </div>

      <DataTable columns={columns} items={raw} emptyMessage="まだ取得がありません" />
    </main>
  );
}

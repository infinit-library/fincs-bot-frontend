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
    { header: 'Captured', render: (item) => formatTime(item.captured_at) },
    { header: 'Channel', render: (item) => <span className="mono">{item.channel_name}</span> },
    { header: 'Hash', render: (item) => <span className="mono">{item.hash}</span> },
    { header: 'Processed', render: (item) => <Badge label={item.processed ? 'Yes' : 'No'} tone={item.processed ? 'accent' : 'warn'} /> },
    {
      header: 'Raw text',
      render: (item) => (
        <details>
          <summary>view</summary>
          <div className="note">{item.raw_text}</div>
        </details>
      ),
    },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Raw feed</h1>
          <p className="lede">Auditable capture of the channel text.</p>
        </div>
        <Badge label={`Count: ${raw.length}`} tone="muted" />
      </div>

      <DataTable columns={columns} items={raw} emptyMessage="No raw captures yet" />
    </main>
  );
}

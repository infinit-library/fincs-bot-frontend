import Badge from '@/components/Badge';
import DataTable, { Column } from '@/components/DataTable';
import { getActions } from '@/lib/api';
import type { ActionRecord } from '@/lib/types';

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

const fallbackActions: ActionRecord[] = [
  {
    created_at: new Date().toISOString(),
    action_type: 'NEW',
    broker: 'SIMULATION',
    status: 'PENDING',
    error_message: null,
  },
];

export default async function ActionsPage() {
  const actions = await getActions().catch(() => fallbackActions);

  const columns: Column<ActionRecord>[] = [
    { header: '作成時刻', render: (item) => formatTime(item.created_at) },
    { header: 'アクション', render: (item) => <Badge label={item.action_type} tone="accent" /> },
    { header: 'ブローカー', render: (item) => <span className="mono">{item.broker}</span> },
    {
      header: 'ステータス',
      render: (item) => {
        const tone = item.status === 'FAILED' ? 'warn' : item.status === 'PENDING' ? 'muted' : 'accent';
        return <Badge label={item.status} tone={tone as any} />;
      },
    },
    { header: 'エラー', render: (item) => item.error_message ?? '-' },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>アクション</h1>
          <p className="lede">実行キューと重複防止の監視。</p>
        </div>
        <Badge label={`件数: ${actions.length}`} tone="muted" />
      </div>

      <DataTable columns={columns} items={actions} emptyMessage="キューはありません" />
    </main>
  );
}

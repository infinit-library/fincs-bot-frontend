import Badge from '@/components/Badge';
import StatusCard from '@/components/StatusCard';
import ControlButtons from '@/components/ControlButtons';
import { getStatus } from '@/lib/api';
import type { Status } from '@/lib/types';

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

const fallbackStatus: Status = {
  running: false,
  last_scrape: null,
  last_new_segment: null,
  poll_interval: 15,
  dry_run: true,
  latest_signal: 'USDJPY ロング 0.20',
  latency_ms: 820,
  last_error: null,
};

export default async function DashboardPage() {
  const status = await getStatus().catch(() => fallbackStatus);

  const cards = [
    {
      title: 'ボット',
      value: status.running ? '稼働中' : '停止中',
      tone: status.running ? 'accent' : 'warn',
      hint: status.last_error ?? '安定稼働',
    },
    {
      title: '最新スクレイプ',
      value: formatDate(status.last_scrape),
      hint: status.last_new_segment ? `最新セグメント: ${status.last_new_segment}` : '次の取得を待機',
    },
    {
      title: 'レイテンシ',
      value: status.latency_ms ? `${status.latency_ms} ms` : '-',
      hint: 'スクレイプ → 解析 → 実行',
    },
    {
      title: 'ポーリング間隔',
      value: `${status.poll_interval}s`,
      hint: status.dry_run ? 'ドライラン有効' : '実売買有効',
    },
    {
      title: '最新シグナル',
      value: status.latest_signal ?? '-',
      hint: '要約表示',
    },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>運用ダッシュボード</h1>
          <p className="lede">FINCS 自動売買ボットの稼働状況と操作。</p>
        </div>
        <Badge tone={status.running ? 'accent' : 'warn'} label={status.running ? 'ライブ監視中' : '停止中'} />
      </div>

      <div className="card-grid">
        {cards.map((card) => (
          <StatusCard key={card.title} {...card} />
        ))}
      </div>

      <section className="section">
        <div className="section-title">ボット操作</div>
        <ControlButtons running={status.running} dryRun={status.dry_run} pollInterval={status.poll_interval} />
        <p className="control-foot">
          最新シグナル: {status.latest_signal ?? '受信待ち'}.<br />
          <strong>開始</strong>: ボットを稼働状態にしスケジューラを起動。 <strong>停止</strong>: 実行を一時停止。
          <strong>1回実行</strong>: 直近バッチを即時実行。 <strong>ドライラン</strong>: OANDAへ送信するが約定はしない。
        </p>
        {status.last_error && <p className="control-foot">直近のエラー: {status.last_error}</p>}
      </section>

      {status.last_error && (
        <div className="alert">直近のエラー: {status.last_error}</div>
      )}
    </main>
  );
}

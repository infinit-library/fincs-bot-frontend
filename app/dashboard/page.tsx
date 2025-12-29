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
  latest_signal: 'USDJPY LONG 0.20',
  latency_ms: 820,
  last_error: null,
};

export default async function DashboardPage() {
  const status = await getStatus().catch(() => fallbackStatus);

  const cards = [
    {
      title: 'Bot',
      value: status.running ? 'RUNNING' : 'STOPPED',
      tone: status.running ? 'accent' : 'warn',
      hint: status.last_error ?? 'Stable',
    },
    {
      title: 'Last scrape',
      value: formatDate(status.last_scrape),
      hint: status.last_new_segment ? `Latest segment: ${status.last_new_segment}` : 'Waiting for next tick',
    },
    {
      title: 'Latency',
      value: status.latency_ms ? `${status.latency_ms} ms` : '-',
      hint: 'scrape -> parse -> action',
    },
    {
      title: 'Poll interval',
      value: `${status.poll_interval}s`,
      hint: status.dry_run ? 'Dry-run enabled' : 'Live actions enabled',
    },
    {
      title: 'Latest signal',
      value: status.latest_signal ?? '-',
      hint: 'human-readable summary',
    },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Ops Dashboard</h1>
          <p className="lede">Visibility + control for the FINCS trading bot.</p>
        </div>
        <Badge tone={status.running ? 'accent' : 'warn'} label={status.running ? 'Live monitoring' : 'Stopped'} />
      </div>

      <div className="card-grid">
        {cards.map((card) => (
          <StatusCard key={card.title} {...card} />
        ))}
      </div>

      <section className="section">
        <div className="section-title">Bot controls</div>
        <ControlButtons running={status.running} dryRun={status.dry_run} pollInterval={status.poll_interval} />
        <p className="control-foot">Latest signal: {status.latest_signal ?? 'Waiting for stream'}.</p>
      </section>

      {status.last_error && (
        <div className="alert">Last error: {status.last_error}</div>
      )}
    </main>
  );
}

import SettingsForm from '@/components/SettingsForm';
import Badge from '@/components/Badge';
import { getSettings } from '@/lib/api';
import type { Settings } from '@/lib/types';

const fallbackSettings: Settings = {
  poll_interval: 15,
  allowed_pairs: ['USDJPY', 'EURUSD'],
  max_lot_cap: 1.0,
  dedup_window: 30,
  dry_run: true,
};

export default async function SettingsPage() {
  const settings = await getSettings().catch(() => fallbackSettings);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>設定</h1>
          <p className="lede">秘匿情報を除く設定を編集します。認証情報はサーバー側に保持します。</p>
        </div>
        <Badge label={settings.dry_run ? 'デフォルト: ドライラン' : 'デフォルト: 実売買'} tone={settings.dry_run ? 'muted' : 'accent'} />
      </div>

      <SettingsForm initial={settings} />
    </main>
  );
}

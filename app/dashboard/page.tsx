
'use client';

import { useEffect, useMemo, useState } from 'react';

type Status = {
  running: boolean;
  last_scrape: string | null;
  last_new_segment: string | null;
  poll_interval: number;
  dry_run: boolean;
  latest_signal: string | null;
  last_error: string | null;
  scrape_last_attempt?: string | null;
  scrape_last_success?: string | null;
};

type Settings = {
  max_lot_cap?: number;
  poll_interval?: number;
  dry_run?: boolean;
  max_open_positions?: number;
  max_total_units?: number;
  allowed_pairs?: string[];
};

type Signal = {
  id?: number;
  scraped_at?: string;
  segment_text?: string;
  pair?: string;
  action?: string;
  side?: string;
  lot_ratio?: number;
};

type Order = {
  id?: number;
  created_at?: string;
  status?: string;
  broker?: string;
  segment_hash?: string;
  error_message?: string;
};


type SaxoHealth = {
  ok?: boolean;
  env?: string;
  has_access_token?: boolean;
  has_refresh_token?: boolean;
  account_key?: string | null;
  client_key?: string | null;
  equity?: number | null;
  refresh_expires_at?: number | null;
  refresh_expired?: boolean | null;
  refresh_expires_in_seconds?: number | null;
  error?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

function formatTime(value?: string | null) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatEpoch(value?: number | null) {
  if (!value) return '-';
  try {
    return new Date(value * 1000).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function DashboardPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [maxLotCap, setMaxLotCap] = useState<number>(0.8);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [authWorking, setAuthWorking] = useState(false);
  const [saxoHealth, setSaxoHealth] = useState<SaxoHealth | null>(null);

  const maxLotPercent = useMemo(() => Math.round(maxLotCap * 100), [maxLotCap]);

  const refreshWarning = useMemo(() => {
    if (!saxoHealth?.refresh_expires_at) return null;
    const seconds = saxoHealth.refresh_expires_in_seconds ?? null;
    if (seconds !== null && seconds <= 0) {
      return "???????????????????????????????";
    }
    const warnSeconds = 7 * 24 * 60 * 60;
    if (seconds !== null && seconds <= warnSeconds) {
      const days = Math.max(1, Math.ceil(seconds / (24 * 60 * 60)));
      return `??????????????????????${days}??`;
    }
    return null;
  }, [saxoHealth?.refresh_expires_at, saxoHealth?.refresh_expires_in_seconds]);

  const loadAll = async () => {
    try {
      setError(null);
      const [statusRes, settingsRes, signalsRes, ordersRes, saxoRes] = await Promise.all([
        fetch(`${API_BASE}/status`),
        fetch(`${API_BASE}/settings`),
        fetch(`${API_BASE}/signals?limit=6`),
        fetch(`${API_BASE}/orders?limit=6`),
        fetch(`${API_BASE}/saxo/health`),
      ]);
      if (!statusRes.ok) throw new Error('ステータスの取得に失敗しました');
      if (!settingsRes.ok) throw new Error('設定の取得に失敗しました');
      const statusJson = await statusRes.json();
      const settingsJson = await settingsRes.json();
      const signalsJson = await signalsRes.json();
      const ordersJson = await ordersRes.json();
      const saxoJson = await saxoRes.json();
      setStatus(statusJson);
      setSettings(settingsJson);
      if (typeof settingsJson.max_lot_cap === 'number') {
        setMaxLotCap(settingsJson.max_lot_cap);
      }
      setSignals(Array.isArray(signalsJson) ? signalsJson : []);
      setOrders(Array.isArray(ordersJson) ? ordersJson : []);
      setSaxoHealth(saxoJson);
    } catch (err: any) {
      setError(err?.message || '不明なエラー');
    }
  };

  useEffect(() => {
    loadAll();
    const timer = setInterval(loadAll, 15000);
    return () => clearInterval(timer);
  }, []);

  const postAction = async (path: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}${path}`, { method: 'POST' });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail || '操作に失敗しました');
      }
      await loadAll();
    } catch (err: any) {
      setError(err?.message || '操作に失敗しました');
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        max_lot_cap: maxLotCap,
        dry_run: settings?.dry_run ?? true,
        poll_interval: settings?.poll_interval ?? 15,
      };

      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail || '設定の保存に失敗しました');
      }
      await loadAll();
    } catch (err: any) {
      setError(err?.message || '設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const fetchAuthUrl = async () => {
    try {
      setAuthWorking(true);
      setError(null);
      const res = await fetch(`${API_BASE}/saxo/auth-url`);
      if (!res.ok) throw new Error('認可URLの取得に失敗しました');
      const data = await res.json();
      setAuthUrl(data.url);
      setAuthStatus('認可URLを開いてログインし、表示されたコードを貼り付けてください。');
    } catch (err: any) {
      setError(err?.message || '認可URLの取得に失敗しました');
    } finally {
      setAuthWorking(false);
    }
  };

  const exchangeAuthCode = async () => {
    try {
      setAuthWorking(true);
      setError(null);
      const res = await fetch(`${API_BASE}/saxo/auth-exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail || 'トークン交換に失敗しました');
      }
      const data = await res.json();
      const expires = data.expires_at ? new Date(data.expires_at * 1000).toLocaleString() : 'unknown';
      setAuthStatus(`トークンを保存しました。期限: ${expires}`);
      setAuthCode('');
    } catch (err: any) {
      setError(err?.message || 'トークン交換に失敗しました');
    } finally {
      setAuthWorking(false);
    }
  };

  return (
    <main>
      <div className="container">
        <section className="hero fade-in">
          <div className="hero-card">
            <h1>FINCS 運用コンソール</h1>
            <p>FINCSのシグナル実行を管理する運用コンソールです。リスク制御と可視化を重視しています。</p>
            <div className="badge-row">
              <span className="badge">最大ロット上限: {maxLotPercent}%</span>
              <span className="badge">ポーリング: {status?.poll_interval ?? settings?.poll_interval ?? 15}s</span>
              <span className="badge">ドライラン: {status?.dry_run ? 'On' : 'Off'}</span>
            </div>
          </div>
          <div className="card fade-in fade-delay-1">
            <h3>稼働状況</h3>
            <div className="stat">{status?.running ? '稼働中' : '停止中'}<small>{status?.running ? 'スケジューラ稼働' : '待機中'}</small></div>
            <div className="kv"><span>最終スクレイプ</span><span>{formatTime(status?.last_scrape)}</span></div>
            <div className="kv"><span>最新シグナル</span><span>{formatTime(status?.last_new_segment)}</span></div>
            <div className="kv"><span>スクレイプ試行</span><span>{formatTime(status?.scrape_last_attempt)}</span></div>
            <div className="kv"><span>スクレイプ成功</span><span>{formatTime(status?.scrape_last_success)}</span></div>
            <div className="kv"><span>最終エラー</span><span>{status?.last_error || '-'}</span></div>
          </div>
        </section>

        {error && (
          <section className="card fade-in fade-delay-2">
            <h3>アラート</h3>
            <p style={{ color: '#ffdede', margin: 0 }}>{error}</p>
          </section>
        )}

        <section className="grid fade-in fade-delay-2">
          <div className="card">
            <h3>コントロール</h3>
            <div className="actions">
              <button className="button primary" onClick={() => postAction('/bot/start')}>取引開始</button>
              <button className="button secondary" onClick={() => postAction('/bot/run-once')}>1回実行</button>
              <button className="button danger" onClick={() => postAction('/bot/stop')}>停止</button>
            </div>
            <div className="kv"><span>最新シグナル</span><span>{status?.latest_signal ? 'あり' : 'なし'}</span></div>
          </div>

          <div className="card">
            <h3>最大ロット上限</h3>
            <p style={{ margin: '0 0 8px', color: 'var(--muted)' }}>口座残高に対する最大ロット比率を設定します。</p>
            <div className="form-row">
              <input
                className="slider"
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={maxLotCap}
                onChange={(e) => setMaxLotCap(parseFloat(e.target.value))}
              />
            </div>
            <div className="stat">{maxLotPercent}%<small>現在の上限</small></div>
            <div className="actions">
              <button className="button primary" onClick={saveSettings} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>


          <div className="card">
            <h3>Saxo 接続状況</h3>
            <div className="kv"><span>状態</span><span>{saxoHealth?.ok ? '正常' : '異常'}</span></div>
            <div className="kv"><span>環境</span><span>{saxoHealth?.env ?? '-'}</span></div>
            <div className="kv"><span>アクセストークン</span><span>{saxoHealth?.has_access_token ? 'あり' : 'なし'}</span></div>
            <div className="kv"><span>リフレッシュトークン</span><span>{saxoHealth?.has_refresh_token ? 'あり' : 'なし'}</span></div>
            <div className="kv"><span>口座残高</span><span>{saxoHealth?.equity ?? '-'}</span></div>
            {saxoHealth?.error && (
              <div className="kv" style={{ marginTop: 8 }}><span>エラー</span><span>{saxoHealth.error}</span></div>
            )}
          </div>
          <div className="card">
            <h3>リスクスナップショット</h3>
            <div className="kv"><span>最大総建玉</span><span>{settings?.max_total_units ?? '-'}</span></div>
            <div className="kv"><span>最大保有ポジション</span><span>{settings?.max_open_positions ?? '-'}</span></div>
            <div className="kv"><span>許可ペア</span><span>{settings?.allowed_pairs?.join(', ') || '-'}</span></div>
            <div className="kv"><span>ドライラン</span><span>{settings?.dry_run ? 'On' : 'Off'}</span></div>
          </div>
          <div className="card">
            <h3>Saxo 認証</h3>
            <p style={{ margin: '0 0 8px', color: 'var(--muted)' }}>認可URLを生成してコードを貼り付けると、.env にトークンを保存します。</p>
            <div className="actions">
              <button className="button secondary" onClick={fetchAuthUrl} disabled={authWorking}>
                {authWorking ? '処理中...' : '認可URLを取得'}
              </button>
            </div>
            {authUrl && (
              <div className="list-item" style={{ marginTop: 12 }}>
                <div className="kv"><span>認可URL</span><span><a href={authUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>開く</a></span></div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>{authUrl}</div>
              </div>
            )}
            <div className="form-row">
              <input
                className="input"
                type="text"
                placeholder="認可コードを貼り付け"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
              />
            </div>
            <div className="actions">
              <button className="button primary" onClick={exchangeAuthCode} disabled={authWorking || !authCode.trim()}>
                {authWorking ? '処理中...' : 'トークンを保存'}
              </button>
            </div>
            {authStatus && <div className="kv" style={{ marginTop: 8 }}><span>ステータス</span><span>{authStatus}</span></div>}
          </div>
        </section>

        <section className="grid fade-in fade-delay-3">
          <div className="card">
            <h3>最近のシグナル</h3>
            <div className="list">
              {signals.length === 0 && <div className="list-item">シグナルはまだありません。</div>}
              {signals.map((sig, idx) => (
                <div className="list-item" key={sig.id ?? idx}>
                  <div className="kv"><span>{sig.pair || '-'} {sig.action || ''}</span><span>{formatTime(sig.scraped_at)}</span></div>
                  <div className="kv"><span>{sig.side || '-'}</span><span>比率 {sig.lot_ratio ?? '-'}</span></div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>{sig.segment_text || '-'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>最近の注文</h3>
            <div className="list">
              {orders.length === 0 && <div className="list-item">注文はまだありません。</div>}
              {orders.map((order, idx) => {
                const statusLabel = order.status || 'unknown';
                const pillClass = statusLabel === 'filled' || statusLabel === 'submitted' ? 'ok' : statusLabel === 'failed' ? 'danger' : 'warn';
                return (
                  <div className="list-item" key={order.id ?? idx}>
                    <div className="kv"><span>{order.broker || '-'}</span><span>{formatTime(order.created_at)}</span></div>
                    <div className="kv">
                      <span>ハッシュ {order.segment_hash ? order.segment_hash.slice(0, 8) : '-'}</span>
                      <span className={`pill ${pillClass}`}>{statusLabel}</span>
                    </div>
                    {order.error_message && (
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>エラー: {order.error_message}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

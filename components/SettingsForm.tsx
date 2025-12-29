'use client';

import { useState, useTransition } from 'react';
import { saveSettings } from '@/lib/api';
import type { Settings } from '@/lib/types';

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState({
    poll_interval: initial.poll_interval,
    allowedPairs: initial.allowed_pairs.join(', '),
    max_lot_cap: initial.max_lot_cap,
    dedup_window: initial.dedup_window,
    dry_run: initial.dry_run,
  });
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const allowed_pairs = form.allowedPairs
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);

        await saveSettings({
          poll_interval: Number(form.poll_interval),
          allowed_pairs,
          max_lot_cap: Number(form.max_lot_cap),
          dedup_window: Number(form.dedup_window),
          dry_run: form.dry_run,
        });
        setMessage('設定を保存しました');
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'unknown error';
        setMessage(`エラー: ${detail}`);
      }
    });
  };

  return (
    <form className="section" onSubmit={onSubmit}>
      <div className="form-grid">
        <label className="field">
          ポーリング間隔（秒）
          <input
            type="number"
            min={1}
            value={form.poll_interval}
            onChange={(e) => setForm({ ...form, poll_interval: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          許可する通貨ペア（カンマ区切り）
          <input
            type="text"
            value={form.allowedPairs}
            onChange={(e) => setForm({ ...form, allowedPairs: e.target.value })}
          />
        </label>
        <label className="field">
          最大ロット比率
          <input
            type="number"
            step="0.01"
            min={0}
            value={form.max_lot_cap}
            onChange={(e) => setForm({ ...form, max_lot_cap: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          デデュープ幅（秒）
          <input
            type="number"
            min={0}
            value={form.dedup_window}
            onChange={(e) => setForm({ ...form, dedup_window: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          デフォルトのドライラン
          <div className="controls">
            <button
              className={`button ${form.dry_run ? 'primary' : 'ghost'}`}
              type="button"
              onClick={() => setForm({ ...form, dry_run: true })}
              disabled={form.dry_run}
            >
              ON
            </button>
            <button
              className={`button ${!form.dry_run ? 'warn' : 'ghost'}`}
              type="button"
              onClick={() => setForm({ ...form, dry_run: false })}
              disabled={!form.dry_run}
            >
              OFF
            </button>
          </div>
        </label>
      </div>

      <div className="controls">
        <button className="button primary" type="submit" disabled={isPending}>
          設定を保存
        </button>
        <span className="note">変更は FastAPI の /settings に保存されます。</span>
      </div>

      {message && <p className="note">{message}</p>}
    </form>
  );
}

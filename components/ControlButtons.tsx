'use client';

import { useState, useTransition } from 'react';
import { postBotStart, postBotStop, postRunOnce, updateDryRun } from '@/lib/api';

interface Props {
  running: boolean;
  dryRun: boolean;
  pollInterval: number;
}

export default function ControlButtons({ running, dryRun, pollInterval }: Props) {
  const [localRunning, setLocalRunning] = useState(running);
  const [localDryRun, setLocalDryRun] = useState(dryRun);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const runAction = (label: string, action: () => Promise<any>) => {
    startTransition(async () => {
      setMessage('');
      try {
        const result = await action();
        if (result && typeof result === 'object' && 'status' in result && 'result' in result) {
          const r: any = (result as any).result;
          const failedCount = Array.isArray(r?.failed) ? r.failed.length : 0;
          const skippedCount = Array.isArray(r?.skipped) ? r.skipped.length : 0;
          setMessage(
            `1回実行: 対象 ${r?.processed ?? 0} 件中 成功 ${r?.submitted ?? 0} 件 / 失敗 ${failedCount} 件 / スキップ ${skippedCount} 件`
          );
        } else {
          setMessage(`${label} を送信しました`);
        }
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'unknown error';
        setMessage(`エラー: ${detail}`);
      }
    });
  };

  return (
    <div>
      <div className="controls">
        <button
          className="button primary"
          disabled={isPending || localRunning}
          onClick={() =>
            runAction('Start', async () => {
              await postBotStart();
              setLocalRunning(true);
            })
          }
        >
          ボット開始
        </button>
        <button
          className="button warn"
          disabled={isPending || !localRunning}
          onClick={() =>
            runAction('Stop', async () => {
              await postBotStop();
              setLocalRunning(false);
            })
          }
        >
          ボット停止
        </button>
        <button
          className="button ghost"
          disabled={isPending}
          onClick={() => runAction('Manual poll', postRunOnce)}
        >
          1回実行
        </button>
        <button
          className="button"
          disabled={isPending}
          onClick={() =>
            runAction(localDryRun ? 'Dry-run off' : 'Dry-run on', async () => {
              await updateDryRun(!localDryRun);
              setLocalDryRun(!localDryRun);
            })
          }
        >
          {localDryRun ? 'ドライラン停止' : 'ドライラン開始'}
        </button>
      </div>
      <p className="control-foot">
        ポーリング間隔: {pollInterval}秒.{' '}
        {message ||
          (localRunning
            ? '稼働中はリアルタイム価格とスリッページガードを使用。ドライランは発注をシミュレートします。'
            : '停止中: 開始すると最新スクレイプ分から処理を再開します。')}
      </p>
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { postBotStart, postBotStop, postRunOnce, updateDryRun } from '@/lib/api';

interface Props {
  running: boolean;
  dryRun: boolean;
  pollInterval: number;
}

export default function ControlButtons({ running, dryRun, pollInterval }: Props) {
  const [localDryRun, setLocalDryRun] = useState(dryRun);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const runAction = (label: string, action: () => Promise<unknown>) => {
    startTransition(async () => {
      setMessage('');
      try {
        await action();
        setMessage(`${label} sent`);
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'unknown error';
        setMessage(`Error: ${detail}`);
      }
    });
  };

  return (
    <div>
      <div className="controls">
        <button
          className="button primary"
          disabled={isPending || running}
          onClick={() => runAction('Start', postBotStart)}
        >
          Start bot
        </button>
        <button
          className="button warn"
          disabled={isPending || !running}
          onClick={() => runAction('Stop', postBotStop)}
        >
          Stop bot
        </button>
        <button
          className="button ghost"
          disabled={isPending}
          onClick={() => runAction('Manual poll', postRunOnce)}
        >
          Run once
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
          {localDryRun ? 'Disable dry-run' : 'Enable dry-run'}
        </button>
      </div>
      <p className="control-foot">
        Poll interval: {pollInterval}s. {message || 'Commands call the FastAPI endpoints directly.'}
      </p>
    </div>
  );
}

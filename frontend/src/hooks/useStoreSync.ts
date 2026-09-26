import { useEffect, useState } from 'react';
import { STORE_EVENTS } from '@/data/store';

/**
 * useStoreSync - React hook that triggers a re-render when specified CineBook store events
 * (or any store update) occur in the browser window, or cross-tab via 'storage' events.
 * 
 * @param eventNames Optional array or single event name to listen to. If omitted, listens to STORE_EVENTS.all.
 * @returns A tick counter that increments on every relevant update.
 */
export function useStoreSync(eventNames?: string | string[]): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setTick(prev => prev + 1);
    };

    const eventsToListen = Array.isArray(eventNames)
      ? eventNames
      : eventNames
      ? [eventNames]
      : [STORE_EVENTS.all];

    eventsToListen.forEach(evt => {
      window.addEventListener(evt, handleUpdate);
    });

    // Also listen to cross-tab storage changes
    window.addEventListener('storage', handleUpdate);

    return () => {
      eventsToListen.forEach(evt => {
        window.removeEventListener(evt, handleUpdate);
      });
      window.removeEventListener('storage', handleUpdate);
    };
  }, [eventNames ? (Array.isArray(eventNames) ? eventNames.join(',') : eventNames) : 'all']);

  return tick;
}

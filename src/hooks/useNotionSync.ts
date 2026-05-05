/**
 * useNotionSync — runs once on app mount.
 *
 * Fetches Users, Courses and Events from Notion and overwrites the
 * localStorage cache. This ensures that any changes made directly
 * in Notion (e.g. manually granting premium) are reflected the next
 * time someone opens the app.
 *
 * Uses setNotionSyncInProgress() to suppress the "write back to Notion"
 * side-effect in contentStore during this initial population.
 */

import { useEffect, useState } from 'react';
import { syncFromNotion } from '../lib/notionService';
import {
  saveUsers,
  saveEvents,
  saveCourses,
  setNotionSyncInProgress,
} from '../lib/contentStore';

export interface NotionSyncState {
  syncing: boolean;
  error: string | null;
  lastSynced: Date | null;
}

export function useNotionSync(): NotionSyncState {
  const [state, setState] = useState<NotionSyncState>({
    syncing: true,
    error: null,
    lastSynced: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { users, courses, events } = await syncFromNotion();

        if (cancelled) return;

        // Overwrite localStorage without triggering Notion write-back
        setNotionSyncInProgress(true);
        try {
          if (users.length > 0) saveUsers(users);
          if (courses.length > 0) saveCourses(courses);
          if (events.length > 0) saveEvents(events);
        } finally {
          setNotionSyncInProgress(false);
        }

        setState({ syncing: false, error: null, lastSynced: new Date() });
        console.log(
          `[Notion] Synced ${users.length} users, ${courses.length} courses, ${events.length} events.`,
        );
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('[Notion] Sync failed — using local cache.', msg);
        setState({ syncing: false, error: msg, lastSynced: null });
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return state;
}

/**
 * AdminDataContext — single source of truth for the admin panel.
 *
 * On mount it runs a full Notion sync, populates localStorage,
 * and exposes live React state + CRUD mutations to every section.
 * All writes go: React state (instant) → localStorage (sync) → Notion (async).
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { syncFromNotion, fetchCourseContent } from '../lib/notionService';
import {
  getUsers, saveUsers, getCourses, saveCourses, getEvents, saveEvents,
  getCourseContent, saveCourseContent,
  getHome, saveHome, getHelp, saveHelp,
  setNotionSyncInProgress,
  type HelpContent,
} from '../lib/contentStore';
import type { Course, Event } from '../lib/supabase';
import type { Section, HomeConfig } from '../lib/courseTypes';
import type { UserRecord } from '../lib/contentStore';

// ─── Context shape ────────────────────────────────────────────────

export interface AdminDataContextValue {
  // Data
  users: UserRecord[];
  courses: Course[];
  events: Event[];
  courseContent: Record<string, Section[]>;
  homeConfig: HomeConfig;
  helpContent: HelpContent;
  // Sync state
  syncing: boolean;
  lastSynced: Date | null;
  // User mutations
  updateUser: (u: UserRecord) => void;
  deleteUser: (id: string) => void;
  addUser: (data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  // Course mutations
  saveCourse: (data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  // Event mutations
  saveEvent: (data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  // Section / Lesson mutations (per-course)
  saveSections: (courseId: string, sections: Section[]) => void;
  loadCourseContent: (courseId: string) => Promise<Section[]>;
  // Home mutations
  saveHomeConfig: (cfg: HomeConfig) => void;
  // Help / FAQ mutations
  saveHelpContent: (h: HelpContent) => void;
  // Force re-fetch from Notion
  refresh: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used inside <AdminDataProvider>');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [users,         setUsers]         = useState<UserRecord[]>(getUsers());
  const [courses,       setCourses]       = useState<Course[]>(getCourses() as Course[]);
  const [events,        setEvents]        = useState<Event[]>(getEvents() as Event[]);
  const [courseContent, setCourseContent] = useState<Record<string, Section[]>>(getCourseContent());
  const [homeConfig,    setHomeConfig]    = useState<HomeConfig>(getHome());
  const [helpContent,   setHelpContent]   = useState<HelpContent>(getHelp());
  const [syncing,       setSyncing]       = useState(true);
  const [lastSynced,    setLastSynced]    = useState<Date | null>(null);

  // ── Initial Notion sync ───────────────────────────────────────

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const { users: nu, courses: nc, events: ne, homeConfig: nh, faqs: nf } = await syncFromNotion();

      setNotionSyncInProgress(true);
      try {
        if (nu.length) saveUsers(nu);
        if (nc.length) saveCourses(nc);
        if (ne.length) saveEvents(ne);
        if (nh) saveHome(nh);
        if (nf) {
          const help = getHelp();
          saveHelp({ ...help, faqs: nf });
        }
      } finally {
        setNotionSyncInProgress(false);
      }

      if (nu.length) setUsers(nu);
      if (nc.length) setCourses(nc);
      if (ne.length) setEvents(ne);
      if (nh) setHomeConfig(nh);
      if (nf) setHelpContent(h => ({ ...h, faqs: nf }));
      setLastSynced(new Date());
      console.log(`[AdminData] Synced — ${nu.length} users, ${nc.length} courses, ${ne.length} events`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[AdminData] Notion sync failed — using localStorage cache.', msg);
      setUsers(getUsers());
      setCourses(getCourses() as Course[]);
      setEvents(getEvents() as Event[]);
      setHomeConfig(getHome());
      setHelpContent(getHelp());
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => { runSync(); }, [runSync]);

  // ── User mutations ────────────────────────────────────────────

  const updateUser = useCallback((updated: UserRecord) => {
    const withTs = { ...updated, updatedAt: new Date().toISOString() };
    setUsers(prev => {
      const next = prev.map(u => u.id === updated.id ? withTs : u);
      saveUsers(next);
      return next;
    });
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => {
      const next = prev.filter(u => u.id !== id);
      saveUsers(next);
      return next;
    });
  }, []);

  const addUser = useCallback((data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUser: UserRecord = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setUsers(prev => {
      const next = [newUser, ...prev];
      saveUsers(next);
      return next;
    });
  }, []);

  // ── Course mutations ──────────────────────────────────────────

  const saveCourse = useCallback((data: Partial<Course>) => {
    setCourses(prev => {
      let next: Course[];
      if (data.id) {
        next = prev.map(c => c.id === data.id ? { ...c, ...data } as Course : c);
      } else {
        const newCourse: Course = {
          id: crypto.randomUUID(),
          title: data.title ?? '', description: data.description ?? '',
          price: data.price ?? 0, image_url: data.image_url ?? '',
          category: data.category ?? 'Desarrollo', type: data.type ?? 'video',
          content_url: data.content_url, instructor: data.instructor ?? '',
          duration: data.duration, level: data.level ?? 'beginner',
          created_at: new Date().toISOString(),
        };
        next = [newCourse, ...prev];
      }
      saveCourses(next);
      return next;
    });
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => {
      const next = prev.filter(c => c.id !== id);
      saveCourses(next);
      return next;
    });
  }, []);

  // ── Event mutations ───────────────────────────────────────────

  const saveEvent = useCallback((data: Partial<Event>) => {
    setEvents(prev => {
      let next: Event[];
      if (data.id) {
        next = prev.map(e => e.id === data.id ? { ...e, ...data } as Event : e);
      } else {
        const newEvent: Event = {
          id: crypto.randomUUID(),
          title: data.title ?? '', description: data.description ?? '',
          date: data.date ?? '', end_date: data.end_date,
          location: data.location ?? '', image_urls: data.image_urls ?? [],
          video_url: data.video_url, agenda: data.agenda ?? '',
          created_at: new Date().toISOString(),
        };
        next = [newEvent, ...prev];
      }
      saveEvents(next);
      return next;
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      saveEvents(next);
      return next;
    });
  }, []);

  // ── Section / Lesson mutations ────────────────────────────────

  const saveSections = useCallback((courseId: string, sections: Section[]) => {
    setCourseContent(prev => {
      const next = { ...prev, [courseId]: sections };
      saveCourseContent(next, prev);
      return next;
    });
  }, []);

  const loadCourseContent = useCallback(async (courseId: string): Promise<Section[]> => {
    try {
      const sections = await fetchCourseContent(courseId);
      if (sections.length) {
        setCourseContent(prev => {
          const next = { ...prev, [courseId]: sections };
          setNotionSyncInProgress(true);
          try { saveCourseContent(next); } finally { setNotionSyncInProgress(false); }
          return next;
        });
        return sections;
      }
    } catch (e) {
      console.warn('[AdminData] Could not load course content from Notion:', e);
    }
    // Fall back to localStorage
    const cached = getCourseContent();
    return cached[courseId] ?? [];
  }, []);

  // ── Home mutations ────────────────────────────────────────────

  const saveHomeConfig = useCallback((cfg: HomeConfig) => {
    setHomeConfig(cfg);
    saveHome(cfg); // triggers Notion sync inside contentStore
  }, []);

  // ── Help / FAQ mutations ──────────────────────────────────────

  const saveHelpContent = useCallback((h: HelpContent) => {
    setHelpContent(prev => {
      saveHelp(h, prev);
      return h;
    });
  }, []);

  // ── Value ─────────────────────────────────────────────────────

  const value: AdminDataContextValue = {
    users, courses, events, courseContent, homeConfig, helpContent,
    syncing, lastSynced,
    updateUser, deleteUser, addUser,
    saveCourse, deleteCourse,
    saveEvent, deleteEvent,
    saveSections, loadCourseContent,
    saveHomeConfig,
    saveHelpContent,
    refresh: runSync,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

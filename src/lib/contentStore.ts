import { MOCK_EVENTS, MOCK_COURSES } from './mockData';
import type { Event, Course } from './supabase';
import type { Section, FAQ } from './courseTypes';
import {
  upsertUserInNotion,
  deleteUserInNotion,
  upsertCourseInNotion,
  deleteCourseInNotion,
  upsertEventInNotion,
  deleteEventInNotion,
  upsertSectionInNotion,
  deleteSectionInNotion,
  upsertLessonInNotion,
  deleteLessonInNotion,
  syncFAQsToNotion,
} from './notionService';

/* ── helpers ─────────────────────────────────────────────── */
function ls_get<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function ls_set<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)); }

/**
 * When true, write functions skip the Notion sync.
 * Set to true before overwriting localStorage from Notion during initial sync
 * to avoid an infinite write loop.
 */
let _notionSyncInProgress = false;
export function setNotionSyncInProgress(v: boolean) { _notionSyncInProgress = v; }

/* ── Events ──────────────────────────────────────────────── */
export const getEvents = (): Event[] => ls_get('kl_events', MOCK_EVENTS);

export const saveEvents = (next: Event[], prev?: Event[]) => {
  // Capture prev state BEFORE overwriting localStorage
  const prevList = prev ?? ls_get<Event[]>('kl_events', []);
  ls_set('kl_events', next);
  if (_notionSyncInProgress) return;

  // Diff: upsert changed/new events, archive deleted ones
  next.forEach(e => {
    const old = prevList.find(x => x.id === e.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(e)) {
      upsertEventInNotion(e).catch(console.error);
    }
  });
  prevList.forEach(e => {
    if (!next.find(x => x.id === e.id)) {
      deleteEventInNotion(e.id).catch(console.error);
    }
  });
};

/* ── Courses ─────────────────────────────────────────────── */
export const getCourses = (): Course[] => ls_get('kl_courses', MOCK_COURSES);

export const saveCourses = (next: Course[], prev?: Course[]) => {
  const prevList = prev ?? ls_get<Course[]>('kl_courses', []);
  ls_set('kl_courses', next);
  if (_notionSyncInProgress) return;
  next.forEach(c => {
    const old = prevList.find(x => x.id === c.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(c)) {
      upsertCourseInNotion(c).catch(console.error);
    }
  });
  prevList.forEach(c => {
    if (!next.find(x => x.id === c.id)) {
      deleteCourseInNotion(c.id).catch(console.error);
    }
  });
};

/* ── Course sections ─────────────────────────────────────── */
export const getCourseContent = (): Record<string, Section[]> =>
  ls_get('kl_course_content', {});

export const saveCourseContent = (
  next: Record<string, Section[]>,
  prev?: Record<string, Section[]>,
) => {
  const prevMap = prev ?? ls_get<Record<string, Section[]>>('kl_course_content', {});
  ls_set('kl_course_content', next);
  if (_notionSyncInProgress) return;

  // Collect all sections and lessons from next
  const nextSections = Object.values(next).flat();
  const prevSections = Object.values(prevMap).flat();

  nextSections.forEach(s => {
    const old = prevSections.find(x => x.id === s.id);
    const { lessons, ...sData } = s;
    if (!old || JSON.stringify({ ...old, lessons: undefined }) !== JSON.stringify(sData)) {
      upsertSectionInNotion(sData).catch(console.error);
    }
    // Sync lessons
    const prevLessons = old?.lessons ?? [];
    lessons.forEach(l => {
      const oldL = prevLessons.find(x => x.id === l.id);
      if (!oldL || JSON.stringify(oldL) !== JSON.stringify(l)) {
        upsertLessonInNotion(l).catch(console.error);
      }
    });
    prevLessons.forEach(l => {
      if (!lessons.find(x => x.id === l.id)) {
        deleteLessonInNotion(l.id).catch(console.error);
      }
    });
  });

  prevSections.forEach(s => {
    if (!nextSections.find(x => x.id === s.id)) {
      deleteSectionInNotion(s.id).catch(console.error);
      s.lessons.forEach(l => deleteLessonInNotion(l.id).catch(console.error));
    }
  });
};

/* ── Home content ────────────────────────────────────────── */
// Re-export HomeConfig from courseTypes as HomeContent for backward compat with HomeEditor
export type { HomeConfig as HomeContent } from './courseTypes';
import type { HomeConfig } from './courseTypes';
import { saveHomeConfigToNotion } from './notionService';

export const DEFAULT_HOME: HomeConfig = {
  hero: {
    badge: 'Plataforma Web3 + IA',
    title: 'Key Lab Academy',
    subtitle: 'Desbloquea el futuro de la tecnología. Aprende blockchain, Web3 e IA con expertos de la industria.',
    btn1: 'Ver eventos →',
    btn2: 'Explorar cursos',
  },
  logoUrl: '',
  features: [
    { icon: 'zap', title: 'Aprende con expertos', description: 'Workshops y eventos en vivo con referentes de Web3, blockchain e IA.', color: 'from-amber-400 to-orange-500' },
    { icon: 'users', title: 'Comunidad activa', description: 'Conecta con builders, inversores y creadores del ecosistema descentralizado.', color: 'from-sky-400 to-cyan-500' },
    { icon: 'book', title: 'Cursos & recursos', description: 'Desde Solidity básico hasta auditorías de contratos. A tu ritmo, desde cero.', color: 'from-indigo-400 to-violet-500' },
  ],
};
export const getHome = (): HomeConfig => ls_get('kl_home', DEFAULT_HOME);
export const saveHome = (v: HomeConfig) => {
  ls_set('kl_home', v);
  if (!_notionSyncInProgress) saveHomeConfigToNotion(v).catch(console.error);
};

/* ── Help content ────────────────────────────────────────── */
export interface HelpContent {
  faqs: FAQ[];
  contact: { email: string; telegram: string; docs: string };
}
export const DEFAULT_HELP: HelpContent = {
  faqs: [
    { id: crypto.randomUUID(), q: '¿Cómo me registro en un evento?', a: 'Haz clic en "Ver detalle" en la card del evento y luego en "Reservar mi lugar". Ingresa tu nombre y correo.', orden: 1 },
    { id: crypto.randomUUID(), q: '¿Los eventos son gratuitos?', a: 'La mayoría de nuestros eventos son gratuitos y abiertos a todos.', orden: 2 },
    { id: crypto.randomUUID(), q: '¿Cómo accedo a un curso de pago?', a: 'Contáctanos en hola@keylab.academy para coordinar el pago por transferencia.', orden: 3 },
    { id: crypto.randomUUID(), q: '¿Necesito una wallet para usar Key Lab?', a: 'No es estrictamente necesario. Puedes iniciar sesión con tu correo o cuenta de Google.', orden: 4 },
    { id: crypto.randomUUID(), q: '¿Cómo recibo la información de acceso al evento?', a: 'Al reservar tu lugar recibirás un correo con la agenda. El link de acceso llega 1 hora antes.', orden: 5 },
    { id: crypto.randomUUID(), q: '¿Puedo cancelar mi registro?', a: 'Sí. Contáctanos con al menos 24 horas de anticipación a hola@keylab.academy.', orden: 6 },
  ],
  contact: { email: 'hola@keylab.academy', telegram: '@keylabacademy', docs: 'docs.keylab.academy' },
};
export const getHelp = (): HelpContent => ls_get('kl_help', DEFAULT_HELP);
export const saveHelp = (next: HelpContent, prev?: HelpContent) => {
  const prevHelp = prev ?? ls_get<HelpContent>('kl_help', DEFAULT_HELP);
  ls_set('kl_help', next);
  if (_notionSyncInProgress) return;
  const prevIds = prevHelp.faqs.map(f => f.id);
  syncFAQsToNotion(next.faqs, prevIds).catch(console.error);
};

/* ── Users ───────────────────────────────────────────────── */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  wallet?: string;
  plan: 'free' | 'premium';
  enabledCourses: string[];   // course IDs, or ['all']
  registeredEvents: string[]; // event IDs
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Mock users seed ─────────────────────────────────────── */
const MOCK_USERS: UserRecord[] = [
  {
    id: 'u1',
    email: 'carlos.martinez@gmail.com',
    name: 'Carlos Martínez',
    wallet: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    plan: 'premium',
    enabledCourses: ['all'],
    registeredEvents: ['1', '3'],
    notes: 'Pagó $99 el 10/04/2026 vía transferencia BBVA. Acceso completo.',
    createdAt: '2026-03-15T14:22:00Z',
    updatedAt: '2026-04-10T09:30:00Z',
  },
  {
    id: 'u2',
    email: 'sofia.reyes@hotmail.com',
    name: 'Sofía Reyes',
    plan: 'free',
    enabledCourses: [],
    registeredEvents: ['1'],
    notes: '',
    createdAt: '2026-04-01T10:05:00Z',
    updatedAt: '2026-04-01T10:05:00Z',
  },
  {
    id: 'u3',
    email: 'miguel.torres@protonmail.com',
    name: 'Miguel Torres',
    wallet: '0xdeadbeef1234567890abcdef1234567890abcdef',
    plan: 'premium',
    enabledCourses: ['1', '2'],
    registeredEvents: ['2', '3'],
    notes: 'Pagó $49 el 5/04/2026. Tiene acceso a Solidity y DeFi.',
    createdAt: '2026-03-28T16:40:00Z',
    updatedAt: '2026-04-05T11:15:00Z',
  },
  {
    id: 'u4',
    email: 'ana.gonzalez@outlook.com',
    name: 'Ana González',
    plan: 'free',
    enabledCourses: [],
    registeredEvents: ['1', '2', '3'],
    notes: 'Muy activa en eventos. Pendiente de pago.',
    createdAt: '2026-04-08T09:20:00Z',
    updatedAt: '2026-04-08T09:20:00Z',
  },
  {
    id: 'u5',
    email: 'pedro.ruiz@gmail.com',
    name: 'Pedro Ruiz',
    wallet: '0xabcdef1234567890abcdef1234567890abcdef12',
    plan: 'premium',
    enabledCourses: ['4', '5'],
    registeredEvents: ['3'],
    notes: 'Pagó $178 el 12/04/2026. Acceso a NFTs y Seguridad.',
    createdAt: '2026-04-12T13:50:00Z',
    updatedAt: '2026-04-12T14:00:00Z',
  },
  {
    id: 'u6',
    email: 'laura.sanchez@icloud.com',
    name: 'Laura Sánchez',
    plan: 'free',
    enabledCourses: [],
    registeredEvents: ['2'],
    notes: '',
    createdAt: '2026-04-15T08:10:00Z',
    updatedAt: '2026-04-15T08:10:00Z',
  },
  {
    id: 'u7',
    email: 'javier.luna@yahoo.com',
    name: 'Javier Luna',
    plan: 'free',
    enabledCourses: [],
    registeredEvents: [],
    notes: 'Interesado en cursos de DeFi.',
    createdAt: '2026-04-18T11:30:00Z',
    updatedAt: '2026-04-18T11:30:00Z',
  },
  {
    id: 'u8',
    email: 'valentina.mora@gmail.com',
    name: 'Valentina Mora',
    wallet: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
    plan: 'premium',
    enabledCourses: ['1', '4', '6'],
    registeredEvents: ['1', '2'],
    notes: 'Pagó $118 el 20/04/2026. Acceso a Solidity, NFTs y Kit Web3.',
    createdAt: '2026-04-20T17:00:00Z',
    updatedAt: '2026-04-20T17:10:00Z',
  },
];

export const getUsers = (): UserRecord[] => ls_get('kl_users', MOCK_USERS);

export const saveUsers = (next: UserRecord[], prev?: UserRecord[]) => {
  const prevList = prev ?? ls_get<UserRecord[]>('kl_users', []);
  ls_set('kl_users', next);
  if (_notionSyncInProgress) return;
  // Upsert changed or new users
  next.forEach(u => {
    const old = prevList.find(x => x.email.toLowerCase() === u.email.toLowerCase());
    if (!old || JSON.stringify(old) !== JSON.stringify(u)) {
      upsertUserInNotion(u).catch(console.error);
    }
  });
  // Archive deleted users
  prevList.forEach(u => {
    if (!next.find(x => x.email.toLowerCase() === u.email.toLowerCase())) {
      deleteUserInNotion(u.email).catch(console.error);
    }
  });
};

export function upsertUser(data: Partial<UserRecord> & { email: string }): UserRecord {
  const users = getUsers();
  const now = new Date().toISOString();
  const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    const updated = { ...existing, ...data, updatedAt: now };
    ls_set('kl_users', users.map(u =>
      u.email.toLowerCase() === data.email.toLowerCase() ? updated : u
    ));
    if (!_notionSyncInProgress) upsertUserInNotion(updated).catch(console.error);
    return updated;
  }
  const newUser: UserRecord = {
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name || '',
    wallet: data.wallet,
    plan: data.plan ?? 'free',
    enabledCourses: data.enabledCourses ?? [],
    registeredEvents: data.registeredEvents ?? [],
    notes: data.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };
  ls_set('kl_users', [...users, newUser]);
  if (!_notionSyncInProgress) upsertUserInNotion(newUser).catch(console.error);
  return newUser;
}

export function grantPremium(email: string, courseIds: string[] | 'all') {
  const courses = courseIds === 'all' ? ['all'] : courseIds;
  upsertUser({ email, plan: 'premium', enabledCourses: courses });
}

export function revokePremium(email: string) {
  upsertUser({ email, plan: 'free', enabledCourses: [] });
}

export function hasAccessToCourse(email: string | null | undefined, courseId: string): boolean {
  if (!email) return false;
  const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.plan !== 'premium') return false;
  return user.enabledCourses.includes('all') || user.enabledCourses.includes(courseId);
}

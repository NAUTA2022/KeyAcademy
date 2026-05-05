/**
 * notionService.ts — High-level Notion service
 *
 * Maps Notion pages ↔ app types (UserRecord, Course, Event, Section, Lesson, FAQ, HomeConfig).
 * Caches Notion page IDs in memory so we can update (PATCH) instead of always creating.
 *
 * DB IDs (Notion page IDs without dashes):
 *   Usuarios   → b506b5367c01408084519c429568347f
 *   Cursos     → f28aec74ae7e4ba3a465c2e15af26992
 *   Eventos    → 49a1de40c0454bcbbcc15340bd205dfb
 *   Secciones  → ef33f71752ad4609a55fa77889ee21c9
 *   Lecciones  → c638f6736ec544af96e81b18cfbe9e85
 *   ConfigHome → e4250891ddad48e5ae77669158698277
 *   FAQs       → c94e43e0e63941128daa9fdd16c0c8d0
 */

import {
  queryDatabase,
  createPage,
  updatePage,
  archivePage,
  read,
  build,
  decodeNotionFileRef,
  type NotionPage,
} from './notionDB';
import type { UserRecord } from './contentStore';
import type { Course, Event } from './supabase';
import type { Section, Lesson, FAQ, HomeConfig } from './courseTypes';

// ─── Database IDs ─────────────────────────────────────────────────

const DB = {
  USUARIOS:    'b506b5367c01408084519c429568347f',
  CURSOS:      'f28aec74ae7e4ba3a465c2e15af26992',
  EVENTOS:     '49a1de40c0454bcbbcc15340bd205dfb',
  SECCIONES:   'ef33f71752ad4609a55fa77889ee21c9',
  LECCIONES:   'c638f6736ec544af96e81b18cfbe9e85',
  CONFIG_HOME: 'e4250891ddad48e5ae77669158698277',
  FAQS:        'c94e43e0e63941128daa9fdd16c0c8d0',
} as const;

// ─── In-memory page-ID caches (key → Notion page id) ─────────────
// Populated during initial sync; used to PATCH instead of POST on updates.

const _userPageIds: Record<string, string> = {};     // email.toLowerCase() → pageId
const _coursePageIds: Record<string, string> = {};   // course.id → pageId
const _eventPageIds: Record<string, string> = {};    // event.id  → pageId
const _sectionPageIds: Record<string, string> = {};  // section.id → pageId
const _lessonPageIds: Record<string, string> = {};   // lesson.id → pageId
const _faqPageIds: Record<string, string> = {};      // faq.id → pageId
const _homePageIds: Record<string, string> = {};     // propiedad → pageId

// ─── Helpers ─────────────────────────────────────────────────────

function safeJson<T>(str: string, fallback: T): T {
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════

function pageToUser(page: NotionPage): UserRecord {
  const p = page.properties;
  return {
    id: page.id,
    email: read.email(p['Email']),
    name: read.title(p['Nombre']),
    wallet: read.richText(p['Wallet']) || undefined,
    plan: (read.select(p['Plan']) || 'free') as 'free' | 'premium',
    enabledCourses: safeJson<string[]>(read.richText(p['CursosHabilitados']), []),
    registeredEvents: safeJson<string[]>(read.richText(p['EventosRegistrados']), []),
    notes: read.richText(p['Notas']),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

function userToProps(user: UserRecord): Record<string, unknown> {
  return {
    Nombre:              build.title(user.name || user.email),
    Email:               build.email(user.email),
    Wallet:              build.richText(user.wallet ?? ''),
    Plan:                build.select(user.plan),
    CursosHabilitados:   build.richText(JSON.stringify(user.enabledCourses)),
    EventosRegistrados:  build.richText(JSON.stringify(user.registeredEvents)),
    Notas:               build.richText(user.notes),
  };
}

export async function fetchUsersFromNotion(): Promise<UserRecord[]> {
  const pages = await queryDatabase(DB.USUARIOS);
  const users: UserRecord[] = [];
  for (const page of pages) {
    if (page.archived) continue;
    const user = pageToUser(page);
    if (!user.email) continue;
    _userPageIds[user.email.toLowerCase()] = page.id;
    users.push(user);
  }
  return users;
}

export async function upsertUserInNotion(user: UserRecord): Promise<void> {
  const key = user.email.toLowerCase();
  const pageId = _userPageIds[key];
  if (pageId) {
    await updatePage(pageId, userToProps(user));
  } else {
    const page = await createPage(DB.USUARIOS, userToProps(user));
    _userPageIds[key] = page.id;
  }
}

export async function deleteUserInNotion(email: string): Promise<void> {
  const pageId = _userPageIds[email.toLowerCase()];
  if (!pageId) return;
  await archivePage(pageId);
  delete _userPageIds[email.toLowerCase()];
}

// ═══════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════

function pageToCourse(page: NotionPage): Course {
  const p = page.properties;
  const id = read.richText(p['CursoID']) || page.id;
  // Prefer Notion-hosted file; fall back to external URL field
  const image_url = read.files(p['ImagenFile']) || read.url(p['ImagenURL']);
  return {
    id,
    title:       read.title(p['Titulo']),
    description: read.richText(p['Descripcion']),
    price:       read.number(p['Precio']),
    image_url,
    category:    read.select(p['Categoria']),
    type:        (read.select(p['Tipo']) || 'video') as Course['type'],
    instructor:  read.richText(p['Instructor']),
    duration:    read.richText(p['Duracion']),
    level:       (read.select(p['Nivel']) || 'beginner') as Course['level'],
    created_at:  page.created_time,
  };
}

function courseToProps(course: Course): Record<string, unknown> {
  const ref = decodeNotionFileRef(course.image_url ?? '');
  return {
    Titulo:      build.title(course.title),
    CursoID:     build.richText(course.id),
    Descripcion: build.richText(course.description),
    Precio:      build.number(course.price),
    // If it's a pending Notion file upload, use files property; otherwise use URL
    ...(ref
      ? { ImagenFile: build.fileUpload(ref.fileUploadId, 'portada'), ImagenURL: build.url('') }
      : { ImagenURL:  build.url(course.image_url), ImagenFile: build.externalFile('') }
    ),
    Categoria:   build.select(course.category),
    Tipo:        build.select(course.type),
    Instructor:  build.richText(course.instructor),
    Duracion:    build.richText(course.duration ?? ''),
    Nivel:       build.select(course.level),
    Activo:      build.checkbox(true),
  };
}

export async function fetchCoursesFromNotion(): Promise<Course[]> {
  const pages = await queryDatabase(DB.CURSOS, {
    property: 'Activo',
    checkbox: { equals: true },
  });
  const courses: Course[] = [];
  for (const page of pages) {
    if (page.archived) continue;
    const course = pageToCourse(page);
    _coursePageIds[course.id] = page.id;
    courses.push(course);
  }
  return courses;
}

export async function upsertCourseInNotion(course: Course): Promise<void> {
  const pageId = _coursePageIds[course.id];
  if (pageId) {
    await updatePage(pageId, courseToProps(course));
  } else {
    const page = await createPage(DB.CURSOS, courseToProps(course));
    _coursePageIds[course.id] = page.id;
  }
}

export async function deleteCourseInNotion(courseId: string): Promise<void> {
  const pageId = _coursePageIds[courseId];
  if (!pageId) return;
  await archivePage(pageId);
  delete _coursePageIds[courseId];
}

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

function pageToEvent(page: NotionPage): Event {
  const p = page.properties;
  const id = read.richText(p['EventoID']) || page.id;
  // Merge Notion-hosted files + legacy JSON URL array
  const notionFiles = read.allFiles(p['ImagenesFiles']);
  const legacyUrls  = safeJson<string[]>(read.richText(p['ImagenesURL']), []);
  const image_urls  = notionFiles.length ? notionFiles : legacyUrls;

  // Video: prefer Notion-hosted file, fall back to embed URL
  const video_url = read.files(p['VideoFile']) || read.url(p['VideoURL']) || undefined;

  return {
    id,
    title:       read.title(p['Titulo']),
    description: read.richText(p['Descripcion']),
    date:        read.dateStart(p['Fecha']),
    end_date:    read.dateStart(p['FechaFin']) || undefined,
    location:    read.richText(p['Ubicacion']) || undefined,
    image_urls,
    video_url,
    agenda:      read.richText(p['Agenda']),
    created_at:  page.created_time,
  };
}

function eventToProps(event: Event): Record<string, unknown> {
  // Separate pending file-upload refs from real URLs
  const imageUploads: Array<{ id: string; name: string }> = [];
  const imageUrls:    string[] = [];
  event.image_urls.forEach((v, i) => {
    const ref = decodeNotionFileRef(v);
    if (ref) imageUploads.push({ id: ref.fileUploadId, name: `imagen_${i}` });
    else if (v) imageUrls.push(v);
  });

  const videoRef = decodeNotionFileRef(event.video_url ?? '');

  return {
    Titulo:      build.title(event.title),
    EventoID:    build.richText(event.id),
    Descripcion: build.richText(event.description),
    Fecha:       build.date(event.date),
    FechaFin:    build.date(event.end_date ?? ''),
    Ubicacion:   build.richText(event.location ?? ''),
    ImagenesURL: build.richText(JSON.stringify(imageUrls)),
    ...(imageUploads.length
      ? { ImagenesFiles: build.fileUploads(imageUploads) }
      : {}
    ),
    ...(videoRef
      ? { VideoFile: build.fileUpload(videoRef.fileUploadId, 'video'), VideoURL: build.url('') }
      : { VideoURL: build.url(event.video_url ?? '') }
    ),
    Agenda:      build.richText(event.agenda),
    Activo:      build.checkbox(true),
  };
}

export async function fetchEventsFromNotion(): Promise<Event[]> {
  const pages = await queryDatabase(DB.EVENTOS, {
    property: 'Activo',
    checkbox: { equals: true },
  });
  const events: Event[] = [];
  for (const page of pages) {
    if (page.archived) continue;
    const event = pageToEvent(page);
    _eventPageIds[event.id] = page.id;
    events.push(event);
  }
  return events;
}

export async function upsertEventInNotion(event: Event): Promise<void> {
  const pageId = _eventPageIds[event.id];
  if (pageId) {
    await updatePage(pageId, eventToProps(event));
  } else {
    const page = await createPage(DB.EVENTOS, eventToProps(event));
    _eventPageIds[event.id] = page.id;
  }
}

export async function deleteEventInNotion(eventId: string): Promise<void> {
  const pageId = _eventPageIds[eventId];
  if (!pageId) return;
  await archivePage(pageId);
  delete _eventPageIds[eventId];
}

// ═══════════════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════════════

function pageToSectionRaw(page: NotionPage): Omit<Section, 'lessons'> {
  const p = page.properties;
  return {
    id:       read.richText(p['SeccionID']) || page.id,
    title:    read.title(p['Titulo']),
    courseId: read.richText(p['CursoID']),
    orden:    read.number(p['Orden']),
  };
}

function sectionToProps(s: Omit<Section, 'lessons'>): Record<string, unknown> {
  return {
    Titulo:    build.title(s.title),
    SeccionID: build.richText(s.id),
    CursoID:   build.richText(s.courseId),
    Orden:     build.number(s.orden),
    Activo:    build.checkbox(true),
  };
}

export async function fetchSectionsFromNotion(courseId?: string): Promise<Omit<Section, 'lessons'>[]> {
  const filter = courseId
    ? { property: 'CursoID', rich_text: { equals: courseId } }
    : { property: 'Activo', checkbox: { equals: true } };
  const pages = await queryDatabase(DB.SECCIONES, filter, [{ property: 'Orden', direction: 'ascending' }]);
  const result: Omit<Section, 'lessons'>[] = [];
  for (const page of pages) {
    if (page.archived) continue;
    const s = pageToSectionRaw(page);
    _sectionPageIds[s.id] = page.id;
    result.push(s);
  }
  return result;
}

export async function upsertSectionInNotion(s: Omit<Section, 'lessons'>): Promise<void> {
  const pageId = _sectionPageIds[s.id];
  if (pageId) {
    await updatePage(pageId, sectionToProps(s));
  } else {
    const page = await createPage(DB.SECCIONES, sectionToProps(s));
    _sectionPageIds[s.id] = page.id;
  }
}

export async function deleteSectionInNotion(sectionId: string): Promise<void> {
  const pageId = _sectionPageIds[sectionId];
  if (!pageId) return;
  await archivePage(pageId);
  delete _sectionPageIds[sectionId];
}

// ═══════════════════════════════════════════════════════════════
// LESSONS
// ═══════════════════════════════════════════════════════════════

function pageToLesson(page: NotionPage): Lesson {
  const p = page.properties;
  // Prefer Notion-hosted file for video; fall back to embed URL
  const videoUrl = read.files(p['VideoFile']) || read.url(p['VideoURL']) || undefined;
  return {
    id:          read.richText(p['LeccionID']) || page.id,
    title:       read.title(p['Titulo']),
    sectionId:   read.richText(p['SeccionID']),
    courseId:    read.richText(p['CursoID']),
    type:        (read.select(p['Tipo']) || 'video') as Lesson['type'],
    videoUrl,
    description: read.richText(p['Descripcion']) || undefined,
    duration:    read.richText(p['Duracion']),
    orden:       read.number(p['Orden']),
  };
}

function lessonToProps(l: Lesson): Record<string, unknown> {
  const ref = decodeNotionFileRef(l.videoUrl ?? '');
  return {
    Titulo:      build.title(l.title),
    LeccionID:   build.richText(l.id),
    SeccionID:   build.richText(l.sectionId),
    CursoID:     build.richText(l.courseId),
    Tipo:        build.select(l.type),
    ...(ref
      ? { VideoFile: build.fileUpload(ref.fileUploadId, 'video'), VideoURL: build.url('') }
      : { VideoURL:  build.url(l.videoUrl ?? ''), VideoFile: build.externalFile('') }
    ),
    Descripcion: build.richText(l.description ?? ''),
    Duracion:    build.richText(l.duration),
    Orden:       build.number(l.orden),
    Activo:      build.checkbox(true),
  };
}

export async function fetchLessonsFromNotion(courseId?: string): Promise<Lesson[]> {
  const filter = courseId
    ? { property: 'CursoID', rich_text: { equals: courseId } }
    : { property: 'Activo', checkbox: { equals: true } };
  const pages = await queryDatabase(DB.LECCIONES, filter, [{ property: 'Orden', direction: 'ascending' }]);
  const result: Lesson[] = [];
  for (const page of pages) {
    if (page.archived) continue;
    const l = pageToLesson(page);
    _lessonPageIds[l.id] = page.id;
    result.push(l);
  }
  return result;
}

export async function upsertLessonInNotion(l: Lesson): Promise<void> {
  const pageId = _lessonPageIds[l.id];
  if (pageId) {
    await updatePage(pageId, lessonToProps(l));
  } else {
    const page = await createPage(DB.LECCIONES, lessonToProps(l));
    _lessonPageIds[l.id] = page.id;
  }
}

export async function deleteLessonInNotion(lessonId: string): Promise<void> {
  const pageId = _lessonPageIds[lessonId];
  if (!pageId) return;
  await archivePage(pageId);
  delete _lessonPageIds[lessonId];
}

/** Fetch full sections with nested lessons for a course. */
export async function fetchCourseContent(courseId: string): Promise<Section[]> {
  const [rawSections, lessons] = await Promise.all([
    fetchSectionsFromNotion(courseId),
    fetchLessonsFromNotion(courseId),
  ]);
  return rawSections.map(s => ({
    ...s,
    lessons: lessons
      .filter(l => l.sectionId === s.id)
      .sort((a, b) => a.orden - b.orden),
  }));
}

// ═══════════════════════════════════════════════════════════════
// FAQs
// ═══════════════════════════════════════════════════════════════

function pageToFaq(page: NotionPage): FAQ {
  const p = page.properties;
  return {
    id:    page.id,
    q:     read.title(p['Pregunta']),
    a:     read.richText(p['Respuesta']),
    orden: read.number(p['Orden']),
  };
}

function faqToProps(faq: FAQ, orden: number): Record<string, unknown> {
  return {
    Pregunta:  build.title(faq.q),
    Respuesta: build.richText(faq.a),
    Orden:     build.number(orden),
    Activo:    build.checkbox(true),
  };
}

export async function fetchFAQsFromNotion(): Promise<FAQ[]> {
  const pages = await queryDatabase(
    DB.FAQS,
    { property: 'Activo', checkbox: { equals: true } },
    [{ property: 'Orden', direction: 'ascending' }],
  );
  const result: FAQ[] = [];
  for (const page of pages) {
    if (page.archived) continue;
    const f = pageToFaq(page);
    _faqPageIds[f.id] = page.id;
    result.push(f);
  }
  return result;
}

export async function upsertFAQInNotion(faq: FAQ, orden: number): Promise<string> {
  const pageId = _faqPageIds[faq.id];
  if (pageId) {
    await updatePage(pageId, faqToProps(faq, orden));
    return pageId;
  } else {
    const page = await createPage(DB.FAQS, faqToProps(faq, orden));
    _faqPageIds[faq.id] = page.id;
    _faqPageIds[page.id] = page.id; // also index by real notion id
    return page.id;
  }
}

export async function deleteFAQInNotion(faqId: string): Promise<void> {
  const pageId = _faqPageIds[faqId];
  if (!pageId) return;
  await archivePage(pageId);
  delete _faqPageIds[faqId];
}

/** Sync full FAQ list to Notion (upsert existing, archive removed). */
export async function syncFAQsToNotion(faqs: FAQ[], prevIds: string[]): Promise<void> {
  // Upsert all current
  await Promise.all(faqs.map((f, i) => upsertFAQInNotion(f, i + 1).catch(console.error)));
  // Archive removed
  const currentIds = new Set(faqs.map(f => f.id));
  await Promise.all(
    prevIds
      .filter(id => !currentIds.has(id))
      .map(id => deleteFAQInNotion(id).catch(console.error))
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME CONFIG
// ═══════════════════════════════════════════════════════════════

// ConfigHome stores one row per "property key":
//  hero_badge, hero_title, hero_subtitle, hero_btn1, hero_btn2,
//  logo_url,
//  feature_1_title, feature_1_desc, feature_1_color, feature_1_icon,
//  feature_2_*, feature_3_*

const HOME_DEFAULT: HomeConfig = {
  hero: {
    badge: 'Plataforma Web3 + IA',
    title: 'Key Lab Academy',
    subtitle: 'Desbloquea el futuro de la tecnología. Aprende blockchain, Web3 e IA con expertos de la industria.',
    btn1: 'Ver eventos →',
    btn2: 'Explorar cursos',
  },
  logoUrl: '',
  features: [
    { icon: 'zap',   title: 'Aprende con expertos',   description: 'Workshops y eventos en vivo con referentes de Web3, blockchain e IA.', color: 'from-amber-400 to-orange-500' },
    { icon: 'users', title: 'Comunidad activa',        description: 'Conecta con builders, inversores y creadores del ecosistema descentralizado.', color: 'from-sky-400 to-cyan-500' },
    { icon: 'book',  title: 'Cursos & recursos',       description: 'Desde Solidity básico hasta auditorías de contratos. A tu ritmo, desde cero.', color: 'from-indigo-400 to-violet-500' },
  ],
};

/** Parse a flat map of { prop → value } into a HomeConfig. */
function rowsToHomeConfig(rows: Record<string, string>): HomeConfig {
  return {
    hero: {
      badge:    rows['hero_badge']    ?? HOME_DEFAULT.hero.badge,
      title:    rows['hero_title']    ?? HOME_DEFAULT.hero.title,
      subtitle: rows['hero_subtitle'] ?? HOME_DEFAULT.hero.subtitle,
      btn1:     rows['hero_btn1']     ?? HOME_DEFAULT.hero.btn1,
      btn2:     rows['hero_btn2']     ?? HOME_DEFAULT.hero.btn2,
    },
    logoUrl: rows['logo_url'] ?? '',
    features: [1, 2, 3].map(i => ({
      icon:        rows[`feature_${i}_icon`]  ?? HOME_DEFAULT.features[i-1]?.icon  ?? '',
      title:       rows[`feature_${i}_title`] ?? HOME_DEFAULT.features[i-1]?.title ?? '',
      description: rows[`feature_${i}_desc`]  ?? HOME_DEFAULT.features[i-1]?.description ?? '',
      color:       rows[`feature_${i}_color`] ?? HOME_DEFAULT.features[i-1]?.color ?? '',
    })),
  };
}

export async function fetchHomeConfigFromNotion(): Promise<HomeConfig> {
  const pages = await queryDatabase(DB.CONFIG_HOME);
  if (!pages.length) return HOME_DEFAULT;

  const rows: Record<string, string> = {};
  for (const page of pages) {
    if (page.archived) continue;
    const p = page.properties;
    const key = read.title(p['Propiedad']);
    // Prefer Notion-hosted file, then URL field, then text Valor
    const val = read.files(p['MediaFile']) || read.url(p['ImagenURL']) || read.richText(p['Valor']);
    _homePageIds[key] = page.id;
    rows[key] = val;
  }
  return rowsToHomeConfig(rows);
}

/** Write all home config props to Notion (upsert each row by key). */
export async function saveHomeConfigToNotion(cfg: HomeConfig): Promise<void> {
  const rows: Record<string, string> = {
    hero_badge:     cfg.hero.badge,
    hero_title:     cfg.hero.title,
    hero_subtitle:  cfg.hero.subtitle,
    hero_btn1:      cfg.hero.btn1,
    hero_btn2:      cfg.hero.btn2,
    logo_url:       cfg.logoUrl ?? '',
  };
  cfg.features.forEach((f, i) => {
    rows[`feature_${i+1}_title`] = f.title;
    rows[`feature_${i+1}_desc`]  = f.description;
    rows[`feature_${i+1}_color`] = f.color;
    rows[`feature_${i+1}_icon`]  = f.icon;
  });

  await Promise.all(
    Object.entries(rows).map(async ([key, value]) => {
      const ref = decodeNotionFileRef(value);
      let props: Record<string, unknown>;
      if (ref) {
        // Notion-hosted file upload
        props = {
          Propiedad:  build.title(key),
          MediaFile:  build.fileUpload(ref.fileUploadId, key),
          ImagenURL:  build.url(''),
          Valor:      build.richText(''),
        };
      } else if (key === 'logo_url' && value.startsWith('http')) {
        props = {
          Propiedad: build.title(key),
          ImagenURL: build.url(value),
          Valor:     build.richText(''),
          MediaFile: build.externalFile(''),
        };
      } else {
        props = {
          Propiedad: build.title(key),
          Valor:     build.richText(value),
          ImagenURL: build.url(''),
          MediaFile: build.externalFile(''),
        };
      }

      const pageId = _homePageIds[key];
      if (pageId) {
        await updatePage(pageId, props);
      } else {
        const page = await createPage(DB.CONFIG_HOME, props);
        _homePageIds[key] = page.id;
      }
    })
  );
}

// ═══════════════════════════════════════════════════════════════
// FULL SYNC  (Notion → localStorage)
// ═══════════════════════════════════════════════════════════════

export interface SyncResult {
  users: UserRecord[];
  courses: Course[];
  events: Event[];
  homeConfig?: HomeConfig;
  faqs?: FAQ[];
}

export async function syncFromNotion(): Promise<SyncResult> {
  const [users, courses, events, homeConfig, faqs] = await Promise.all([
    fetchUsersFromNotion(),
    fetchCoursesFromNotion(),
    fetchEventsFromNotion(),
    fetchHomeConfigFromNotion().catch(() => undefined),
    fetchFAQsFromNotion().catch(() => undefined),
  ]);
  return { users, courses, events, homeConfig, faqs };
}

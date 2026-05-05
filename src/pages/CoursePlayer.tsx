import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Play, FileText, HelpCircle, CheckCircle,
  ChevronDown, Trophy, Lock, Menu, X, Loader2,
} from 'lucide-react';
import { fetchCourseContent } from '../lib/notionService';
import { getCourseContent, getCourses } from '../lib/contentStore';
import { getDisplayUrl } from '../lib/notionDB';
import type { Section, Lesson } from '../lib/courseTypes';

// ─── Progress helpers ─────────────────────────────────────────────

const STORAGE_KEY = (courseId: string) => `keylab_progress_${courseId}`;

function loadProgress(courseId: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(courseId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress(courseId: string, completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY(courseId), JSON.stringify([...completed]));
}

// ─── useCourseContent ─────────────────────────────────────────────

function useCourseContent(courseId: string | undefined) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!courseId) { setLoading(false); return; }
    // 1. Show cached data immediately
    const cached = getCourseContent();
    if (cached[courseId]?.length) {
      setSections(cached[courseId]);
      setLoading(false);
    }
    // 2. Fetch fresh from Notion
    try {
      const fresh = await fetchCourseContent(courseId);
      if (fresh.length) setSections(fresh);
    } catch (e) {
      console.warn('[CoursePlayer] Could not fetch content from Notion:', e);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  return { sections, loading };
}

// ─── Lesson icon ─────────────────────────────────────────────────

function LessonIcon({ type, done }: { type: Lesson['type']; done: boolean }) {
  if (done) return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
  if (type === 'video') return <Play className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
  if (type === 'text')  return <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
  return <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
}

// ─── Sidebar ──────────────────────────────────────────────────────

function CourseSidebar({
  sections,
  currentId,
  completed,
  onSelect,
}: {
  sections: Section[];
  currentId: string;
  completed: Set<string>;
  onSelect: (lesson: Lesson) => void;
}) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id)),
  );

  // Re-open new sections when content loads
  useEffect(() => {
    setOpenSections(new Set(sections.map(s => s.id)));
  }, [sections]);

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="h-full overflow-y-auto">
      {sections.map((section, si) => (
        <div key={section.id} className="border-b border-gray-100 last:border-0">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium mb-0.5">Sección {si + 1}</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight">{section.title}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform ${
              openSections.has(section.id) ? 'rotate-180' : ''
            }`} />
          </button>

          {openSections.has(section.id) && (
            <ul className="pb-1">
              {section.lessons.map(lesson => {
                const isActive = lesson.id === currentId;
                const isDone   = completed.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <button
                      onClick={() => onSelect(lesson)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition group ${
                        isActive ? 'bg-sky-50 border-r-2 border-sky-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <LessonIcon type={lesson.type} done={isDone} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-tight line-clamp-2 ${
                          isActive ? 'font-semibold text-sky-700'
                          : isDone  ? 'text-gray-500'
                          : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{lesson.duration}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function CoursePlayer() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const courses  = getCourses();
  const course   = courses.find(c => c.id === id);
  const { sections, loading } = useCourseContent(id);
  const allLessons = sections.flatMap(s => s.lessons);

  const [completed, setCompleted] = useState<Set<string>>(
    id ? loadProgress(id) : new Set(),
  );
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  // Set first lesson once sections load
  useEffect(() => {
    if (allLessons.length && !currentLesson) {
      setCurrentLesson(allLessons[0]);
    }
  }, [allLessons.length]); // eslint-disable-line

  useEffect(() => {
    if (id) saveProgress(id, completed);
  }, [completed, id]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <Lock className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">Curso no encontrado.</p>
        <Link to="/courses" className="text-sky-500 hover:underline text-sm">← Volver a cursos</Link>
      </div>
    );
  }

  const totalLessons   = allLessons.length;
  const completedCount = completed.size;
  const progress       = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isFinished     = completedCount === totalLessons && totalLessons > 0;

  function markComplete(lessonId: string) {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });
    const idx = allLessons.findIndex(l => l.id === lessonId);
    if (idx >= 0 && idx < allLessons.length - 1) {
      setTimeout(() => setCurrentLesson(allLessons[idx + 1]), 400);
    }
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-30">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <button onClick={() => navigate('/courses')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mr-1">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium">Key Lab Academy</p>
          <p className="text-sm font-bold text-gray-900 truncate">{course.title}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">{completedCount}/{totalLessons} lecciones</p>
            <p className="text-xs font-bold text-sky-600">{progress}% completado</p>
          </div>
          <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          {isFinished && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5" /> ¡Completado!
            </div>
          )}
        </div>
        <button onClick={() => setSidebarOpen(v => !v)}
          className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile progress */}
      <div className="sm:hidden h-1 bg-gray-100 shrink-0">
        <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content panel */}
        <div className="flex-1 overflow-y-auto bg-gray-950 flex flex-col">
          {loading && !currentLesson ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Cargando contenido del curso…</p>
            </div>
          ) : currentLesson ? (
            <div className="flex flex-col h-full">
              {/* Video */}
              {currentLesson.type === 'video' && currentLesson.videoUrl ? (
                <div className="bg-black w-full">
                  {getDisplayUrl(currentLesson.videoUrl).match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                    <video
                      key={currentLesson.id}
                      src={getDisplayUrl(currentLesson.videoUrl)}
                      controls
                      className="w-full aspect-video"
                    />
                  ) : (
                    <div className="aspect-video">
                      <iframe
                        key={currentLesson.id}
                        src={getDisplayUrl(currentLesson.videoUrl)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={currentLesson.title}
                      />
                    </div>
                  )}
                </div>
              ) : currentLesson.type === 'quiz' ? (
                <div className="w-full aspect-video bg-gradient-to-br from-amber-900/30 to-orange-900/30 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-lg font-bold text-white">Quiz</p>
                </div>
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-indigo-900/30 to-sky-900/30 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-lg font-bold text-white">Lectura</p>
                </div>
              )}

              {/* Details */}
              <div className="flex-1 bg-white p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{currentLesson.title}</h2>
                    <span className="text-xs text-gray-400 shrink-0 pt-1">{currentLesson.duration}</span>
                  </div>

                  {currentLesson.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">{currentLesson.description}</p>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        const idx = allLessons.findIndex(l => l.id === currentLesson.id);
                        if (idx > 0) setCurrentLesson(allLessons[idx - 1]);
                      }}
                      disabled={allLessons[0]?.id === currentLesson.id}
                      className="px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>

                    <button
                      onClick={() => markComplete(currentLesson.id)}
                      disabled={completed.has(currentLesson.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
                        completed.has(currentLesson.id)
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white hover:opacity-90 shadow-md shadow-indigo-200'
                      }`}
                    >
                      {completed.has(currentLesson.id)
                        ? <><CheckCircle className="w-4 h-4" /> Completada</>
                        : <>Marcar completada ✓</>}
                    </button>

                    <button
                      onClick={() => {
                        markComplete(currentLesson.id);
                        const idx = allLessons.findIndex(l => l.id === currentLesson.id);
                        if (idx < allLessons.length - 1) setCurrentLesson(allLessons[idx + 1]);
                      }}
                      disabled={allLessons[allLessons.length - 1]?.id === currentLesson.id}
                      className="px-4 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Siguiente →
                    </button>
                  </div>

                  {isFinished && (
                    <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                      <Trophy className="w-10 h-10 text-amber-500 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900">¡Felicidades! Completaste el curso</p>
                        <p className="text-sm text-gray-500 mt-0.5">Tu certificado estará disponible próximamente.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>
                {sections.length === 0
                  ? 'Este curso no tiene lecciones aún.'
                  : 'Selecciona una lección para comenzar'}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 border-l border-gray-200 bg-white shrink-0 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contenido del curso</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{completedCount}/{totalLessons} lecciones</span>
                  <span className="font-semibold text-sky-600">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {loading && sections.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Cargando…</span>
              </div>
            ) : (
              <CourseSidebar
                sections={sections}
                currentId={currentLesson?.id ?? ''}
                completed={completed}
                onSelect={setCurrentLesson}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

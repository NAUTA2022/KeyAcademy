import { useState, useEffect } from 'react';
import {
  Plus, Edit3, Trash2, Save, BookOpen, Download, Video, Radio, Star,
  ChevronRight, ChevronDown, GripVertical, Play, FileText, HelpCircle,
  ArrowLeft, Loader2,
} from 'lucide-react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import MediaUploadInput from '../../../components/MediaUploadInput';
import type { Course } from '../../../lib/supabase';
import type { Section, Lesson } from '../../../lib/courseTypes';

const DB_CURSOS   = 'f28aec74ae7e4ba3a465c2e15af26992';
const DB_LECCIONES = 'c638f6736ec544af96e81b18cfbe9e85';

// ─── Constants ───────────────────────────────────────────────────

const EMPTY_COURSE: Partial<Course> = {
  title: '', description: '', price: 0, category: 'Desarrollo',
  type: 'video', instructor: '', duration: '', level: 'beginner',
  image_url: '', content_url: '',
};

const CATEGORIES = ['Desarrollo', 'DeFi', 'NFT', 'Seguridad', 'Recursos', 'IA', 'Trading'];
const LEVELS: { value: Course['level']; label: string }[] = [
  { value: 'beginner',     label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio'   },
  { value: 'advanced',     label: 'Avanzado'     },
];
const TYPES: { value: Course['type']; label: string; icon: React.ElementType }[] = [
  { value: 'video',    label: 'Video',       icon: Video    },
  { value: 'download', label: 'Descargable', icon: Download },
  { value: 'live',     label: 'En vivo',     icon: Radio    },
];
const LEVEL_COLORS = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced:     'bg-red-100 text-red-700',
};
const LEVEL_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const LESSON_TYPES: { value: Lesson['type']; label: string; icon: React.ElementType }[] = [
  { value: 'video', label: 'Video',    icon: Play      },
  { value: 'text',  label: 'Lectura',  icon: FileText  },
  { value: 'quiz',  label: 'Quiz',     icon: HelpCircle },
];

// ─── Course Form ──────────────────────────────────────────────────

function CourseForm({ initial, onSave, onCancel }: {
  initial: Partial<Course>;
  onSave: (d: Partial<Course>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Course>>(initial);
  const [tab, setTab]   = useState<'info' | 'media' | 'content'>('info');

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl shadow-md overflow-hidden mb-5">
      <div className="flex border-b border-gray-100 bg-gray-50">
        {(['info', 'media', 'content'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold transition capitalize ${tab === t
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'info' ? 'Información' : t === 'media' ? 'Imagen & Precio' : 'Contenido'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Nombre del curso" />
            </div>
            <div>
              <label className="label">Descripción *</label>
              <textarea className="input h-24 resize-none" value={form.description || ''} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Instructor</label>
                <input className="input" value={form.instructor || ''} onChange={e => set('instructor', e.target.value)} placeholder="Nombre del instructor" />
              </div>
              <div>
                <label className="label">Duración</label>
                <input className="input" value={form.duration || ''} onChange={e => set('duration', e.target.value)} placeholder="8 horas / 120 páginas" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Categoría</label>
                <select className="input" value={form.category || 'Desarrollo'} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nivel</label>
                <select className="input" value={form.level || 'beginner'} onChange={e => set('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Tipo de curso</label>
              <div className="flex gap-3">
                {TYPES.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => set('type', value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                      form.type === value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div className="space-y-5">
            <MediaUploadInput
              label="Imagen de portada"
              value={form.image_url || ''}
              onChange={v => set('image_url', v)}
              mode="image"
              notionDatabaseId={DB_CURSOS}
              placeholder="https://images.unsplash.com/..."
            />
            <div>
              <label className="label">Precio (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input className="input pl-7" type="number" min="0" step="1"
                  value={form.price ?? 0} onChange={e => set('price', +e.target.value)} />
              </div>
              {(form.price ?? 0) === 0 && <p className="text-xs text-green-600 font-semibold mt-1.5">✓ Curso gratuito</p>}
              {(form.price ?? 0) > 0  && <p className="text-xs text-amber-600 font-semibold mt-1.5">★ Requiere acceso premium</p>}
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="label">URL del contenido principal (opcional)</label>
              <input className="input" value={form.content_url || ''} onChange={e => set('content_url', e.target.value)}
                placeholder="https://... (YouTube embed, PDF, ZIP, Notion, etc.)" />
              <p className="text-xs text-gray-400 mt-1.5">
                Las lecciones se gestionan desde la sección de contenido del curso.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => onSave(form)} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar curso
          </button>
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Lesson Form ──────────────────────────────────────────────────

function LessonForm({ initial, onSave, onCancel }: {
  initial: Partial<Lesson>;
  onSave: (l: Partial<Lesson>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Lesson>>(initial);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Título de la lección *</label>
          <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Ej: Introducción a Solidity" />
        </div>
        <div>
          <label className="label">Tipo</label>
          <div className="flex gap-2">
            {LESSON_TYPES.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => set('type', value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  form.type === value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Duración</label>
          <input className="input" value={form.duration || ''} onChange={e => set('duration', e.target.value)} placeholder="10:30" />
        </div>
      </div>
      {form.type === 'video' && (
        <MediaUploadInput
          label="Video"
          value={form.videoUrl || ''}
          onChange={v => set('videoUrl', v)}
          mode="video"
          notionDatabaseId={DB_LECCIONES}
          placeholder="https://www.youtube.com/embed/..."
        />
      )}
      <div>
        <label className="label">Descripción</label>
        <textarea className="input h-16 resize-none text-xs" value={form.description || ''} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
          <Save className="w-3.5 h-3.5" /> Guardar lección
        </button>
        <button onClick={onCancel} className="btn-secondary text-xs py-1.5 px-3">Cancelar</button>
      </div>
    </div>
  );
}

// ─── Section Editor ───────────────────────────────────────────────

function SectionEditor({ courseId, sections, onSave }: {
  courseId: string;
  sections: Section[];
  onSave: (sections: Section[]) => void;
}) {
  const [local, setLocal]           = useState<Section[]>(sections);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingLesson, setEditingLesson] = useState<{ sectionId: string; lesson: Partial<Lesson> | null }>({ sectionId: '', lesson: null });
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addSection() {
    if (!newSectionTitle.trim()) return;
    const s: Section = {
      id: crypto.randomUUID(),
      title: newSectionTitle.trim(),
      courseId,
      orden: local.length + 1,
      lessons: [],
    };
    const next = [...local, s];
    setLocal(next);
    onSave(next);
    setNewSectionTitle('');
    setAddingSection(false);
    setOpenSections(prev => new Set([...prev, s.id]));
  }

  function deleteSection(sectionId: string) {
    if (!confirm('¿Eliminar esta sección y todas sus lecciones?')) return;
    const next = local
      .filter(s => s.id !== sectionId)
      .map((s, i) => ({ ...s, orden: i + 1 }));
    setLocal(next);
    onSave(next);
  }

  function renameSection(sectionId: string, title: string) {
    const next = local.map(s => s.id === sectionId ? { ...s, title } : s);
    setLocal(next);
    onSave(next);
  }

  function saveLesson(sectionId: string, data: Partial<Lesson>) {
    if (!data.title?.trim()) { alert('El título es obligatorio'); return; }
    const next = local.map(s => {
      if (s.id !== sectionId) return s;
      let lessons: Lesson[];
      if (data.id) {
        lessons = s.lessons.map(l => l.id === data.id ? { ...l, ...data } as Lesson : l);
      } else {
        const newLesson: Lesson = {
          id: crypto.randomUUID(),
          title: data.title ?? '',
          sectionId,
          courseId,
          type: data.type ?? 'video',
          videoUrl: data.videoUrl,
          description: data.description,
          duration: data.duration ?? '',
          orden: s.lessons.length + 1,
        };
        lessons = [...s.lessons, newLesson];
      }
      return { ...s, lessons };
    });
    setLocal(next);
    onSave(next);
    setEditingLesson({ sectionId: '', lesson: null });
  }

  function deleteLesson(sectionId: string, lessonId: string) {
    if (!confirm('¿Eliminar esta lección?')) return;
    const next = local.map(s =>
      s.id !== sectionId ? s : {
        ...s,
        lessons: s.lessons
          .filter(l => l.id !== lessonId)
          .map((l, i) => ({ ...l, orden: i + 1 })),
      }
    );
    setLocal(next);
    onSave(next);
  }

  return (
    <div className="space-y-3">
      {local.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">Aún no hay secciones. Crea la primera.</p>
      )}

      {local.map((section, si) => (
        <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
            <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-xs font-bold text-gray-400 shrink-0">S{si + 1}</span>
            <input
              className="flex-1 text-sm font-semibold text-gray-800 bg-transparent border-0 outline-none focus:bg-white focus:border focus:border-indigo-300 focus:rounded px-1 py-0.5 transition"
              value={section.title}
              onChange={e => renameSection(section.id, e.target.value)}
            />
            <button onClick={() => toggleSection(section.id)} className="p-1 text-gray-400 hover:text-gray-700 transition">
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has(section.id) ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => deleteSection(section.id)} className="p-1 text-gray-400 hover:text-red-500 transition">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lessons */}
          {openSections.has(section.id) && (
            <div className="px-3 pb-3 pt-1.5 space-y-1.5 bg-white">
              {section.lessons.map((lesson, li) => {
                const isEditing = editingLesson.sectionId === section.id && editingLesson.lesson?.id === lesson.id;
                const LIcon = lesson.type === 'video' ? Play : lesson.type === 'text' ? FileText : HelpCircle;
                return (
                  <div key={lesson.id}>
                    {isEditing ? (
                      <LessonForm
                        initial={lesson}
                        onSave={data => saveLesson(section.id, { ...data, id: lesson.id })}
                        onCancel={() => setEditingLesson({ sectionId: '', lesson: null })}
                      />
                    ) : (
                      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition group">
                        <span className="text-xs text-gray-300 w-5 text-right shrink-0">{li + 1}</span>
                        <LIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="flex-1 text-sm text-gray-700 truncate">{lesson.title}</span>
                        <span className="text-xs text-gray-400 shrink-0">{lesson.duration}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button onClick={() => setEditingLesson({ sectionId: section.id, lesson })} className="p-1 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteLesson(section.id, lesson.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add lesson form */}
              {editingLesson.sectionId === section.id && !editingLesson.lesson?.id ? (
                <LessonForm
                  initial={{ type: 'video', sectionId: section.id, courseId }}
                  onSave={data => saveLesson(section.id, data)}
                  onCancel={() => setEditingLesson({ sectionId: '', lesson: null })}
                />
              ) : (
                <button
                  onClick={() => setEditingLesson({ sectionId: section.id, lesson: {} })}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-indigo-200 text-indigo-500 hover:bg-indigo-50 transition text-xs font-semibold mt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar lección
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add section */}
      {addingSection ? (
        <div className="flex gap-2">
          <input
            autoFocus
            className="input flex-1"
            placeholder="Título de la sección…"
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSection(); if (e.key === 'Escape') setAddingSection(false); }}
          />
          <button onClick={addSection} className="btn-primary px-3 py-2 text-xs flex items-center gap-1">
            <Save className="w-3.5 h-3.5" /> Crear
          </button>
          <button onClick={() => setAddingSection(false)} className="btn-secondary px-3 py-2 text-xs">Cancelar</button>
        </div>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition"
        >
          <Plus className="w-4 h-4" /> Nueva sección
        </button>
      )}
    </div>
  );
}

// ─── Course Content Manager (sections/lessons for one course) ─────

function CourseContentManager({ course, onBack }: { course: Course; onBack: () => void }) {
  const { courseContent, saveSections, loadCourseContent } = useAdminData();
  const [sections, setSections] = useState<Section[]>(courseContent[course.id] ?? []);
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    setLoading(true);
    loadCourseContent(course.id)
      .then(s => { setSections(s); setSaved(false); })
      .finally(() => setLoading(false));
  }, [course.id, loadCourseContent]);

  function handleSave(updated: Section[]) {
    setSections(updated);
    saveSections(course.id, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{course.title}</h2>
          <p className="text-sm text-gray-500">Gestión de secciones y lecciones</p>
        </div>
        {saved && <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">✓ Guardado</span>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando contenido de Notion…
          </div>
        ) : (
          <SectionEditor
            courseId={course.id}
            sections={sections}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}

// ─── Courses Manager ──────────────────────────────────────────────

export default function CoursesManager() {
  const { courses, saveCourse, deleteCourse } = useAdminData();
  const [editing, setEditing]           = useState<Partial<Course> | null>(null);
  const [managingContent, setManagingContent] = useState<Course | null>(null);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(courses.map(c => c.category)))];

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Todos' || c.category === filterCat;
    return matchSearch && matchCat;
  });

  function handleSave(data: Partial<Course>) {
    if (!data.title?.trim()) { alert('El título es obligatorio'); return; }
    saveCourse(data);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este curso permanentemente?')) return;
    deleteCourse(id);
  }

  const TypeIcon = ({ type }: { type: Course['type'] }) => {
    if (type === 'download') return <Download className="w-3.5 h-3.5" />;
    if (type === 'live') return <Radio className="w-3.5 h-3.5" />;
    return <Video className="w-3.5 h-3.5" />;
  };

  if (managingContent) {
    return <CourseContentManager course={managingContent} onBack={() => setManagingContent(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Cursos</h2>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} cursos en total</p>
        </div>
        <button onClick={() => setEditing(EMPTY_COURSE)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo curso
        </button>
      </div>

      {editing && (
        <CourseForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o instructor…"
            className="flex-1 bg-white px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-white px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {courses.length === 0 ? 'Aún no hay cursos. ¡Crea el primero!' : 'Sin resultados.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                {c.image_url ? (
                  <img src={c.image_url} alt="" className="w-14 h-14 object-cover rounded-xl shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl shrink-0 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{c.instructor}</span>
                    <span className="text-gray-200">·</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${LEVEL_COLORS[c.level]}`}>
                      {LEVEL_LABELS[c.level]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      <TypeIcon type={c.type} />
                      {c.type === 'video' ? 'Video' : c.type === 'download' ? 'Descargable' : 'En vivo'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      c.price === 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {c.price === 0 ? 'Gratis' : `$${c.price} USD`}
                    </span>
                    {c.price > 0 && <Star className="w-3 h-3 text-amber-400" />}
                  </div>
                </div>

                <div className="text-xs text-gray-300 hidden lg:block shrink-0 w-20 text-right">
                  {c.duration || '—'}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {/* Manage content */}
                  <button onClick={() => setManagingContent(c)}
                    title="Secciones y lecciones"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition text-xs font-semibold">
                    <BookOpen className="w-4 h-4" />
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditing(c)}
                    className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

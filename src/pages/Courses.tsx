import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, Download, Video, Star, Clock, BarChart2,
  Lock, CheckCircle, Search, Filter, ChevronLeft,
  Play, FileText, HelpCircle, Users, Sparkles, CreditCard,
} from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { getCourses, hasAccessToCourse, getCourseContent } from '../lib/contentStore';
import { getDisplayUrl } from '../lib/notionDB';
import { useUserEmail } from '../lib/useUserEmail';
import PaymentModal from '../components/PaymentModal';
import type { Course } from '../lib/supabase';

const CATEGORIES = ['Todos', 'Desarrollo', 'DeFi', 'NFT', 'Seguridad', 'Recursos'];
const LEVELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};
const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

function TypeBadge({ type }: { type: Course['type'] }) {
  if (type === 'video')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
        <Video className="w-3 h-3" /> Video
      </span>
    );
  if (type === 'download')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
        <Download className="w-3 h-3" /> Descargable
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full">
      <BookOpen className="w-3 h-3" /> En vivo
    </span>
  );
}

/* ── Course card ─────────────────────────────────────────── */
function CourseCard({ course, onSelect }: { course: Course; onSelect: () => void }) {
  const isFree = course.price === 0;
  return (
    <div
      onClick={onSelect}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      <div className="relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br from-indigo-500 to-sky-500">
        {course.image_url && (
          <img
            src={getDisplayUrl(course.image_url)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-3 left-3">
          <TypeBadge type={course.type} />
        </div>
        <div
          className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${
            isFree ? 'bg-green-500 text-white' : 'bg-white text-gray-900'
          }`}
        >
          {isFree ? 'GRATIS' : `$${course.price} USD`}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{course.category}</span>
        <h3 className="font-bold text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-sm">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[course.level]}`}>
            <BarChart2 className="w-3 h-3 inline mr-0.5" />
            {LEVELS[course.level]}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
            {course.instructor}
          </span>
          <span className="text-xs font-semibold text-sky-500">Ver curso →</span>
        </div>
      </div>
    </div>
  );
}

/* ── Course detail drawer ─────────────────────────────────── */
function CourseDrawer({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  const account = useActiveAccount();
  const userEmail = useUserEmail();
  const navigate = useNavigate();
  const [showPayment, setShowPayment]   = useState(false);
  const [defaultTab,  setDefaultTab]    = useState<'crypto' | 'card'>('crypto');
  const isFree = course.price === 0;
  const sections = getCourseContent()[course.id] ?? [];
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const hasAccess = isFree || hasAccessToCourse(userEmail, course.id);

  function handleStart() {
    if (!account) { alert('Inicia sesión para acceder al curso.'); return; }
    navigate(`/courses/${course.id}/learn`);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-4 z-10 flex items-center gap-3">
            <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition">
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>
          </div>

          {/* Hero image */}
          <div className="relative h-48 sm:h-52 bg-gradient-to-br from-indigo-500 to-sky-500 shrink-0">
            {course.image_url && (
              <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6">
              <div className="flex gap-2 mb-2">
                <TypeBadge type={course.type} />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[course.level]}`}>
                  {LEVELS[course.level]}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{course.title}</h2>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 sm:p-6 space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Clock, label: 'Duración', value: course.duration || '—' },
                { icon: BookOpen, label: 'Lecciones', value: `${totalLessons} clases` },
                { icon: Users, label: 'Nivel', value: LEVELS[course.level] },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 sm:p-3 text-center">
                  <Icon className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>

            {/* Instructor */}
            <div className="flex items-center gap-3 py-3 border-t border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {course.instructor.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Instructor</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{course.instructor}</p>
              </div>
            </div>

            {/* What's included */}
            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Lo que incluye</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {course.type === 'video' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Acceso de por vida</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {course.duration} de contenido en video</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Código fuente descargable</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Certificado de finalización</li>
                  </>
                )}
                {course.type === 'download' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Descarga inmediata en PDF/ZIP</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {course.duration}</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Actualizaciones incluidas</li>
                  </>
                )}
              </ul>
            </div>

            {/* Membership upsell for paid courses */}
            {!isFree && !hasAccess && (
              <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-900/30 to-violet-50 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Mejor con membresía
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3">
                  Con el Plan Completo ($25/mes) accedes a este y todos los cursos.
                </p>
                <Link to="/membership" onClick={onClose}
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-400 underline">
                  Ver planes de membresía →
                </Link>
              </div>
            )}

            {/* Curriculum preview */}
            {sections.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Contenido — {sections.length} secciones · {totalLessons} lecciones
                </h4>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <details key={section.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden group/sec">
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none select-none text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition">
                        {section.title}
                        <span className="text-xs text-gray-400 font-normal group-open/sec:hidden">{section.lessons.length} lecciones</span>
                        <span className="text-gray-400 transition-transform group-open/sec:rotate-90 inline-block ml-2">›</span>
                      </summary>
                      <ul className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                            {lesson.type === 'video' && <Play className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                            {lesson.type === 'text' && <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                            {lesson.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-gray-400 dark:text-gray-500">{lesson.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {!account && (
              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-lg px-3 py-2 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0" /> Inicia sesión para acceder o comprar este curso.
              </p>
            )}
          </div>

          {/* Sticky CTA */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {isFree ? 'Gratis' : `$${course.price} USD`}
              </span>
              {hasAccess && !isFree && (
                <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Tienes acceso
                </span>
              )}
            </div>

            {hasAccess ? (
              <button onClick={handleStart}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition shadow-lg"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 15px rgba(34,197,94,0.35)' }}>
                ▶ {isFree ? 'Comenzar curso gratis' : 'Continuar curso'}
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={() => { setDefaultTab('crypto'); setShowPayment(true); }}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>
                  <Sparkles className="w-4 h-4" /> Comprar con cripto (ETH/USDC)
                </button>
                <button onClick={() => { setDefaultTab('card'); setShowPayment(true); }}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #635bff, #0570de)' }}>
                  <CreditCard className="w-4 h-4" /> Comprar con tarjeta
                </button>
              </div>
            )}
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">30 días de garantía · Acceso de por vida</p>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          mode="course"
          course={course}
          defaultTab={defaultTab}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); }}
        />
      )}
    </>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Courses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [selected, setSelected] = useState<Course | null>(null);
  const allCourses = getCourses();

  const filtered = allCourses.filter((c) => {
    const matchCat = category === 'Todos' || c.category === category;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const free = filtered.filter((c) => c.price === 0);
  const paid = filtered.filter((c) => c.price > 0);

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Cursos & Recursos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Aprende Web3, blockchain y más con nuestros materiales</p>
      </div>

      {/* Membership upsell banner */}
      <div className="mb-5 sm:mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-indigo-200/30">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-75 mb-0.5">Acceso ilimitado</p>
            <p className="font-black text-base sm:text-lg leading-tight">Membresía desde $10 USD/mes</p>
            <p className="text-xs opacity-75 mt-1 hidden sm:block">Cursos + recursos + comunidad. Cripto o tarjeta.</p>
          </div>
          <Link to="/membership"
            className="shrink-0 px-4 py-2 sm:py-2.5 bg-white text-indigo-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-indigo-50 transition whitespace-nowrap">
            Ver planes →
          </Link>
        </div>
        <p className="text-xs opacity-75 mt-2 sm:hidden">Cursos + recursos + comunidad. Cripto o tarjeta.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar curso o recurso…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500"
          />
        </div>
        {/* Categorías — scroll horizontal en mobile, sin scrollbar visible */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  category === cat
                    ? 'bg-sky-500 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-300 dark:hover:border-sky-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {free.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-bold">GRATIS</span>
            Cursos gratuitos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {free.map((c) => (
              <CourseCard key={c.id} course={c} onSelect={() => setSelected(c)} />
            ))}
          </div>
        </div>
      )}

      {paid.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-bold">PREMIUM</span>
            Cursos & recursos de pago
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paid.map((c) => (
              <CourseCard key={c.id} course={c} onSelect={() => setSelected(c)} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 sm:py-20 text-gray-400 dark:text-gray-600">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No encontramos resultados para tu búsqueda.</p>
        </div>
      )}

      {selected && <CourseDrawer course={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

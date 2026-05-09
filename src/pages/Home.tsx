import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Users, ArrowRight, Zap, BookMarked } from 'lucide-react';
import { getEvents, getCourses, getHome } from '../lib/contentStore';
import { getDisplayUrl } from '../lib/notionDB';

// Icon map for feature cards configured from the admin panel
const ICON_MAP: Record<string, React.ElementType> = {
  zap:  Zap,
  users: Users,
  book: BookOpen,
  'book-open': BookOpen,
  bookopen: BookOpen,
  bookmarked: BookMarked,
  calendar: Calendar,
};

function FeatureIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name?.toLowerCase()] ?? Zap;
  return <Icon className="w-5 h-5 text-white" />;
}

export default function Home() {
  const home           = getHome();
  const { hero, logoUrl, features } = home;

  const nextEvents     = getEvents().filter(e => new Date(e.date) >= new Date()).slice(0, 2);
  const featuredCourses = getCourses().slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden min-h-[300px] sm:min-h-[400px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-700 to-sky-600" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-2/3 h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-10 right-0 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl" />
          <div className="absolute top-24 right-32 w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 450" fill="none" preserveAspectRatio="xMidYMid slice">
            <path d="M200 80 Q420 0 640 160 T920 90" stroke="white" strokeWidth="70" fill="none" strokeLinecap="round" />
            <path d="M80 280 Q300 180 520 320 T820 260" stroke="#7dd3fc" strokeWidth="55" fill="none" strokeLinecap="round" />
            <path d="M0 420 Q220 320 440 440 T750 390" stroke="#c4b5fd" strokeWidth="70" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Optional logo image — top-left inside hero */}
        {logoUrl && (
          <img
            src={getDisplayUrl(logoUrl)}
            alt="Logo"
            className="absolute top-5 left-5 h-10 object-contain z-10 drop-shadow-lg"
          />
        )}

        <div className="relative z-10 p-6 sm:p-10 pb-8 sm:pb-12 max-w-2xl">
          {hero.badge && (
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 backdrop-blur-sm border border-white/20">
              <Zap className="w-3.5 h-3.5" /> {hero.badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
            {hero.title || 'Key Lab Academy'}
          </h1>
          <p className="text-sm sm:text-lg text-white/85 mb-6 leading-relaxed">
            {hero.subtitle}
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/events" className="bg-sky-400 hover:bg-sky-500 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-full transition-colors text-sm shadow-lg shadow-sky-500/30">
              {hero.btn1 || 'Ver eventos →'}
            </Link>
            <Link to="/courses" className="bg-white/15 hover:bg-white/25 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-full transition-colors text-sm backdrop-blur-sm border border-white/20">
              {hero.btn2 || 'Explorar cursos'}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`flex sm:flex-col items-start gap-3 sm:gap-0 ${
                i < 2 ? 'sm:border-r sm:border-gray-100 dark:sm:border-gray-700 sm:pr-6' : ''
              }`}
            >
              <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center sm:mb-3 shadow-sm`}>
                <FeatureIcon name={f.icon} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming events preview */}
      {nextEvents.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" /> Próximos eventos
            </h2>
            <Link to="/events" className="text-xs sm:text-sm text-sky-500 hover:text-sky-700 font-semibold flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {nextEvents.map(ev => (
              <Link
                key={ev.id}
                to="/events"
                className="flex gap-3 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-sm transition group"
              >
                {ev.image_urls[0] && (
                  <img src={getDisplayUrl(ev.image_urls[0])} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-sky-500 font-semibold mb-0.5">
                    {new Date(ev.date).toLocaleDateString('es-MX', { month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-sky-600 transition">{ev.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ev.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> Cursos destacados
          </h2>
          <Link to="/courses" className="text-xs sm:text-sm text-sky-500 hover:text-sky-700 font-semibold flex items-center gap-1">
            Ver catálogo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {featuredCourses.map(c => (
            <Link
              key={c.id}
              to="/courses"
              className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition group"
            >
              <div className="h-32 overflow-hidden bg-gradient-to-br from-indigo-500 to-sky-500">
                {c.image_url && (
                  <img src={getDisplayUrl(c.image_url)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{c.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{c.price === 0 ? '✅ Gratis' : `$${c.price} USD`}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

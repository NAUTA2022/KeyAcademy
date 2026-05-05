import { Calendar, BookOpen, Users, Star, ArrowRight, TrendingUp } from 'lucide-react';
import { useAdminData } from '../../../contexts/AdminDataContext';

export default function Dashboard({ setSection }: { setSection: (s: string) => void }) {
  const { events, courses, users } = useAdminData();

  const premium = users.filter(u => u.plan === 'premium');
  const free    = users.filter(u => u.plan === 'free');

  const stats = [
    { label: 'Eventos',          value: events.length,  icon: Calendar, color: 'from-sky-400 to-cyan-500',    section: 'events' },
    { label: 'Cursos',           value: courses.length, icon: BookOpen, color: 'from-indigo-400 to-violet-500', section: 'courses' },
    { label: 'Usuarios free',    value: free.length,    icon: Users,    color: 'from-green-400 to-emerald-500', section: 'users' },
    { label: 'Usuarios premium', value: premium.length, icon: Star,     color: 'from-amber-400 to-orange-500',  section: 'users' },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Resumen general de Key Lab Academy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => setSection(s.section)}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow text-left group">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                {s.label} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" /> Acciones rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '+ Nuevo evento',      section: 'events',  color: 'bg-sky-50 text-sky-700 hover:bg-sky-100' },
            { label: '+ Nuevo curso',       section: 'courses', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            { label: 'Editar Home',         section: 'home',    color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
            { label: 'Gestionar usuarios',  section: 'users',   color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
          ].map(a => (
            <button key={a.label} onClick={() => setSection(a.section)}
              className={`${a.color} rounded-xl px-4 py-3 text-sm font-semibold transition`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Usuarios recientes</h3>
          <button onClick={() => setSection('users')} className="text-xs text-indigo-600 font-semibold hover:underline">
            Ver todos →
          </button>
        </div>
        {recentUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Aún no hay usuarios registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Nombre', 'Correo', 'Plan', 'Registrado'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-800">{u.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      u.plan === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.plan === 'premium' ? '★ Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

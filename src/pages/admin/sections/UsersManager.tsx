import { useState } from 'react';
import {
  Search, Star, UserCheck, UserX, Edit3, ChevronDown, ChevronUp,
  X, Save, Wallet, Mail, Calendar, BookOpen, ShieldCheck, Trash2, Plus, AlertTriangle,
} from 'lucide-react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserRecord } from '../../../lib/contentStore';
import type { Course } from '../../../lib/supabase';

/* ── Grant Premium Modal ─────────────────────────────────── */
function GrantModal({ user, courses, onClose, onGrant }: {
  user: UserRecord;
  courses: Course[];
  onClose: () => void;
  onGrant: (ids: string[] | 'all') => void;
}) {
  const [mode, setMode] = useState<'all' | 'select'>('all');
  const [selected, setSelected] = useState<string[]>(
    user.enabledCourses.includes('all') ? [] : user.enabledCourses
  );

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Habilitar acceso premium</h3>
            <p className="text-xs text-gray-500 mt-0.5">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <button onClick={() => setMode('all')}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition ${
                mode === 'all'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <Star className="w-4 h-4 mx-auto mb-1" />
              Acceso completo
              <p className="text-xs font-normal mt-0.5 opacity-70">Todos los cursos actuales y futuros</p>
            </button>
            <button onClick={() => setMode('select')}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition ${
                mode === 'select'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <BookOpen className="w-4 h-4 mx-auto mb-1" />
              Cursos específicos
              <p className="text-xs font-normal mt-0.5 opacity-70">Selecciona qué cursos puede ver</p>
            </button>
          </div>

          {mode === 'select' && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {courses.filter(c => c.price > 0).map(c => (
                <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)}
                    className="w-4 h-4 text-indigo-600 rounded" />
                  {c.image_url && <img src={c.image_url} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.category} · ${c.price} USD</p>
                  </div>
                </label>
              ))}
              {courses.filter(c => c.price > 0).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No hay cursos de pago disponibles.</p>
              )}
            </div>
          )}

          {mode === 'select' && selected.length === 0 && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Selecciona al menos un curso
            </p>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={() => onGrant(mode === 'all' ? 'all' : selected)}
            disabled={mode === 'select' && selected.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Activar acceso premium
          </button>
          <button onClick={onClose} className="px-4 py-3 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Notes Modal ────────────────────────────────────── */
function NotesModal({ user, onClose, onSave }: {
  user: UserRecord;
  onClose: () => void;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(user.notes);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Notas del usuario</h3>
            <p className="text-xs text-gray-500 mt-0.5">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={5}
            placeholder="Ej: Pagó $99 el 10/04/2026 vía transferencia BBVA. Acceso completo..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
          />
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={() => onSave(notes)}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Guardar notas
          </button>
          <button onClick={onClose} className="px-4 py-3 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Add User Modal ──────────────────────────────────────── */
function AddUserModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (u: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', wallet: '', notes: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleAdd() {
    if (!form.email.trim()) { alert('El correo es obligatorio'); return; }
    onAdd({ ...form, plan: 'free', enabledCourses: [], registeredEvents: [] });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Agregar usuario manualmente</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre completo</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="María González"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo electrónico *</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="maria@ejemplo.com"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Wallet (opcional)</label>
            <input value={form.wallet} onChange={e => set('wallet', e.target.value)} placeholder="0x..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Notas internas..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handleAdd}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Agregar usuario
          </button>
          <button onClick={onClose} className="px-4 py-3 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── User Row ────────────────────────────────────────────── */
function UserRow({ user, courses, onUpdate, onDelete }: {
  user: UserRecord;
  courses: Course[];
  onUpdate: (u: UserRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded,   setExpanded]   = useState(false);
  const [grantModal, setGrantModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);

  const now = () => new Date().toISOString();

  function handleGrant(ids: string[] | 'all') {
    onUpdate({
      ...user,
      plan: 'premium',
      enabledCourses: ids === 'all' ? ['all'] : ids,
      updatedAt: now(),
    });
    setGrantModal(false);
  }

  function handleRevoke() {
    if (!confirm(`¿Revocar el acceso premium de ${user.name || user.email}?`)) return;
    onUpdate({ ...user, plan: 'free', enabledCourses: [], updatedAt: now() });
  }

  function handleSaveNotes(notes: string) {
    onUpdate({ ...user, notes, updatedAt: now() });
    setNotesModal(false);
  }

  const enabledNames = user.enabledCourses.includes('all')
    ? 'Todos los cursos'
    : user.enabledCourses.length === 0
      ? 'Ninguno'
      : user.enabledCourses
          .map(id => courses.find(c => c.id === id)?.title || id)
          .join(', ');

  return (
    <>
      {grantModal && (
        <GrantModal user={user} courses={courses} onClose={() => setGrantModal(false)} onGrant={handleGrant} />
      )}
      {notesModal && (
        <NotesModal user={user} onClose={() => setNotesModal(false)} onSave={handleSaveNotes} />
      )}

      <div className={`border-b border-gray-50 transition ${expanded ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}`}>
        {/* Main row */}
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            user.plan === 'premium'
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800 truncate">{user.name || '—'}</p>
              {user.plan === 'premium' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Premium
                </span>
              )}
              {user.plan === 'free' && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">Free</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
              {user.wallet && (
                <span className="flex items-center gap-1 font-mono">
                  <Wallet className="w-3 h-3" />{user.wallet.slice(0, 6)}…{user.wallet.slice(-4)}
                </span>
              )}
            </div>
          </div>

          {/* Registered date */}
          <div className="text-xs text-gray-400 hidden md:flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3" />
            {new Date(user.createdAt).toLocaleDateString('es-MX', { dateStyle: 'short' })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {user.plan === 'free' ? (
              <button onClick={() => setGrantModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition">
                <UserCheck className="w-3.5 h-3.5" /> Activar premium
              </button>
            ) : (
              <button onClick={handleRevoke}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition">
                <UserX className="w-3.5 h-3.5" /> Revocar
              </button>
            )}
            {user.plan === 'premium' && (
              <button onClick={() => setGrantModal(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition" title="Editar cursos">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setNotesModal(true)}
              className={`p-1.5 rounded-lg hover:bg-gray-100 transition ${user.notes ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
              title="Notas">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button onClick={() => onDelete(user.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition" title="Eliminar usuario">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Cursos habilitados</p>
              <p className="text-gray-700 text-xs leading-relaxed">{enabledNames}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Eventos registrados</p>
              <p className="text-gray-700 text-xs">{user.registeredEvents.length} evento(s)</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Notas internas</p>
              {user.notes ? (
                <p className="text-gray-700 text-xs leading-relaxed">{user.notes}</p>
              ) : (
                <p className="text-gray-400 text-xs italic">Sin notas. Haz clic en el ícono para agregar.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Users Manager ───────────────────────────────────────── */
export default function UsersManager() {
  const { users, courses, updateUser, deleteUser, addUser } = useAdminData();

  const [search,     setSearch]     = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [addModal,   setAddModal]   = useState(false);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.wallet || '').toLowerCase().includes(q);
    const matchPlan = planFilter === 'all' || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const premiumCount = users.filter(u => u.plan === 'premium').length;
  const freeCount    = users.filter(u => u.plan === 'free').length;

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este usuario permanentemente?')) return;
    deleteUser(id);
  }

  function handleAdd(data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    addUser(data);
    setAddModal(false);
  }

  return (
    <div className="space-y-5">
      {addModal && <AddUserModal onClose={() => setAddModal(false)} onAdd={handleAdd} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Agregar usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',   value: users.length,  color: 'from-indigo-400 to-violet-500', filter: 'all'     as const },
          { label: 'Free',    value: freeCount,      color: 'from-gray-400 to-gray-500',     filter: 'free'    as const },
          { label: 'Premium', value: premiumCount,   color: 'from-amber-400 to-orange-500',  filter: 'premium' as const },
        ].map(s => (
          <button key={s.label} onClick={() => setPlanFilter(s.filter)}
            className={`bg-white rounded-2xl p-4 border text-left transition ${
              planFilter === s.filter ? 'border-indigo-300 shadow-md' : 'border-gray-100 hover:shadow-sm'
            }`}>
            <div className={`w-8 h-8 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center mb-2`}>
              <Star className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o wallet…"
              className="w-full bg-white pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-lg p-1">
            {(['all', 'free', 'premium'] as const).map(f => (
              <button key={f} onClick={() => setPlanFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition capitalize ${
                  planFilter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {f === 'all' ? 'Todos' : f === 'free' ? 'Free' : 'Premium'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {users.length === 0 ? 'Aún no hay usuarios registrados.' : 'Sin resultados para tu búsqueda.'}
          </div>
        ) : (
          <div>
            {filtered.map(user => (
              <UserRow
                key={user.id}
                user={user}
                courses={courses as Course[]}
                onUpdate={updateUser}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Los cambios se guardan en Notion automáticamente. El usuario necesita recargar la página para ver el efecto.
      </p>
    </div>
  );
}

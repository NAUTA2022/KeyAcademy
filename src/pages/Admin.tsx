import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
  ShieldCheck, Calendar, BookOpen, Users, Plus, Trash2,
  Edit3, Eye, X, Save, AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MOCK_EVENTS, MOCK_COURSES } from '../lib/mockData';
import type { Event, Course, Registration } from '../lib/supabase';
import { useUserEmail, ADMIN_EMAIL } from '../lib/useUserEmail';

const ADMIN_ADDRESSES: string[] = [
  // add wallet addresses here if you also want wallet-based admin access
];

type Tab = 'events' | 'courses' | 'registrations';

/* ─── Event Form ─────────────────────────────────────────────── */
const EMPTY_EVENT: Partial<Event> = {
  title: '', description: '', date: '', location: '',
  image_urls: [], agenda: '',
};

function EventForm({ initial, onSave, onCancel }: {
  initial: Partial<Event>;
  onSave: (data: Partial<Event>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [imgInput, setImgInput] = useState('');

  function set(key: string, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addImage() {
    if (!imgInput.trim()) return;
    set('image_urls', [...(form.image_urls || []), imgInput.trim()]);
    setImgInput('');
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Título</label>
          <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Nombre del evento" />
        </div>
        <div>
          <label className="label">Fecha de inicio</label>
          <input className="input" type="datetime-local" value={form.date ? form.date.slice(0, 16) : ''} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className="label">Fecha de fin (opcional)</label>
          <input className="input" type="datetime-local" value={form.end_date ? form.end_date.slice(0, 16) : ''} onChange={e => set('end_date', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">Ubicación</label>
          <input className="input" value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Online — Zoom / Ciudad de México" />
        </div>
        <div className="col-span-2">
          <label className="label">Descripción</label>
          <textarea className="input h-24 resize-none" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Descripción del evento…" />
        </div>
        <div className="col-span-2">
          <label className="label">Agenda (una línea por bloque)</label>
          <textarea className="input h-28 resize-none font-mono text-xs" value={form.agenda || ''} onChange={e => set('agenda', e.target.value)} placeholder={"18:00 — Bienvenida\n18:15 — Talk 1\n19:00 — Q&A"} />
        </div>
        <div className="col-span-2">
          <label className="label">Video URL (opcional)</label>
          <input className="input" value={form.video_url || ''} onChange={e => set('video_url', e.target.value)} placeholder="https://www.youtube.com/embed/..." />
        </div>
        <div className="col-span-2">
          <label className="label">Imágenes</label>
          <div className="flex gap-2">
            <input className="input flex-1" value={imgInput} onChange={e => setImgInput(e.target.value)} placeholder="URL de imagen" />
            <button type="button" onClick={addImage} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(form.image_urls || []).map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                <button onClick={() => set('image_urls', form.image_urls?.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
        <button onClick={onCancel} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  );
}

/* ─── Course Form ────────────────────────────────────────────── */
const EMPTY_COURSE: Partial<Course> = {
  title: '', description: '', price: 0, category: 'Desarrollo',
  type: 'video', instructor: '', duration: '', level: 'beginner', image_url: '',
};

function CourseForm({ initial, onSave, onCancel }: {
  initial: Partial<Course>;
  onSave: (data: Partial<Course>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  function set(key: string, val: unknown) { setForm(f => ({ ...f, [key]: val })); }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Título</label>
          <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Nombre del curso" />
        </div>
        <div>
          <label className="label">Precio (USD)</label>
          <input className="input" type="number" min="0" value={form.price || 0} onChange={e => set('price', +e.target.value)} />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="video">Video</option>
            <option value="download">Descargable</option>
            <option value="live">En vivo</option>
          </select>
        </div>
        <div>
          <label className="label">Categoría</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {['Desarrollo', 'DeFi', 'NFT', 'Seguridad', 'Recursos'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Nivel</label>
          <select className="input" value={form.level} onChange={e => set('level', e.target.value)}>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>
        <div>
          <label className="label">Instructor</label>
          <input className="input" value={form.instructor || ''} onChange={e => set('instructor', e.target.value)} />
        </div>
        <div>
          <label className="label">Duración</label>
          <input className="input" value={form.duration || ''} onChange={e => set('duration', e.target.value)} placeholder="6 horas / 120 páginas" />
        </div>
        <div className="col-span-2">
          <label className="label">Descripción</label>
          <textarea className="input h-24 resize-none" value={form.description || ''} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">URL de imagen</label>
          <input className="input" value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <label className="label">URL del contenido</label>
          <input className="input" value={form.content_url || ''} onChange={e => set('content_url', e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
        <button onClick={onCancel} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  );
}

/* ─── Admin Page ─────────────────────────────────────────────── */
export default function Admin() {
  const account = useActiveAccount();
  const [tab, setTab] = useState<Tab>('events');
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS as Event[]);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES as Course[]);
  const [registrations] = useState<Registration[]>([]);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [saving, setSaving] = useState(false);

  const userEmail = useUserEmail();
  const isAdmin =
    account &&
    (userEmail === ADMIN_EMAIL ||
      ADMIN_ADDRESSES.includes(account.address.toLowerCase()));

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Inicia sesión para continuar</h2>
        <p className="text-sm text-gray-500">Necesitas conectar tu wallet de administrador.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <ShieldCheck className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Acceso restringido</h2>
        <p className="text-sm text-gray-500">Tu wallet no tiene permisos de administrador.</p>
        <p className="text-xs text-gray-400 mt-1 font-mono">{account.address}</p>
      </div>
    );
  }

  async function saveEvent(data: Partial<Event>) {
    setSaving(true);
    try {
      if (data.id) {
        await supabase.from('events').update(data).eq('id', data.id);
        setEvents(evs => evs.map(e => e.id === data.id ? { ...e, ...data } as Event : e));
      } else {
        const { data: inserted } = await supabase.from('events').insert(data).select().single();
        if (inserted) setEvents(evs => [inserted, ...evs]);
      }
      setEditingEvent(null);
    } finally { setSaving(false); }
  }

  async function deleteEvent(id: string) {
    if (!confirm('¿Eliminar este evento?')) return;
    await supabase.from('events').delete().eq('id', id);
    setEvents(evs => evs.filter(e => e.id !== id));
  }

  async function saveCourse(data: Partial<Course>) {
    setSaving(true);
    try {
      if (data.id) {
        await supabase.from('courses').update(data).eq('id', data.id);
        setCourses(cs => cs.map(c => c.id === data.id ? { ...c, ...data } as Course : c));
      } else {
        const { data: inserted } = await supabase.from('courses').insert(data).select().single();
        if (inserted) setCourses(cs => [inserted, ...cs]);
      }
      setEditingCourse(null);
    } finally { setSaving(false); }
  }

  async function deleteCourse(id: string) {
    if (!confirm('¿Eliminar este curso?')) return;
    await supabase.from('courses').delete().eq('id', id);
    setCourses(cs => cs.filter(c => c.id !== id));
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'events', label: 'Eventos', icon: Calendar, count: events.length },
    { id: 'courses', label: 'Cursos', icon: BookOpen, count: courses.length },
    { id: 'registrations', label: 'Registros', icon: Users, count: registrations.length },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Panel de Admin</h1>
          <p className="text-xs text-gray-400 font-mono">{account.address.slice(0, 6)}…{account.address.slice(-4)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && (
              <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Events tab */}
      {tab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700 text-sm">{events.length} eventos</h2>
            <button onClick={() => setEditingEvent(EMPTY_EVENT)}
              className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Nuevo evento
            </button>
          </div>

          {/* Edit form */}
          {editingEvent && (
            <div className="bg-white border border-indigo-200 rounded-2xl p-6 mb-5 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">{editingEvent.id ? 'Editar evento' : 'Nuevo evento'}</h3>
                <button onClick={() => setEditingEvent(null)}><X className="w-4 h-4 text-gray-400 hover:text-gray-700" /></button>
              </div>
              <EventForm initial={editingEvent} onSave={saveEvent} onCancel={() => setEditingEvent(null)} />
              {saving && <p className="text-xs text-sky-500 mt-2">Guardando…</p>}
            </div>
          )}

          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition">
                {ev.image_urls[0] && <img src={ev.image_urls[0]} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(ev.date).toLocaleDateString('es-MX', { dateStyle: 'medium' })} · {ev.location}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingEvent(ev)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteEvent(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses tab */}
      {tab === 'courses' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700 text-sm">{courses.length} cursos</h2>
            <button onClick={() => setEditingCourse(EMPTY_COURSE)}
              className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Nuevo curso
            </button>
          </div>

          {editingCourse && (
            <div className="bg-white border border-indigo-200 rounded-2xl p-6 mb-5 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">{editingCourse.id ? 'Editar curso' : 'Nuevo curso'}</h3>
                <button onClick={() => setEditingCourse(null)}><X className="w-4 h-4 text-gray-400 hover:text-gray-700" /></button>
              </div>
              <CourseForm initial={editingCourse} onSave={saveCourse} onCancel={() => setEditingCourse(null)} />
              {saving && <p className="text-xs text-sky-500 mt-2">Guardando…</p>}
            </div>
          )}

          <div className="space-y-3">
            {courses.map(c => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition">
                {c.image_url && <img src={c.image_url} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.category} · {c.price === 0 ? 'Gratis' : `$${c.price} USD`} · {c.type}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingCourse(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCourse(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registrations tab */}
      {tab === 'registrations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700 text-sm">Personas registradas en eventos</h2>
          </div>

          {registrations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay registros aún o configura Supabase para verlos.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Correo</th>
                    <th className="px-4 py-3 text-left">Evento</th>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Wallet</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.user_name}</td>
                      <td className="px-4 py-3 text-gray-600">{r.user_email}</td>
                      <td className="px-4 py-3 text-gray-500">{r.event_id}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString('es-MX')}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                        {r.wallet_address ? `${r.wallet_address.slice(0,6)}…${r.wallet_address.slice(-4)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${r.user_email}`} className="text-sky-500 hover:text-sky-700 transition">
                          <Eye className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
